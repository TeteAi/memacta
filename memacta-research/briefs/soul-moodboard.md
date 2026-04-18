---
feature_id: soul-moodboard
competitor_name: Soul Moodboard (Higgsfield)
memacta_name: VibeLock
researched_at: 2026-04-17
sources:
  - https://higgsfield.ai/ (product observation)
  - https://arxiv.org/abs/2308.06721 (IP-Adapter, Ye et al., 2023)
  - https://arxiv.org/abs/2404.02733 (InstantStyle, Wang et al., 2024)
  - https://arxiv.org/abs/2404.01292 (CSD — Contrastive Style Descriptors, Somepalli et al., 2024)
  - https://github.com/deepinsight/insightface (FaceID / ArcFace embeddings)
  - https://github.com/TencentARC/PhotoMaker (PhotoMaker v2)
  - https://github.com/InstantID/InstantID (InstantID)
  - https://github.com/lllyasviel/ControlNet (ControlNet)
  - https://replicate.com/ (hosted inference pricing)
  - https://fal.ai/ (hosted inference pricing)
---

# VibeLock — Clean-Room Brief

## 1. What the competitor does (public observation)

Higgsfield's **Soul Moodboard** lets a user upload a handful of reference images (3–10 typically) that represent an aesthetic "vibe" — color palette, lighting, wardrobe, set design, film-stock grain, composition. The user then generates new images/videos that inherit that vibe while swapping in a chosen subject (their own face, a character, a product). Key observable behaviors:

- Uploads are grouped into a named "Soul" / moodboard that can be reused across sessions.
- Style is extracted from references but the original content/layout is not copied verbatim (no plagiarism of source photos).
- The extracted style composes with a separate "identity lock" (face) and a text prompt.
- Outputs preserve face identity at high fidelity while matching the moodboard's lighting/palette/texture.
- Moodboards are remixable and shareable in their social feed.

## 2. Underlying techniques (public prior art)

The observable behavior is reproducible from well-documented open research. No proprietary model is required.

| Technique | What it gives us | Reference |
|---|---|---|
| **IP-Adapter** | Image-prompt conditioning for SD/SDXL via a decoupled cross-attention adapter. Feed reference images, get style/content influence without retraining. | Ye et al., arXiv:2308.06721 |
| **InstantStyle** | Injects style features only into the "style" attention blocks of SDXL, preventing content bleed from references. Solves the "my reference person shows up in the output" problem. | Wang et al., arXiv:2404.02733 |
| **CSD (Contrastive Style Descriptors)** | A CLIP-style encoder trained to embed *style* independent of content. Great for clustering a moodboard into a single style vector and measuring style similarity for retrieval/dedupe. | Somepalli et al., arXiv:2404.01292 |
| **FaceID Plus V2 / InstantID** | Identity-preserving generation from a single face photo via ArcFace embeddings + projection. | InsightFace + InstantID repos |
| **ControlNet (pose/depth/canny)** | Optional structural control so a user can lock composition while swapping vibe. | Zhang et al., lllyasviel/ControlNet |
| **PhotoMaker v2** | Alternative identity encoder, often better for multi-reference face consistency. | TencentARC/PhotoMaker |

The combination — a style embedding from a reference set + an identity embedding + a text prompt, all composed over SDXL via decoupled cross-attention — is the clean-room recipe.

## 3. Recommended clean-room stack

| Layer | Choice | Why | License / Cost | Source / Docs |
|---|---|---|---|---|
| Base diffusion model | **SDXL 1.0** | Best open image quality with broad adapter ecosystem; SD3 licensing is restrictive for commercial. | CreativeML Open RAIL++ (commercial OK) | stabilityai/stable-diffusion-xl-base-1.0 |
| Style conditioning | **InstantStyle on top of IP-Adapter-SDXL** | Style-only injection; solves content-leak from references. | Apache-2.0 | arXiv:2404.02733 |
| Style embedding for the moodboard | **CSD encoder** (ViT-L backbone) | Pool N reference images → single style vector; use for storage, retrieval, similarity dedupe. | MIT | arXiv:2404.01292 |
| Identity preservation | **FaceID Plus V2** (primary) with **InstantID** as fallback | FaceID Plus V2 composes cleanly with IP-Adapter; InstantID when stronger identity lock needed. | Apache-2.0 / MIT | h94/IP-Adapter-FaceID, InstantID/InstantID |
| Optional structure | **ControlNet-SDXL (depth, pose, canny)** | For "same composition, new vibe" use case. | Apache-2.0 | lllyasviel/sd-webui-controlnet |
| Inference host | **Replicate** (primary) or **fal.ai** (secondary) | Serverless GPU, per-second billing, already have SDXL+IP-Adapter endpoints. Avoids self-hosting A100s at MVP. | Pay-per-use ~$0.003/s A100 | replicate.com, fal.ai |
| Face detect / align | **InsightFace (buffalo_l)** | Industry standard ArcFace embeddings for face crop + 512-d identity vector. | MIT (non-commercial on some weights — use buffalo_l which is fine) | github.com/deepinsight/insightface |
| Image storage | **S3 / R2** (existing) | Already in memacta infra. | Cost-based | — |
| Vector store for style embeddings | **pgvector** on existing Postgres | Already using Prisma+Postgres; avoids a new service. | Free, OSS | pgvector/pgvector |

**Total new third-party surfaces:** one (Replicate or fal.ai). Everything else is OSS weights + Postgres + existing infra.

## 4. Implementation plan

### 4.1 Prisma deltas

```prisma
model Vibelock {
  id            String   @id @default(cuid())
  userId        String
  name          String
  coverUrl      String?
  styleVector   Unsupported("vector(768)")  // CSD embedding, pgvector
  referenceIds  String[]                    // ordered list of Asset ids
  isPublic      Boolean  @default(false)
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  user          User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  references    VibelockReference[]
  generations   Generation[]

  @@index([userId])
  @@index([isPublic, createdAt])
}

model VibelockReference {
  id          String   @id @default(cuid())
  vibelockId  String
  assetId     String
  position    Int
  // per-image CSD vector kept for dedupe / re-pooling if user removes one
  styleVector Unsupported("vector(768)")
  vibelock   Vibelock @relation(fields: [vibelockId], references: [id], onDelete: Cascade)
  asset      Asset    @relation(fields: [assetId], references: [id])

  @@unique([vibelockId, position])
  @@index([vibelockId])
}

// add to existing Generation model:
// vibelockId  String?
// vibelock    Vibelock? @relation(fields: [vibelockId], references: [id])
```

Enable pgvector: `CREATE EXTENSION IF NOT EXISTS vector;` in an init migration.

### 4.2 API endpoints (Next.js route handlers)

- `POST   /api/vibelock` — create empty VibeLock (name).
- `POST   /api/vibelock/[id]/references` — attach uploaded Asset ids; kicks off `embed-vibelock` job.
- `DELETE /api/vibelock/[id]/references/[refId]` — remove a reference; re-pool style vector.
- `GET    /api/vibelock` — list user's VibeLocks (paginated).
- `GET    /api/vibelock/[id]` — detail (references, cover, vector id).
- `PATCH  /api/vibelock/[id]` — rename, set cover, toggle `isPublic`.
- `DELETE /api/vibelock/[id]` — soft-delete + cascade.
- `POST   /api/generate` — extend existing endpoint with optional `{ vibelockId, facePhotoAssetId, controlnet?: {...} }` body.

### 4.3 UI routes / components

- `app/vibelock/page.tsx` — grid of user's VibeLocks (cover tile + name + ref count).
- `app/vibelock/new/page.tsx` — drag-and-drop uploader (3–10 images), name input.
- `app/vibelock/[id]/page.tsx` — detail view, manage references, "Generate with this VibeLock" CTA.
- `app/generate/page.tsx` — extend existing generate form: VibeLock picker dropdown (fuchsia-pink gradient chips per the memacta palette), face photo picker, prompt box.
- Components: `VibeLockCard`, `VibeLockUploader`, `VibeLockPicker`, `ReferenceThumbGrid`.

### 4.4 Async jobs (existing queue — e.g. Inngest / BullMQ)

- `embed-vibelock`: on new references
  1. For each reference image: run CSD encoder → 768-d vector.
  2. Pool per-image vectors via L2-normalized mean → VibeLock.styleVector.
  3. Select highest-variance image as `coverUrl`.
  4. Persist.
- `generate-with-vibelock`: triggered by `/api/generate` when `vibelockId` set
  1. Load VibeLock style vector + reference image URLs.
  2. Load face photo → InsightFace buffalo_l → ArcFace embedding.
  3. Call Replicate: SDXL + InstantStyle (images = references) + FaceID Plus V2 (embedding = face) + prompt.
  4. Optional ControlNet pass if structural lock requested.
  5. Write output Asset, link Generation → VibeLock.

### 4.5 `lib/ai/` adapter changes

- Add `lib/ai/providers/replicate.ts` (if not present) with typed `generateWithStyleAndIdentity(params)` wrapping the SDXL+InstantStyle+FaceID Plus V2 pipeline id.
- Add `lib/ai/embeddings/csd.ts` — wraps CSD inference endpoint (hosted on Replicate or a small self-hosted CPU/GPU worker).
- Add `lib/ai/embeddings/face.ts` — wraps InsightFace (can run on small GPU or CPU ~1s per face).
- Extend `lib/ai/pipeline.ts` (the 5-agent pipeline) so the **style agent** consumes `vibelockId` when present, short-circuiting its own style-from-prompt heuristic.

## 5. Cost & time estimate

**Engineering time (one senior full-stack + partial ML):**
- Prisma + migrations + pgvector: 0.5 day
- Upload + embed pipeline + CSD integration: 2 days
- Generation pipeline integration (InstantStyle + FaceID Plus V2 wiring on Replicate): 2 days
- UI (create, list, detail, picker): 2 days
- QA + moderation hooks + rate limiting: 1 day
- **Total: ~7.5 engineering days** (call it 2 calendar weeks with review/polish)

**Inference cost per generation (Replicate A100-40GB, ~$0.003/s):**
- SDXL + InstantStyle + FaceID Plus V2, 30 steps, 1024² image: ~8–12s → **$0.024–$0.036 / image**
- ControlNet pass adds ~3s → ~$0.009
- CSD embedding (one-time per reference upload): ~0.5s/image, ~$0.0015

**Storage:** marginal — 3–10 images per VibeLock at ~500KB each + one 768-d float32 vector (3KB) = negligible on R2.

**At 1k DAU generating 3 images/day with VibeLock:** ~$90/day in inference. Wrap in credit system already present.

## 6. Risks & open questions

- **Style-leak vs identity-leak tradeoff.** If the reference set contains faces, the model may occasionally leak reference identity. InstantStyle's style-block-only injection mitigates this strongly, but QA must include a "no face in references" detection warning.
- **CSM / NCII / face-swap abuse.** Identity-preserving generation is the classic misuse vector. Required mitigations:
  - Face in the face-photo slot must match the account holder's verified selfie (optional consent gate), or the VibeLock is flagged for review.
  - NSFW classifier on outputs (NudeNet or Replicate's built-in safety checker).
  - Celebrity/public-figure face-match blocklist on the face-photo input.
- **Copyright of references.** Users may upload film stills / copyrighted photos. Style is generally not copyrightable (per Andersen v. Stability AI pleadings, still pending), but we should:
  - Not display the references publicly when `isPublic=true` unless the user explicitly marks them as owned/licensed.
  - Add ToS clause that users represent they have rights to uploaded references.
- **IP-Adapter + FaceID Plus V2 compat on SDXL.** Requires the decoupled attention variants; not every Replicate endpoint exposes both simultaneously. We may need a custom Cog image on Replicate (+1 day).
- **Moderation latency.** CSD encoding + safety check before queuing generation adds ~2–3s UX lag. Consider optimistic UI.
- **Open:** do we expose public VibeLock remixing (social-feed feature) at launch, or gate behind a v2 ship? Recommendation: launch private-only, add `isPublic` column now, wire sharing in v2.

## 7. Verdict + justification

**Verdict: BUILD.**

Justification:
- The entire stack is OSS weights + one hosted-inference vendor (Replicate) we almost certainly already use.
- Incremental engineering cost is ~2 weeks; recurring cost scales linearly with a credit system that already exists.
- It plugs directly into memacta's 5-agent pipeline as a data source for the style agent; no architectural rework.
- It is the single highest-signal "lock-in" feature in higgsfield's UX — users who build a moodboard come back for it. Strong retention lever for memacta.
- Legal and abuse risks are real but have well-known mitigations (consent gate, NSFW filter, celeb blocklist, ToS) already present or cheap to add.
- No proprietary moat from the competitor; our differentiator is the memacta palette, the 5-agent compositor, and tighter integration with their existing library/credits.

## 8. Naming

| Role | Name |
|---|---|
| memacta UI name | **VibeLock** |
| memacta internal name (code, DB, API) | `vibelock` / `Vibelock` |
| Competitor name being replaced | Soul Moodboard (Higgsfield) |
| Third-party technical names kept as-is in code + docs | IP-Adapter, InstantStyle, CSD, LoRA, FaceID Plus V2, InstantID, PhotoMaker, ControlNet, SDXL, ArcFace, InsightFace, pgvector |

Rationale: "VibeLock" reads as a native memacta verb ("lock a vibe"), pairs with the Instagram+TikTok-coded palette, and avoids Higgsfield's quasi-spiritual "Soul" framing. It also foreshadows an "IdentityLock" sibling feature without renaming.

---
feature_id: soul-id
competitor_name: Soul ID (Higgsfield)
memacta_name: Persona
researched_at: 2026-04-17
sources:
  - https://higgsfield.ai/soul
  - https://higgsfield.ai/blog
  - https://fal.ai/models/fal-ai/flux-lora
  - https://fal.ai/models/fal-ai/flux-lora-fast-training
  - https://fal.ai/models/fal-ai/flux-pulid
  - https://fal.ai/models/fal-ai/pulid
  - https://fal.ai/models/fal-ai/ip-adapter-face-id
  - https://fal.ai/models/fal-ai/instant-id
  - https://fal.ai/models/fal-ai/face-swap
  - https://replicate.com/zsxkib/flux-pulid
  - https://replicate.com/zsxkib/instant-id
  - https://replicate.com/fofr/consistent-character
  - https://replicate.com/ostris/flux-dev-lora-trainer
  - https://replicate.com/lucataco/ip_adapter-sdxl-face
  - https://github.com/TencentARC/PhotoMaker
  - https://github.com/InstantID/InstantID
  - https://github.com/ToTheBeginning/PuLID
  - https://github.com/tencent-ailab/IP-Adapter
  - https://github.com/Gourieff/sd-webui-reactor
  - https://github.com/deepinsight/insightface
  - https://arxiv.org/abs/2401.07519
  - https://arxiv.org/abs/2404.16022
  - https://arxiv.org/abs/2308.06721
  - https://arxiv.org/abs/2208.12242
  - https://arxiv.org/abs/2106.09685
  - https://blackforestlabs.ai/announcing-flux-1-tools/
  - https://docs.fal.ai/private-serverless-models/fine-tuning
  - https://www.runpod.io/pricing
---

# Persona — Research Brief
_Competitor reference: Soul ID (Higgsfield)_

## 1. What the competitor does (public observation only)

Based on Higgsfield's public marketing pages (higgsfield.ai/soul) and posted tutorial videos:

- A user uploads roughly 3-15 reference photos of a face (their own, a model's, or an AI-generated person) and gives that identity a name.
- Higgsfield returns a reusable "Soul ID" token — a character the user can select in any future text-to-image or text-to-video prompt and get back a generation where the face matches.
- Creation turnaround is near-instant ("in seconds") for a default tier, with an implicit higher-fidelity tier that takes several minutes (public tutorials show a longer progress bar for "premium" quality).
- Consistency is preserved across camera angles, styles, outfits, and into short video clips.
- Soul IDs are stored in the user's library and mix with preset camera/lighting/style controls. Dominant UI pattern: "Soul ID + motion preset."
- Marketing positioning: "become your own AI model / influencer." This is the feature driving Higgsfield's growth.

Treat this surface behavior as the product target. Nothing below relies on inspecting their bundle, API, or internal weights.

## 2. Underlying techniques (public prior art)

1. **IP-Adapter / IP-Adapter-FaceID** (Tencent, Apache-2.0) — image prompt adapter. FaceID variant uses InsightFace ArcFace embeddings injected into cross-attention. Zero training, one reference photo, seconds-fast. arXiv:2308.06721.
2. **InstantID** (InstantX, Apache-2.0) — combines an ID embedding branch with an IdentityNet ControlNet of facial landmarks. One photo, zero training. arXiv:2401.07519.
3. **PuLID** (ByteDance, Apache-2.0) — tuning-free ID customization with contrastive alignment; works on SDXL and Flux. Current SOTA for zero-shot face ID on Flux. arXiv:2404.16022.
4. **Per-user LoRA fine-tune** (Microsoft, MIT) on DreamBooth-style data — ~15-80 MB adapter, 10-20 photos, 500-2000 steps, 10-20 minutes on A100/H100. arXiv:2106.09685 + arXiv:2208.12242.

For video identity:

5. **Frame-wise face swap** — InsightFace + ReActor/roop-derived pipelines applied frame-by-frame after base video is generated.
6. **Native ID-conditioned video** — Runway Act-One, Kling character reference, WAN / CogVideoX character-reference variants on fal.ai and Replicate. Quality varies month to month.

## 3. Recommended clean-room stack

| Layer | Choice | Why | License / cost | Source/Docs |
|---|---|---|---|---|
| Fast image identity (default) | `fal-ai/flux-pulid` | SOTA zero-shot ID on Flux.1-dev, 1 photo, ~6-10 s per image | Pay-per-call, ~$0.04-0.06 / image | https://fal.ai/models/fal-ai/flux-pulid |
| Fallback image identity | `fal-ai/pulid` (SDXL) or `fal-ai/instant-id` | Cheaper, older base, stable | Pay-per-call, ~$0.02-0.03 / image | https://fal.ai/models/fal-ai/pulid , https://fal.ai/models/fal-ai/instant-id |
| Premium identity (per-user LoRA train) | `fal-ai/flux-lora-fast-training` | 15-20 min, returns portable LoRA `.safetensors` URL | ~$2 / training run | https://fal.ai/models/fal-ai/flux-lora-fast-training |
| Inference with trained LoRA | `fal-ai/flux-lora` | Accepts our LoRA URL + trigger word, composes with ControlNet / other LoRAs | ~$0.04 / image | https://fal.ai/models/fal-ai/flux-lora |
| Replicate backup | `ostris/flux-dev-lora-trainer`, `zsxkib/flux-pulid` | Single-vendor hedge | Pay-per-call | https://replicate.com/ostris/flux-dev-lora-trainer |
| Face embedding (de-dupe + "same person?" gate) | InsightFace buffalo_l via fal.ai face-detect or RunPod container | 512-d ArcFace embedding per persona | InsightFace non-commercial; stay behind licensed API | https://github.com/deepinsight/insightface |
| Video identity (MVP) | Frame-sampled face lock via `fal-ai/face-swap` | Cheap, model-agnostic, "good enough" | Pay-per-call per swap | https://fal.ai/models/fal-ai/face-swap |
| Video identity (later) | Native character-reference video endpoints (Kling char-ref, WAN 2.2 char-ref) | Drop-in upgrade | Pay-per-call | Re-check monthly |
| Self-host path (future) | RunPod serverless A100/H100 running PuLID-Flux + flux-lora | Cut variable cost ~70% once >$300/mo | $0.69-2.89 / GPU-hour | https://www.runpod.io/pricing |
| Storage | Supabase Storage or R2 | LoRA 15-80 MB each | Included | — |

FLUX license note: FLUX.1-dev weights are non-commercial; using via fal.ai / Replicate is permitted (BFL-licensed providers). For self-host, switch to FLUX.1-schnell (Apache-2.0) or SDXL, or buy a BFL commercial license.

## 4. Implementation plan (high level)

### Data model deltas (Prisma)

```prisma
model Persona {
  id                String   @id @default(cuid())
  userId            String
  name              String
  slug              String
  triggerWord       String
  tier              PersonaTier      // INSTANT | PREMIUM
  status            PersonaStatus    // DRAFT | READY | TRAINING | FAILED
  primaryPhotoUrl   String?
  faceEmbedding     Bytes?           // 512-d ArcFace
  loraUrl           String?
  loraBaseModel     String?          // "flux-dev" | "sdxl"
  trainingJobId     String?
  trainingSteps     Int?
  coverImageUrl     String?
  moodboardImageIds String[]
  voiceId           String?          // deferred ElevenLabs slot
  stylePresetId     String?
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt
  user              User     @relation(fields: [userId], references: [id])
  photos            PersonaPhoto[]
  generations       Generation[]
  @@unique([userId, slug])
  @@index([userId, status])
}

model PersonaPhoto {
  id         String  @id @default(cuid())
  personaId  String
  url        String
  isPrimary  Boolean @default(false)
  faceBbox   Json?
  faceScore  Float?
  nsfwFlag   Boolean @default(false)
  createdAt  DateTime @default(now())
  persona    Persona @relation(fields: [personaId], references: [id], onDelete: Cascade)
}

enum PersonaTier   { INSTANT PREMIUM }
enum PersonaStatus { DRAFT READY TRAINING FAILED }
```

Add `personaId String?` to the existing `Generation` model.

### API endpoints (Next.js app router)

- `POST   /api/persona`
- `POST   /api/persona/:id/photos`
- `DELETE /api/persona/:id/photos/:photoId`
- `POST   /api/persona/:id/finalize-instant`
- `POST   /api/persona/:id/upgrade-premium`
- `POST   /api/persona/:id/preview`
- `GET    /api/persona`
- `GET    /api/persona/:id`
- `DELETE /api/persona/:id`
- `POST   /api/webhooks/fal/training`

Existing image/video endpoints gain optional `personaId`.

### UI surfaces

- `/personas` → `app/(app)/personas/page.tsx`
- `/personas/new` → `app/(app)/personas/new/page.tsx` with:
  - `components/persona/UploadStep.tsx`
  - `components/persona/NameStep.tsx`
  - `components/persona/InstantPreview.tsx`
  - `components/persona/UpgradeCta.tsx`
- `/personas/[id]` → `app/(app)/personas/[id]/page.tsx`
- `components/persona/PersonaSelector.tsx` (injected into generate panel)
- `components/persona/TrainingProgress.tsx`

Design: fuchsia-pink-orange gradient on selector; persona chip uses cyan accent on near-black per memacta palette.

### Training / one-time setup jobs

- `jobs/trainPersonaLora.ts` — zips photos, uploads to fal.ai storage, calls `fal-ai/flux-lora-fast-training` with webhook.
- Optional `jobs/refreshPersonaCovers.ts`.

### Async job orchestration

1. User clicks Upgrade → API sets `status=TRAINING`, enqueues `trainPersonaLora`.
2. Worker calls fal.ai training with `webhook_url=https://memacta.app/api/webhooks/fal/training?personaId=...` (signed JWT).
3. Webhook validates JWT, writes `loraUrl`, flips `status=READY, tier=PREMIUM`.
4. Client `TrainingProgress` uses SSE or 10 s polling.

Generation flow:
- `INSTANT` → `fal-ai/flux-pulid` with `reference_image_url=persona.primaryPhotoUrl`.
- `PREMIUM` → `fal-ai/flux-lora` with `loras=[{path: persona.loraUrl, scale: 0.9}]` and `persona.triggerWord` prepended to prompt.

### `lib/ai/` provider adapter signature changes

```ts
type IdentitySpec =
  | { kind: 'instant'; referenceImageUrl: string; strength?: number }
  | { kind: 'lora'; loraUrl: string; triggerWord: string; scale?: number };

interface ImageGenParams {
  prompt: string;
  negativePrompt?: string;
  width?: number;
  height?: number;
  seed?: number;
  identity?: IdentitySpec;
}

interface VideoGenParams extends ImageGenParams {
  durationSec: number;
  faceLock?: boolean;
  faceLockReferenceUrl?: string;
}
```

Implementations in `lib/ai/providers/fal.ts`, `lib/ai/providers/falVideo.ts`, `lib/ai/identity/faceEmbed.ts`.

## 5. Cost & time estimate

**One-time build:** 6-8 eng-days.
- D1: Prisma deltas, migration, CRUD API, storage.
- D2: Upload + face-detect + NSFW gate.
- D3: Instant tier (PuLID), preview endpoint, wizard UI.
- D4: Persona selector in generate panel + attribution.
- D5: Premium tier training job + webhook + status polling.
- D6: Video face-lock behind flag; QA.
- D7-8: Polish, purge job, analytics.

**Recurring cost (fal.ai list):**
- Persona create (instant, 4 previews): **~$0.20**.
- Upgrade to premium (one-off train): **~$2.00**.
- Image gen, instant: **~$0.04-0.06**.
- Image gen, premium: **~$0.04**.
- Video with face-lock: base video + **~$0.05** overhead.

**Quality ceiling vs Soul ID:**
- Instant tier (PuLID-Flux): **~80-88%**.
- Premium tier (Flux-LoRA, 15 photos): **~92-98%** — parity or better.
- Video with frame-wise face-swap: **~70-80%**. Upgrade target: native char-ref video.

## 6. Risks & open questions

- **InsightFace license** non-commercial. Stay behind licensed API wrappers; don't bundle weights.
- **FLUX.1-dev weights** non-commercial; self-host requires FLUX.1-schnell, SDXL, or a BFL commercial license.
- **Consent + deepfake abuse** — self-attestation checkbox, celebrity-face blocklist, EU AI Act deepfake disclosure, hard block on minors.
- **Biometric data laws** — BIPA, Texas CUBI, GDPR Art. 9 apply to face embeddings. Explicit opt-in, retention schedule (12 mo default, user-deletable), no sharing, DPIA before launch.
- **Video endpoint churn** — adapter must fall back to face-swap when providers deprecate models.
- **LoRA storage bloat** — retention: 90 days inactivity → archive; free re-train within 30 days of archive.
- **Quality drift** — silent fal endpoint changes; canary persona + nightly likeness check.
- **Open:** single persona per free user or unlimited with generation quota?
- **Open:** wire ElevenLabs voice now, or defer (this brief defers).

## 7. Verdict

**ship-now.** Wedge feature. Clean-room path is mature public prior art (all Apache-2.0 / MIT), every block is a pay-per-call fal/Replicate endpoint, week-one MVP is PuLID-Flux only, premium tier follows in a week with no schema churn. Self-host is a later cost optimization, not a blocker.

## 8. Naming

- **memacta UI name:** Persona
- **Internal name:** `persona` (Prisma model `Persona`; feature id `soul-id` kept for cross-reference)
- **Competitor name replaced:** Soul ID (Higgsfield)
- **Third-party names kept:** LoRA, IP-Adapter, InstantID, PuLID, DreamBooth, Flux, FLUX.1-dev, FLUX.1-schnell, SDXL, ControlNet, InsightFace, ArcFace, ReActor, fal.ai, Replicate, RunPod, Black Forest Labs

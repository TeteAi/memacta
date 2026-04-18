---
feature_id: character-swap-2
competitor_name: "Higgsfield Character Swap 2.0 (a.k.a. Recast)"
memacta_name: "Recast"
researched_at: 2026-04-17
sources:
  - https://higgsfield.ai/app/recast
  - https://higgsfield.ai/app/character-swap
  - https://higgsfield.ai/app/video-face-swap
  - https://higgsfield.ai/blog/AI-Face-Character-Swap-in-Video-Photo-PRO-Guide
  - https://higgsfield.ai/blog/Higgsfield-Animate-WAN-2.2-Animate
  - https://higgsfield.ai/blog/sould-id-best-character-consistency
  - https://fal.ai/models/fal-ai/wan/v2.2-14b/animate/replace
  - https://fal.ai/models/fal-ai/wan/v2.2-14b/animate/move
  - https://fal.ai/models/half-moon-ai/ai-face-swap/faceswapvideo/api
  - https://fal.ai/models/easel-ai/advanced-face-swap/api
  - https://fal.ai/models/fal-ai/pulid/api
  - https://fal.ai/models/fal-ai/flux-pulid/api
  - https://fal.ai/models/fal-ai/instant-character/api
  - https://replicate.com/cdingram/face-swap
  - https://replicate.com/xiankgx/face-swap
  - https://replicate.com/arabyai-replicate/roop_face_swap
  - https://replicate.com/wan-video/wan-2.2-animate-replace
  - https://replicate.com/zsxkib/instant-id-ipadapter-plus-face
  - https://replicate.com/collections/face-swap
  - https://instantid.github.io/
  - https://arxiv.org/html/2401.07519v1
  - https://github.com/Gourieff/ComfyUI-ReActor
  - https://github.com/deepinsight/insightface
  - https://github.com/deepinsight/insightface/issues/2469
  - https://huggingface.co/Wan-AI/Wan2.2-Animate-14B
  - https://openaccess.thecvf.com/content/ICCV2025/papers/Wang_DynamicFace_High-Quality_and_Consistent_Face_Swapping_for_Image_and_Video_ICCV_2025_paper.pdf
  - https://arxiv.org/html/2312.17681v1
  - https://arxiv.org/html/2512.07951v1
  - https://dl.acm.org/doi/10.1145/3674399.3674457
  - https://medium.com/design-bootcamp/ai-face-swap-battle-pulid-vs-instantid-vs-faceid-2f08db230509
  - https://apatero.com/blog/instantid-vs-pulid-vs-faceid-ultimate-face-swap-comparison-2025
  - https://myaiforce.com/pulid-vs-instantid-vs-faceid/
---

# Recast — Research Brief
_Competitor reference: Higgsfield Character Swap 2.0 / Recast_

Clean-room research brief. Memacta UI name is **Recast**. Feature id `character-swap-2`. Pairs with `soul-id` (persistent AI character).

## 1. What the competitor does

Higgsfield ships two related products under the "face & identity" umbrella:

- **Video Face Swap** — frame-level face-only swap on an existing video clip (higgsfield.ai/app/video-face-swap).
- **Character Swap 2.0 / Recast** — full-body character replacement in a source video: preserves original gestures, micro-expressions, hand motion, head rotation, lighting and scene; adds optional voice cloning, multilingual dubbing, and lip-sync (higgsfield.ai/app/recast).

Marketing pitch: "1-click full-body replacement with flawless gesture tracking, voice cloning, multi-language dubbing, background transformation." Higgsfield's own blog states Recast is **powered by the Wan 2.2-Animate family** (Tongyi Lab / Alibaba) with an identity-consistency layer that plugs into their Soul ID trained character (higgsfield.ai/blog/Higgsfield-Animate-WAN-2.2-Animate).

User flow:
1. Pick a trained persistent character (Soul ID).
2. Upload a source image or source video ("driver").
3. System extracts pose/skeleton/expression/lighting from source, regenerates every frame with the trained character's identity locked, composites.
4. Optional: voice-clone + redub + lip-sync.

## 2. Underlying techniques (public prior art)

### 2a. Face-only swap (cheap / fast)
- **InsightFace `inswapper_128.onnx`** — 128×128 face-swap ONNX used by every public face-swap tool. **Non-commercial research only** (github.com/deepinsight/insightface/issues/2469). Commercial use needs an InsightFace commercial license.
- **ReActor** (Gourieff) — ComfyUI/A1111 wrapper around InsightFace with GFPGAN/CodeFormer restoration. Inherits the non-commercial restriction.
- **Roop / Roop-Floyd** — same family.

### 2b. Identity-preserving diffusion (image)
- **IP-Adapter FaceID** — adapter into any SD/SDXL, prompt-flexible, ~70-80% identity similarity.
- **InstantID** — single-image zero-shot identity (arxiv 2401.07519), ~82-86% similarity.
- **PuLID / PuLID-Flux** — contrastive alignment, current public-domain identity-fidelity leader.

### 2c. Full-character swap (body/hair/outfit)
- **Character LoRA + ControlNet-OpenPose/DWPose** — canonical open-source recipe. LoRA = identity, ControlNet = pose, IP-Adapter/PuLID adds an extra anchor.
- **Wan 2.2-Animate (Alibaba Tongyi)** — end-to-end video character replacer. Skeleton extraction + facial encoding + pose retargeting + Relighting LoRA. The only public model that does full-character swap end-to-end without a hand-built LoRA stack (HuggingFace Wan-AI/Wan2.2-Animate-14B).
- **DynamicFace (ICCV 2025)** — academic video face-swap with explicit temporal losses.

### 2d. Temporal consistency in video
Per-frame swap flickers (landmark jitter → texture jitter). Public mitigations:
- Optical-flow warping + flow loss (arxiv FlowVid 2312.17681).
- Sliding-window identity inheritance ("Temporal Optimization for Face Swapping Video based on Consistency Inheritance", ACM 2024).
- Use **video-native diffusion** (Wan 2.2-Animate, DynamicFace) — temporal coherence from 3D attention, no per-frame stitching needed.
- Post-process: RIFE interpolation + GFPGAN restoration on ReActor output.

## 3. Recommended clean-room stack

Commercial-API first; self-host noted.

| Layer | Choice | Why | License/cost | Source/Docs |
|---|---|---|---|---|
| Image face-only | Replicate `cdingram/face-swap` OR fal.ai `easel-ai/advanced-face-swap` | ~$0.014/run, ~11s on A100, commercial-usable | pay-per-use | replicate.com/cdingram/face-swap |
| Image full identity | fal.ai `fal-ai/flux-pulid` + inpaint mask | PuLID is identity leader on Flux | per-call | fal.ai/models/fal-ai/flux-pulid |
| Image full-character from trained character | fal.ai `fal-ai/instant-character` | Renders persistent character in any scene; pairs with Soul ID | per-call | fal.ai/models/fal-ai/instant-character |
| Video face-only | fal.ai `half-moon-ai/ai-face-swap/faceswapvideo` OR Replicate `arabyai-replicate/roop_face_swap` (~$0.12/run) | Frame-level, OK for <15s clips | pay-per-use | fal.ai/models/half-moon-ai/ai-face-swap/faceswapvideo |
| **Video full-character (flagship)** | **fal.ai `fal-ai/wan/v2.2-14b/animate/replace`** | Same backbone Higgsfield itself uses | **$0.04 / $0.06 / $0.08 per video-second at 480p / 580p / 720p**, 16 fps | fal.ai/models/fal-ai/wan/v2.2-14b/animate/replace |
| Video motion-transfer variant | fal.ai `fal-ai/wan/v2.2-14b/animate/move` | Same backbone, "move" mode | same tier | fal.ai/models/fal-ai/wan/v2.2-14b/animate/move |
| Temporal post-proc | RIFE + GFPGAN/CodeFormer | Reduces residual flicker on cheap video path | OSS | comfyui.org/en/face-swap-revolution-with-reactor-and-rife |
| Pose conditioning (self-host) | ControlNet-OpenPose + DWPose | Standard pose driver | Apache | civitai.com/articles/2346 |
| Self-host fallback (future) | Wan2.2-Animate-14B weights on A100/H100 | Cost optimization at scale | verify HF license | huggingface.co/Wan-AI/Wan2.2-Animate-14B |
| **Explicitly avoided** | Raw InsightFace `inswapper_128` / ReActor / Roop / xiankgx unless InsightFace commercial license purchased | Weights are non-commercial research only | — | github.com/deepinsight/insightface/issues/2469 |

## 4. Implementation plan

### 4a. Prisma deltas
New model `RecastJob` (separate from generic `GenerationJob` due to video inputs + longer runtime):

```
model RecastJob {
  id             String   @id @default(cuid())
  userId         String
  user           User     @relation(fields: [userId], references: [id])
  characterId    String   // FK → SoulCharacter
  character      SoulCharacter @relation(fields: [characterId], references: [id])
  sourceType     RecastSourceType     // IMAGE | VIDEO
  sourceMediaId  String
  sourceMedia    MediaAsset @relation("RecastSource", fields: [sourceMediaId], references: [id])
  tier           RecastTier           // FACE_ONLY | FULL_CHARACTER
  provider       String               // "fal" | "replicate"
  providerModel  String               // e.g. "fal-ai/wan/v2.2-14b/animate/replace"
  providerJobId  String?
  status         JobStatus
  resultMediaId  String?
  resultMedia    MediaAsset? @relation("RecastResult", fields: [resultMediaId], references: [id])
  costCents      Int?
  durationSec    Float?
  resolution     String?              // "480p" | "580p" | "720p"
  errorMessage   String?
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt
  @@index([userId, createdAt])
  @@index([status])
}
enum RecastSourceType { IMAGE VIDEO }
enum RecastTier       { FACE_ONLY FULL_CHARACTER }
```
Add `recastJobs RecastJob[]` back-refs on `User` and `SoulCharacter`. Add `SoulCharacter.recastReady Boolean` gated on training-sample count.

### 4b. API endpoints
- `POST /api/recast/jobs` — `{characterId, sourceAssetId, tier, resolution?}`; validates ownership, credits, consent, NSFW policy; enqueues async.
- `GET /api/recast/jobs/:id` — polling, returns signed URL when ready.
- `GET /api/recast/jobs` — paginated history.
- `POST /api/recast/jobs/:id/retry` — requeue failed job with same inputs.
- `POST /api/webhooks/fal`, `POST /api/webhooks/replicate` — provider callbacks → persist result in R2/S3 (never hotlink provider URLs).

### 4c. UI routes/components
- `/recast` — landing "Drop yourself into any shot." Two tiles: Image / Video.
- `/recast/new` — wizard: (1) pick persistent character, (2) upload source, (3) pick tier `Quick Swap` vs `Full Recast`, (4) cost confirm.
- `/recast/[jobId]` — status page with poller, inline result, download, "send to library", "send to Remix".
- Components: `RecastTierSelector`, `RecastJobCard`, `RecastProgressRing`, `CharacterPickerModal` (shared with Soul ID), `MediaUploadDropzone` (shared).
- Palette per `feedback_design_palette.md`: fuchsia-pink-orange gradient CTA on near-black, cyan accent on progress ring, hot-pink chip for "Full Recast".

### 4d. Async jobs
Reuse existing queue (`lib/queue/`). New `workers/recast.ts`: picks `QUEUED`, dispatches to adapter by `{sourceType, tier}`, polls or registers webhook, uploads final to our bucket, charges credits on success, refunds on failure. Heartbeat: `RUNNING` + `updatedAt < now()-15min` → mark `FAILED` + refund.

### 4e. `lib/ai/` adapter changes
```
lib/ai/
  providers/
    fal.ts         // +runFalWanAnimateReplace, +runFalFaceSwapVideo, +runFalPulidFlux, +runFalInstantCharacter
    replicate.ts   // +runReplicateFaceSwap, +runReplicateRoopVideo
  recast/
    index.ts       // dispatchRecastJob(job) → normalized {resultUrl, billedSeconds, resolution}
    policy.ts      // tier→model routing, fallback on provider outage
    cost.ts        // pre-flight estimate shown before submit
    validation.ts  // face detection, duration/resolution caps, public-figure block
```
Normalize provider responses to `{resultUrl, thumbnailUrl, billedUnits, units: 'seconds'|'runs'}`.

## 5. Cost & time estimate

### Engineering
| Phase | Scope | Days |
|---|---|---|
| 1 Image face-only (ship-lite) | `cdingram/face-swap` adapter, `/recast` form, RecastJob model, credits | 2 |
| 2 Image full-character | PuLID-Flux + InstantCharacter routing, character picker | 2 |
| 3 Video face-only | fal `faceswapvideo` + webhook + library | 2 |
| 4 Video full-character flagship | Wan 2.2-Animate/replace adapter, resolution tiering, long-poll UI | 3 |
| 5 Temporal post-proc (optional) | RIFE + GFPGAN pass on cheap video path | 2 |
| 6 Policy/safety | Public-figure filter, consent, free-tier watermark | 2 |
| **Total** | | **~13 eng-days** |

### Per-call cost (April 2026, pass-through)
| Path | Unit cost | 10s example | Retail @ 2.5× |
|---|---|---|---|
| Image face-only (cdingram) | ~$0.014/run | $0.014 | ~$0.035 |
| Image full-char (PuLID-Flux) | per-call | ~$0.03-0.05 | ~$0.10 |
| Video face-only (fal) | per-call | varies | price by clip |
| Video full-char (Wan 2.2 Animate Replace) 480p | **$0.04/video-sec** | $0.40 | $1.00 |
| Video full-char 720p | **$0.08/video-sec** | $0.80 | $2.00 |

### Quality % vs competitor
- Image face-only: **95%** (same technique class).
- Image full-character: **85-90%** (PuLID+InstantCharacter strong; some edge lost on Higgsfield's proprietary Soul 2.0 aesthetic LoRAs, which is `soul-id`'s job).
- Video face-only: **85%** (roop-class).
- Video full-character flagship: **90-95%** — Higgsfield itself runs Wan 2.2-Animate, so calling the same model via fal.ai closes most of the gap. Residual 5-10% is Higgsfield's Relighting LoRA tuning + voice/dub integration.

## 6. Risks & open questions
1. **InsightFace weight licensing.** Third-party face-swap endpoints may internally serve `inswapper_128` which is non-commercial-only. Mitigation: prefer endpoints with explicit commercial model cards; no self-host of raw ONNX without a paid InsightFace commercial license.
2. **Deepfake / consent.** Core legal risk. Must ship: explicit upload-time consent, public-figure detector, C2PA + visible watermark on free tier, takedown flow. Legal review before launch; TX/CA/TN have AI-likeness statutes.
3. **Wan 2.2-Animate cost at 720p scale.** $0.08/s = $4.80/min. A viral user at 100 clips/day = $80/day provider cost. Mitigation: hard plan caps, default 480p, paywall 720p.
4. **Temporal flicker on cheap video path.** Per-frame swap flickers even with restoration. Mitigation: UI discloses Quick vs Full tradeoff; auto-route anything >5s to Wan tier.
5. **Source duration ceiling.** Wan 2.2-Animate practical to ~10-15s per call. Longer clips require chunk-and-stitch with boundary continuity — non-trivial. Ship 15s cap v1, chunking v2.
6. **HF weight license** on `Wan-AI/Wan2.2-Animate-14B` — verify current terms before committing to self-host.
7. **Provider lock-in.** Recast parity tracks Wan 2.2-Animate availability. Mitigation: dual-adapter (fal.ai primary, Replicate `wan-video/wan-2.2-animate-replace` fallback).
8. **Open question:** collapse "image + single-frame video" into one Image path? Probably yes.

## 7. Verdict

**ship-lite → ship-now staged.**

Justification: flagship tier is one fal.ai endpoint (`fal-ai/wan/v2.2-14b/animate/replace`) running the same model Higgsfield itself runs. Parity achievable in ~13 eng-days. Risks are real but manageable via provider selection and consent UX — no further research blocking.

Stages:
- **Week 1 (ship-lite):** Image face-only + image full-character, Soul ID character picker, watermarked free tier.
- **Week 2 (ship-now flagship):** Video full-character via Wan 2.2-Animate at 480p; 720p paid-only.
- **Week 3+:** Cheap video face-only tier, temporal post-proc, >15s chunk-and-stitch, voice-clone + dub (shared with `lipsync`).

Do **not** self-host Wan 2.2-Animate in v1 — fal.ai per-second cost is low enough that H100 infra is worse ROI than shipping more features.

## 8. Naming
- **memacta UI name:** Recast
- **Internal name:** `character-swap-2` / `RecastJob` / `RecastTier.FACE_ONLY`, `RecastTier.FULL_CHARACTER`
- **Competitor name replaced:** Higgsfield "Character Swap 2.0", Higgsfield "Recast", Higgsfield "Video Face Swap"
- **Third-party names kept as-is:** Wan 2.2-Animate, Wan2.2-Animate-14B, ControlNet, OpenPose, DWPose, PuLID, PuLID-Flux, InstantID, InstantCharacter, IP-Adapter, IP-Adapter FaceID, InsightFace, inswapper_128, ReActor, Roop, GFPGAN, CodeFormer, RIFE, DynamicFace, FlowVid

Tagline: **"Recast — drop yourself into any shot."** Premium chip: **"Full Recast"** (fuchsia→orange gradient). Cheap chip: **"Quick Swap"** (cyan).

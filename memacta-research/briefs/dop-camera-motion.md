---
featureId: dop-camera-motion
competitorName: "DoP / DoP Motion Controls (Higgsfield)"
memactaCategoryName: "CineMoves"
memactaSamplePresets: ["Slingshot Zoom", "Halo Orbit", "Elevator Drop"]
status: research-brief
author: feature-researcher
date: 2026-04-17
cleanRoom: true
budgetPosture: vendor-native-first
representsClass: "effects-library"
---

# CineMoves — memacta Camera Motion Presets (clean-room brief)
_Competitor reference: DoP / DoP Motion Controls (Higgsfield)_

> Representative brief for the **effects library** class. Pattern here generalises to Cloud Surf, On Fire, Skibidi, Mukbang and all other Higgsfield-style named effects.

## 1. Problem & user-visible outcome
Creators upload a still image and pick a named cinematic camera move (push in, crash zoom, orbit, whip pan, crane up, etc.). memacta returns a 4-10s 9:16 video of that image animated with the chosen move. Presets must feel predictable, cinematic, and brandable ("shot with Slingshot Zoom"). Competitor surface: Higgsfield positions "DoP / Camera Controls" as a library of 20+ to 56+ named moves (https://higgsfield.ai/camera-controls, https://higgsfield.ai/apps/camera-motion).

## 2. Scope
- MVP: 12 preset moves (push in/out, dolly L/R, crane up/down, orbit L/R, whip pan, tilt up/down, static), image-to-video, 5s, 720p, 9:16 default.
- v1.1: 6 signature memacta-named moves, second vendor adapter, intensity slider.
- Later: in-house Motion LoRAs, custom-move keyframe editor, CameraCtrl-style precise trajectories.

## 3. Existing solutions (all public, cited)
Competitor framing (no asset reuse): https://higgsfield.ai/camera-controls, https://higgsfield.ai/apps/camera-motion, https://higgsfield.ai/blog/Kling-2.6-Motion-Control-Full-Guide

Vendor APIs with native camera controls:
- Kling `camera_control` (6-axis int -10..10, horizontal/vertical/pan/tilt/roll/zoom, at least one non-zero): https://docs.comfy.org/built-in-nodes/partner-node/video/kwai_vgi/kling-camera-controls
- fal.ai Kling v2.1 Pro image-to-video: https://fal.ai/models/fal-ai/kling-video/v2.1/pro/image-to-video/api
- fal.ai Kling v3.0: https://fal.ai/kling-3
- fal.ai Kling 2.6 Motion Control guide: https://fal.ai/learn/devs/kling-video-2-6-motion-control-prompt-guide
- fal.ai Kling 2.6 motion control (v2v): https://fal.ai/models/fal-ai/kling-video/v2.6/standard/motion-control/api
- Runway Gen-3 Camera Control (6-axis zoom/tilt/pan/roll/horizontal/vertical, -10..10): https://help.runwayml.com/hc/en-us/articles/34926468947347-Creating-with-Camera-Control-on-Gen-3-Alpha-Turbo + keyframes https://help.runwayml.com/hc/en-us/articles/34170748696595-Creating-with-Keyframes-on-Gen-3 + API https://docs.dev.runwayml.com/api/
- Luma Dream Machine / Ray3 (named camera-motion strings + frame0/frame1 keyframes): https://docs.lumalabs.ai/docs/api + https://docs.lumalabs.ai/docs/video-generation + https://lumalabs.ai/learning-hub/how-to-use-keyframes + https://piapi.ai/blogs/luma-dream-machine-1-6-testing-camera-motion-feature-through-luma-api
- Minimax / Hailuo bracket tokens [Pan left] [Push in] [Pull out] [Zoom in/out] [Truck L/R] [Tilt up/down] [Pedestal up/down] [Tracking shot] [Static shot] [Shake], up to 3 per prompt:
  - Director: https://fal.ai/models/fal-ai/minimax/video-01-director/image-to-video/api
  - Hailuo 02 Pro: https://fal.ai/models/fal-ai/minimax/hailuo-02/pro/image-to-video
  - Hailuo 2.3 Pro: https://fal.ai/models/fal-ai/minimax/hailuo-2.3-fast/pro/image-to-video/api
- Wan 2.2 image-to-video (prompt-driven camera instructions "dolly in", "pan left", "static shot"):
  - 5B: https://fal.ai/models/fal-ai/wan/v2.2-5b/image-to-video/api
  - A14B + user LoRAs: https://fal.ai/models/fal-ai/wan/v2.2-a14b/image-to-video/lora

Motion LoRAs (open-source, self-host):
- Official guoyww motion LoRAs: https://huggingface.co/guoyww/animatediff-motion-lora-pan-right, https://huggingface.co/guoyww/animatediff-motion-lora-tilt-up, https://huggingface.co/guoyww/animatediff-motion-lora-tilt-down, https://huggingface.co/guoyww/animatediff-motion-lora-zoom-out
- Community (Cseti): https://huggingface.co/Cseti/Basic_camera_motion_LoRAs_sd15-ad2-v1, https://huggingface.co/Cseti/General_motionLoRA_32fr_sd15_ad2_v1
- AnimateDiff repo + training recipe: https://github.com/guoyww/AnimateDiff (academic-release; commercial productisation requires our own training pipeline and permissively-licensed data)
- CivitAI motion LoRAs — licence per-model: https://civitai.com/models/153022/animatediff-motion-loras ; primer https://education.civitai.com/beginners-guide-to-animatediff/

Research-grade precise control:
- CameraCtrl (Plücker-embedding pose conditioning; outperforms AnimateDiff+MotionLoRA): https://arxiv.org/abs/2404.02101 + site https://hehao13.github.io/projects-CameraCtrl/ + code https://github.com/hehao13/CameraCtrl
- MotionCtrl (predecessor, pose-param-sequence conditioning) — summarised in the CameraCtrl paper.
- Latent-Reframe (ICCV 2025, training-free camera control): https://openaccess.thecvf.com/content/ICCV2025/papers/Zhou_Latent-Reframe_Enabling_Camera_Control_for_Video_Diffusion_Models_without_Training_ICCV_2025_paper.pdf
- Boosting Camera Motion Control (BMVC 2025): https://bmva-archive.org.uk/bmvc/2025/assets/papers/Paper_753/paper.pdf

Cinematography reference:
- Runway Gen-3 camera-move primer: https://filmart.ai/runway-camera-control-runway-gen-3-camera-prompts/
- Kling camera movements guide: https://www.glbgpt.com/hub/kling-ai-camera-movements-explained
- Segmind Kling cinematic moves: https://blog.segmind.com/cinematic-ai-camera-movements-in-kling-ai-1-6-top-7-types/

## 4. Approach options

### A — Vendor-native camera params (RECOMMENDED FOR MVP)
Map memacta presets to a canonical `CameraMove` vector; per-vendor adapters translate to Kling's int-struct, Runway's 6-axis, Luma's enum, Hailuo's bracket tokens, Wan's prompt.
- Pros: zero GPU, fastest ship, vendor upgrades lift quality free, multi-vendor failover + cost arbitrage.
- Cons: expressive ceiling capped to vendor surface; vendor-locked visual style; margin paid to vendors; differentiation comes from curation, not tech.
- Cost: ~$0.05-$0.50 per clip (Wan 2.2 5B ~$0.08/sec 720p; Hailuo 2.3 Pro ~$0.49/clip).

### B — In-house Motion LoRAs (AnimateDiff or Wan-LoRA)
Train per-preset Motion LoRAs on curated licensed clip sets; serve on self-hosted GPU (ComfyUI / dedicated inference) or via fal Wan A14B-LoRA endpoint.
- Pros: real differentiation; consistent house style; lower marginal cost at scale; same recipe reused for every effect (On Fire, Cloud Surf, Mukbang…).
- Cons: ~$200+/mo GPU; needs legally-clean training corpus; 3-6 weeks per preset to prod quality; AnimateDiff tied to SD1.5 (quality ceiling lower than current Kling/Wan); AnimateDiff repo flagged academic — recheck licence before launch.

### C — Research-grade precise control (CameraCtrl / MotionCtrl / Latent-Reframe)
Condition generation on a camera-trajectory spec (Plücker embedding / pose sequence).
- Pros: highest precision; reproducible arbitrary moves; future-proof for "Director Mode".
- Cons: heaviest to productise; research-code ops burden; overkill for "pick a preset" MVP.

### Tradeoff matrix

| Axis | A — Vendor native | B — Motion LoRAs | C — CameraCtrl-class |
|---|---|---|---|
| Time-to-ship | 2-3 weeks | 2-3 months | 4-6 months |
| Upfront cost | API keys only | ~$200-500/mo GPU + data licensing | GPU + research-eng time |
| Marginal cost per clip | $0.05-0.50 | ~$0.01-0.10 self-host | ~$0.05-0.20 self-host |
| Motion precision | Medium (6-axis linear) | Medium-high (per-preset curve) | High (arbitrary trajectory) |
| Differentiation | Low | High | Very high |
| Legal surface | Clean (vendor TOS) | Medium (training data) | Medium (paper licences + data) |
| Ops burden | Low | Medium | High |
| Generalises to other effects | Partially | Yes — same recipe | Yes — same recipe |

**Recommendation:** ship **A** first for the 12-preset MVP. Start **B** in parallel for v1.1 signature presets once a ~$200-300/mo GPU line is approved. Park **C** as a 2027 paid-tier "Director Mode" differentiator.

### Generalization: applying this pattern to other effects
The point of CineMoves is that it is a **template** for every named effect in the library.

What stays the same for every effect:
- Preset registry `{id, memactaName, category, canonicalVector, promptTemplate, negativePromptTemplate, costWeight, previewUrl, durationHint}`.
- Prompt-template system splicing user content + preset tokens + style tokens into the vendor's prompt slot.
- Canonical parameter vector per effect class (CineMoves: 6-axis camera; On Fire: intensity+colour+coverage; Mukbang: food-zoom curve + chew-rate).
- Provider-adapter interface `adapter.generate(image, canonicalVector, preset) -> videoUrl`. One adapter per vendor; same interface for all effects.
- Per-preset cost weighting feeding credit accounting.
- Preset-picker UI component (grid + looping thumbs + tabs + search).
- Safety + moderation pipeline (pre-gen NSFW/celebrity, post-gen moderation).
- Library claim + branded share card.

What varies per effect:
- Prompt-token vocabulary.
- Reference / training-clip corpus (approach B).
- Motion-LoRA weights (approach B).
- Optional post-processing (e.g. flame compositor for On Fire; speed ramp for Cloud Surf; none for CineMoves).
- Default duration + aspect ratio.
- Best-fit vendor (e.g. Hailuo brackets ideal for camera moves; Wan-LoRA ideal for character effects).

Second effect costs ~20-30% of first to ship.

## 5. Recommended MVP architecture
Client preset-picker → `/api/effects/generate` (credits, moderation, adapter routing) → effects-core (preset registry, canonical vector builder, provider router with primary/fallback/cost cap) → provider adapters (kling → `fal-ai/kling-video/v2.1/pro/image-to-video`; hailuo → `fal-ai/minimax/video-01-director/image-to-video`; wan → `fal-ai/wan/v2.2-5b/image-to-video`; luma → Dream Machine keyframes; runway → Gen-3 Turbo camera_control) → job queue + webhook → R2/S3 → CDN → library claim.

Default pick order: **Hailuo Director > Kling 2.1 Pro > Wan 2.2**; Runway as premium fallback.

Preset schema draft:
```ts
type MoveVector = { horizontal: number; vertical: number; pan: number; tilt: number; roll: number; zoom: number; easing?: "linear"|"easeIn"|"easeOut"|"spring"; };
type Preset = {
  id: string; memactaName: string; category: "cinemoves";
  vector: MoveVector;
  vendorHints: Record<VendorId, { prompt: string; brackets?: string[] }>;
  costWeight: number; defaultDurationSec: number;
  previewLoopUrl: string; thumbnailUrl: string;
};
```

## 6. Naming (memacta-branded, clean-room)
- Category: **CineMoves** (replaces "DoP" / "Camera Controls"). Fallbacks: ShotKit, MoveDeck, CamDrop, LensHit.
- Sample preset names:
  1. **Slingshot Zoom** — rapid push-in, snap stop (zoom +9, easeOut, 3s)
  2. **Halo Orbit** — slow 180° orbit with slight crane-up exit (horizontal arc + vertical +2)
  3. **Elevator Drop** — static subject, camera crane-down with mild tilt-up (vertical -7, tilt +2)
- Reserve for v1.1: Shadow Creep, Runway Strut, Kick-Drop.

## 7. Risks & mitigations
- Vendor API churn → adapter isolation, nightly contract tests, pinned model versions.
- Cost blow-up → per-user daily credit cap, rate limit, `costWeight`, cheap-vendor default.
- Preset doesn't generalise across image types → per-preset "best for" metadata + safety fallback prompt + UI hint.
- NSFW / celebrity misuse → pre-gen face-match + NSFW classifier on input; post-gen moderation.
- Trademark collision → TESS search per memacta name; keep fallbacks.
- Motion-LoRA training-data licence (approach B) → licensed stock + public-domain + partner contributions; provenance ledger.
- CivitAI LoRA licence ambiguity → no CivitAI LoRA ships without per-model commercial-use check written to licence ledger.
- "Higgsfield clone" perception → signature memacta presets + vertical-first UX + TikTok share card; preset names become the lexicon.
- Aspect-ratio mismatch → adapter forces 9:16 where supported, crop+pad fallback otherwise.

## 8. Open questions for product
1. Credit model — weighted by `costWeight` vs flat? (recommend weighted)
2. Free-tier preset cap — 6 free / 6 paid at MVP?
3. Preview-thumbnail source — render our own 2s previews on stock hero image, or static icon? (recommend render)
4. Legal clearance of CineMoves + v1.1 preset names before UI copy lands.
5. GPU-budget trigger for approach B — suggest ≥$8k MRR or ≥2k daily generations.
6. Director Mode (approach C) — 2027 paid-tier item, or never?

## Appendix — Naming
- **memacta UI name (category):** CineMoves
- **Internal name:** `cinemoves` / feature id `dop-camera-motion` kept for cross-reference
- **Competitor name replaced:** DoP / Camera Controls (Higgsfield)
- **Third-party names kept as-is:** Kling, Wan, Luma, Minimax, Hailuo, Runway, AnimateDiff, Motion LoRA, CameraCtrl, MotionCtrl, Latent-Reframe

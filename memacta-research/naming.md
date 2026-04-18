# memacta Naming Map

Every feature: memacta brand name ↔ competitor name ↔ technical terms we keep as-is.

**Rules:**
- Competitor brand names (Soul ID, Lipsync Studio, DoP, Cloud Surf, etc.) → always rename.
- Third-party model names (Kling, Flux, SDXL, Wan, Veo, Sora) → keep as-is in model pickers.
- ML/graphics technique names (LoRA, IP-Adapter, ControlNet, DreamBooth, Wav2Lip, ReActor, etc.) → keep as-is.

| memacta UI Name | Internal Name | Replaces (competitor) | Technical names kept |
|---|---|---|---|
| Talking Studio | `talking-studio` | Lipsync Studio (Higgsfield) | ElevenLabs, Kling, LatentSync, OpenVoice V2, MuseTalk, Wav2Lip, SadTalker, Sync Labs lipsync-2, VEED Fabric |
| VibeLock | `vibe-lock` | Soul Moodboard (Higgsfield) | IP-Adapter, InstantStyle, CSD, LoRA, FaceID Plus V2, ControlNet, Flux, SDXL |
| Recast | `character-swap-2` | Character Swap 2.0 / Recast / Video Face Swap (Higgsfield) | Wan 2.2-Animate, ControlNet, OpenPose, DWPose, PuLID, PuLID-Flux, InstantID, InstantCharacter, IP-Adapter FaceID, InsightFace, ReActor, Roop, GFPGAN, CodeFormer, RIFE, DynamicFace, FlowVid |
| Persona | `persona` | Soul ID (Higgsfield) | LoRA, IP-Adapter, InstantID, PuLID, DreamBooth, Flux, FLUX.1-dev, FLUX.1-schnell, SDXL, ControlNet, InsightFace, ArcFace, ReActor, fal.ai, Replicate, RunPod, Black Forest Labs |
| CineMoves | `cinemoves` | DoP / Camera Controls (Higgsfield) | Kling, Wan, Luma, Minimax, Hailuo, Runway, AnimateDiff, Motion LoRA, CameraCtrl, MotionCtrl, Latent-Reframe |

### CineMoves — sample preset names reserved
- **Slingshot Zoom** — rapid push-in, snap stop
- **Halo Orbit** — slow 180° orbit + slight crane-up
- **Elevator Drop** — static subject, crane-down + mild tilt-up
- _Shadow Creep_ (v1.1) — low-angle dolly-in
- _Runway Strut_ (v1.1) — tracking shot beside subject
- _Kick-Drop_ (v1.1) — whip pan into zoom

# memacta Product Decisions

Source of truth for product/pricing decisions that feed into specs. All values are remodifiable — tune `lib/credits.ts`, Prisma plan rows, and env config.

## Build order (locked 2026-04-17)
1. **Persona** (feature id: `soul-id`) — flagship, 6–8 days
2. **Recast** (feature id: `character-swap-2`) — ~13 days
3. **Talking Studio** (feature id: `lipsync-studio`) — 2–3 weeks
4. **CineMoves** (feature id: `dop-camera-motion`) — 2–3 weeks
5. **VibeLock** (feature id: `soul-moodboard`) — ~7.5 days

Persona-first because: (a) it's the wedge, (b) every later feature composes on top (`personaId` FK, voiceId slot, stylePresetId slot), (c) 1-week ship = fastest possible "reason to exist" for the app.

## Pricing & tier policy (2026-04-17 v1 — TESTING)

**Status:** testing values. All tunable from config; expect to revise after first 100 signups.

### Plans

| Tier | $/mo | Personas | Premium LoRA trains | Gen credits/mo | Download | Share w/o watermark |
|---|---|---|---|---|---|---|
| **Free** | $0 | Unlimited instant, 1 premium (lifetime) | 1 lifetime | 15 | ❌ preview only | ❌ memacta WM always on |
| **Creator** | $15 | Unlimited | 5/mo | 500 | ✅ | ✅ |
| **Pro** | $35 | Unlimited | 20/mo | 1,500 | ✅ | ✅ |
| **Studio** | $99 | Unlimited | Unlimited | 5,000 | ✅ | ✅ |

### Free-tier friction gates (abuse control)
- Email verification required before any Persona creation.
- **24-hour cooling period** between signup and premium LoRA training eligibility.
- 1 premium LoRA lifetime ever (not per-month) — tracked on User, not reset on plan change.
- IP + device fingerprint on signup to throttle multi-account gaming.
- All free-tier outputs have memacta watermark baked into pixel data (not just overlay).
- Free users cannot download source files (PNG/MP4) — preview only in-app.
- Free users cannot get clean share URLs (share card renders with memacta watermark).

### Credit weights (first pass)
| Action | Credits |
|---|---|
| Instant image generation (PuLID-Flux) | 1 |
| Premium image generation (trained LoRA) | 1 |
| Image-to-video 5s (Kling 2.1 Pro) | 5 |
| Image-to-video 5s (Wan 2.2 5B economy) | 2 |
| Recast image face-only | 1 |
| Recast video 480p | 10 |
| Recast video 720p | 20 |
| Talking Studio v2v 15s std | 10 |
| Talking Studio i2v 15s premium | 20 |
| Voice clone (ElevenLabs IVC) | 50 one-time |
| CineMoves clip (vendor-native) | 3–10 per preset costWeight |

Credit-to-$ peg: **$15 = 500 credits** → 1 credit ≈ $0.03 retail. Provider cost targets ~$0.01/credit → 3× gross margin before storage/infra.

## Watermark & content ownership
- Free outputs: visible memacta watermark (bottom-right), embedded C2PA content credentials, AI-generated metadata tag.
- Paid outputs: no visible watermark, C2PA credentials still embedded (legal + platform compliance).
- Persona LoRA files: belong to memacta. Free users cannot export. Paid users can export on Creator+ via a new `POST /api/personas/:id/export` endpoint (future sprint).

## Consent & legal (applies to Persona, Recast, Talking Studio)
- Explicit consent checkbox on every photo/voice upload: *"I confirm this is me, or I have explicit permission from the person shown/heard."*
- Stored as signed attestation with hashed audit record (userId, timestamp, IP, user agent, content hash).
- Celebrity/public-figure blocklist runs before training/generation (fail-closed if uncertain).
- Hard block on minors (age detection on upload, reject + audit log).
- Takedown flow reachable from every Persona detail page.
- Region-aware disclosure (EU AI Act, BIPA / Texas CUBI for biometric, TN/CA/TX likeness statutes).
- Retention: face embeddings + LoRA deleted on persona deletion. 12-month dormancy policy (inactive personas archived; user can restore within 30 days).

## Storage
- Supabase Storage (primary) or R2 (fallback).
- Reference photos: encrypted at rest, signed URLs, 7-day default expiry per signed URL.
- LoRA files: stored indefinitely for paid users; 90-day retention for free-tier premium LoRA (then archived, restorable on upgrade).

## Analytics events (Sprint 1 minimum)
- `persona.created` (tier, photoCount)
- `persona.instant_preview_generated`
- `persona.upgraded_to_premium` (success, failureReason)
- `persona.training_started` / `training_completed` / `training_failed`
- `persona.first_generation` (timeSinceCreate)
- `persona.download_paywall_hit`
- `persona.share_watermark_shown`

## Open items (not blocking Sprint 1)
- [ ] Final Stripe price IDs for Creator / Pro / Studio (user sets up in Stripe dashboard)
- [ ] Celebrity blocklist source (considering: Clarifai Celebrity, AWS Rekognition Celebrity, or curated seed list)
- [ ] C2PA embedding library choice (likely `@contentauth/c2pa-node` or ffmpeg filter)
- [ ] Watermark style finalization (text logo vs gradient mark)

# Feature: soul-id

- memacta UI name: Persona
- Internal name: `persona`
- Feature id (cross-ref): `soul-id`
- Category: Identity
- Priority: P2 (wedge feature; first sprint of memacta product arc)
- Sprint: 1 (Persona v1)
- Est. effort: 6-8 eng-days (Tier A: D1-D4, Tier B: D5-D7)
- Brief: memacta-research/briefs/soul-id.md
- Policy: memacta-research/decisions.md
- Naming map: memacta-research/naming.md

Naming rule: use "Persona" in all user-visible copy and in code identifiers (Persona, /personas, /api/persona/*). Third-party technical names (LoRA, PuLID, Flux, FLUX.1-dev, IP-Adapter, InstantID, DreamBooth, InsightFace, ArcFace, fal.ai, Replicate) are preserved in code comments and model pickers.

## User story

1. **Create an Instant Persona.** A signed-in, email-verified user uploads 1-5 photos of a face, accepts consent, names the persona, and within seconds has a READY persona (tier=INSTANT) selectable in the generate panel. No training wait.
2. **Upgrade to Premium.** From a READY instant Persona, the user clicks Upgrade to Premium. After the 24h cooling period since signup and if the lifetime premium train has not been used, memacta kicks off fal-ai/flux-lora-fast-training (~15-20 min). The detail page polls status and flips to tier=PREMIUM with a loraUrl when the webhook lands.
3. **Generate with a persona.** From /create, the user picks a persona chip. The server sends identity={kind:'instant',...} or {kind:'lora',...} based on tier. On free tier every output returns with a server-baked memacta watermark; attempting to download raw opens the upgrade paywall. Every Generation row carries personaId.

## Wireframe

### /personas
```
+------------------------------------------------------------+
| memacta                                      [avatar]      |
+------------------------------------------------------------+
| Sidebar |  Personas                         [+ New Persona]|
|         |                                                  |
| Create  |  +----------+  +----------+  +----------+        |
| Library |  | [cover]  |  | [cover]  |  | [cover]  |        |
| Persona*|  | Alex Rae |  | Nova     |  | Kiro     |        |
| Billing |  | PREMIUM  |  | INSTANT  |  | TRAINING |        |
|         |  | 12 gens  |  | 3 gens   |  | ~ 12 min |        |
|         |  +----------+  +----------+  +----------+        |
+------------------------------------------------------------+
```

### /personas/new (wizard)
```
Step 1 — Upload photos (1-5)
  [drop zone: drag photos or click to select]
  [thumb][thumb][thumb]  <- green check (face+adult+not-nsfw)
                         <- red X if rejected w/ reason

Step 2 — Consent
  [ ] "This is me, or I have explicit permission from the
       person shown." (required)
  Learn more about memacta's consent + takedown policy.

Step 3 — Name
  Name: [________]   Trigger word (auto): koi-alex-rae
  [Finish — generate 4 previews (4 credits)]

Step 4 — READY
  Here are 4 instant previews. Your Persona is ready.
  [preview grid]
  [Go to Persona]   [Use in Create]
```

### /personas/[id]
```
+-------------------------------------------------------------+
| Alex Rae   INSTANT    3 generations                         |
|  cover image                                                |
|  [Use in Create]   [Upgrade to Premium *]   [...delete]     |
+-------------------------------------------------------------+
| Upgrade to Premium                                          |
|   fuchsia->orange card                                      |
|   "Train a dedicated model on your photos. ~15 min.         |
|    92-98% identity match. 1 free train on Free plan."       |
|   Status: READY — available                                 |
|   [Start Training]                                          |
+-------------------------------------------------------------+
| Recent Generations                                          |
|  [tile][tile][tile][tile]                                   |
+-------------------------------------------------------------+
```

### Persona selector chip in /create
```
Model: [Flux v]   Identity: [ None | Alex Rae* | Nova | + ]
                                        ^gradient glow when selected
```

## Routes

Page routes (in `app/(app)/`):
- `/personas`                -> `app/(app)/personas/page.tsx`
- `/personas/new`            -> `app/(app)/personas/new/page.tsx`
- `/personas/[id]`           -> `app/(app)/personas/[id]/page.tsx`

API routes:
- `POST   /api/persona`                                -> `app/api/persona/route.ts`
- `GET    /api/persona`                                -> `app/api/persona/route.ts`
- `GET    /api/persona/[id]`                           -> `app/api/persona/[id]/route.ts`
- `DELETE /api/persona/[id]`                           -> `app/api/persona/[id]/route.ts`
- `POST   /api/persona/[id]/photos`                    -> `app/api/persona/[id]/photos/route.ts`
- `DELETE /api/persona/[id]/photos/[photoId]`          -> `app/api/persona/[id]/photos/[photoId]/route.ts`
- `POST   /api/persona/[id]/finalize-instant`          -> `app/api/persona/[id]/finalize-instant/route.ts`
- `POST   /api/persona/[id]/upgrade-premium`           -> `app/api/persona/[id]/upgrade-premium/route.ts`
- `POST   /api/persona/[id]/preview`                   -> `app/api/persona/[id]/preview/route.ts`
- `POST   /api/persona/[id]/takedown`                  -> `app/api/persona/[id]/takedown/route.ts`
- `POST   /api/webhooks/fal/training`                  -> `app/api/webhooks/fal/training/route.ts`

All authenticated routes call `auth()` (NextAuth v5), run through `lib/rate-limit.ts` with a key of `persona:${userId}`, and enforce `emailVerified != null` where noted in acceptance criteria. Existing `/api/generate` gains optional `personaId`.

Test-only route (NODE_ENV !== 'production'): `POST /api/test/verify-email` to unblock E2E.

## Components

New under `components/persona/`:
- `PersonaCard.tsx`, `PersonaTierBadge.tsx`, `PersonaStatusBadge.tsx`
- `PersonaWizard.tsx`, `UploadStep.tsx`, `NameStep.tsx`, `InstantPreview.tsx`
- `UpgradeCta.tsx`, `TrainingProgress.tsx`, `PersonaSelector.tsx`
- `ConsentBlock.tsx`, `PersonaDetailHeader.tsx`
- `DownloadPaywallModal.tsx`, `TakedownDialog.tsx`

Changes to existing:
- `components/create/GeneratePanel.tsx` (or equivalent) — import and render `<PersonaSelector />`; thread `personaId` into the generate body.
- `components/library/*` — show persona chip overlay on persona-attributed tiles; swap download action for `<DownloadPaywallModal />` on free tier.
- `components/sidebar.tsx` — add a "Personas" entry below "Library".

New server helpers:
- `lib/persona/service.ts` — Persona CRUD + orchestration
- `lib/persona/gates.ts` — `canCreatePersona`, `canStartPremiumTrain`, `canDownloadClean`
- `lib/persona/consent.ts` — `computeContentHash`, `persistAttestation`
- `lib/persona/trigger-word.ts` — deterministic per-user unique trigger word generator
- `lib/persona/blocklist.ts` — celebrity name matcher (case+diacritic normalized, edit-distance-1)
- `lib/persona/webhook-token.ts` — HS256 JWT sign/verify for fal webhook
- `lib/watermark/apply.ts` — pixel-level watermark compositor via `sharp`
- `lib/ai/providers/fal.ts` — extended with 4 new functions below
- `lib/ai/identity/faceEmbed.ts` — 512-d ArcFace extraction wrapper
- `lib/analytics/persona.ts` — typed analytics event emitters

## Data model deltas (migration: `persona_v1`)

### User (edit, non-destructive)
- Do NOT rename existing `emailVerified DateTime?` — treat it as the canonical verified signal in `lib/persona/gates.ts`.
- Add `premiumLoraTrainsUsed Int @default(0)`.
- Add relations: `personas Persona[]`, `consentAttestations ConsentAttestation[]`.

### New enums
```prisma
enum PersonaTier   { INSTANT PREMIUM }
enum PersonaStatus { DRAFT READY TRAINING FAILED }
```

### New model Persona
```prisma
model Persona {
  id                String   @id @default(cuid())
  userId            String
  name              String
  slug              String
  triggerWord       String
  tier              PersonaTier    @default(INSTANT)
  status            PersonaStatus  @default(DRAFT)
  primaryPhotoUrl   String?
  coverImageUrl     String?
  faceEmbedding     Bytes?
  loraUrl           String?
  loraBaseModel     String?
  loraScale         Float?
  trainingJobId     String?
  trainingSteps     Int?
  trainingStartedAt DateTime?
  trainingEndedAt   DateTime?
  trainingError     String?
  voiceId           String?   // reserved — Talking Studio sprint
  stylePresetId     String?   // reserved — VibeLock sprint
  celebrityFlag     Boolean   @default(false)
  minorFlag         Boolean   @default(false)
  createdAt         DateTime  @default(now())
  updatedAt         DateTime  @updatedAt
  archivedAt        DateTime?

  user          User                   @relation(fields: [userId], references: [id], onDelete: Cascade)
  photos        PersonaPhoto[]
  attestations  ConsentAttestation[]
  generations   Generation[]

  @@unique([userId, slug])
  @@unique([userId, triggerWord])
  @@index([userId, status])
  @@index([status, createdAt])
}
```

### New model PersonaPhoto
```prisma
model PersonaPhoto {
  id           String   @id @default(cuid())
  personaId    String
  url          String
  storageKey   String
  isPrimary    Boolean  @default(false)
  faceBbox     Json?
  faceScore    Float?
  ageEstimate  Float?
  nsfwScore    Float?   @default(0)
  rejected     Boolean  @default(false)
  rejectReason String?
  createdAt    DateTime @default(now())

  persona Persona @relation(fields: [personaId], references: [id], onDelete: Cascade)

  @@index([personaId])
  @@index([personaId, isPrimary])
}
```

### New model ConsentAttestation
```prisma
model ConsentAttestation {
  id                String   @id @default(cuid())
  userId            String
  personaId         String?
  statementVersion  String   // e.g. "v1-2026-04"
  contentHash       String   // sha256 over sorted storageKeys
  ipAddress         String
  userAgent         String
  timestamp         DateTime @default(now())

  user    User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  persona Persona? @relation(fields: [personaId], references: [id], onDelete: SetNull)

  @@index([userId, timestamp])
  @@index([personaId])
}
```

### Edit Generation (add only)
```prisma
personaId String?
persona   Persona? @relation(fields: [personaId], references: [id], onDelete: SetNull)

@@index([personaId])
```

Non-destructive migration. Rollback path: drop two new tables, drop enums, drop added `User.premiumLoraTrainsUsed`, drop added `Generation.personaId`.

## Provider adapter contract

### IdentitySpec (in `lib/ai/provider.ts`)
```ts
export type IdentitySpec =
  | { kind: 'instant'; referenceImageUrl: string; strength?: number }
  | { kind: 'lora'; loraUrl: string; triggerWord: string; scale?: number };
```

`ImageGenParams` gains `identity?: IdentitySpec`. Existing `GenerationRequest` gains optional `identity?: IdentitySpec` and `personaId?: string`.

### New functions in `lib/ai/providers/fal.ts`

```ts
export async function createFaceDetect(p: {
  imageUrl: string;
}): Promise<{
  faceCount: number;
  primaryBbox?: { x: number; y: number; w: number; h: number };
  primaryScore?: number;
  ageEstimate?: number;
  nsfwScore?: number;
  embedding?: Float32Array;
}>;

export async function createFluxPulidGeneration(p: {
  referenceImageUrl: string;
  prompt: string;
  negativePrompt?: string;
  width?: number;
  height?: number;
  seed?: number;
  strength?: number;
}): Promise<{
  status: 'succeeded' | 'failed';
  url?: string;
  error?: string;
  requestId: string;
}>;

export async function startFluxLoraTraining(p: {
  imagesZipUrl: string;
  triggerWord: string;
  webhookUrl: string;
  steps?: number;           // default 1000
  baseModel?: 'flux-dev';   // default 'flux-dev'
}): Promise<{
  jobId: string;
  status: 'queued' | 'running' | 'failed';
  error?: string;
}>;

export async function createFluxLoraGeneration(p: {
  loraUrl: string;
  triggerWord: string;
  scale?: number;           // default 0.9
  prompt: string;
  negativePrompt?: string;
  width?: number;
  height?: number;
  seed?: number;
}): Promise<{
  status: 'succeeded' | 'failed';
  url?: string;
  error?: string;
  requestId: string;
}>;
```

Endpoint mapping:
- `fal-ai/imageutils/face-detect` (+ NSFW chain)
- `fal-ai/flux-pulid`
- `fal-ai/flux-lora-fast-training` (with `webhook_url`)
- `fal-ai/flux-lora`

All four: lazy `FAL_KEY` read, structured failure (not throw), error mapping via existing `friendlyFalError`, log prefix `[fal:persona]`.

### Webhook contract (`POST /api/webhooks/fal/training?token=...`)
- `token` = HS256 JWT signed by `PERSONA_WEBHOOK_SECRET`, payload `{personaId, jobId, exp}`, TTL 30 min.
- `lib/persona/webhook-token.ts` exposes `sign()` / `verify()`.
- Expected body: `{status: 'COMPLETED' | 'FAILED', request_id, output?: {diffusers_lora_file?: {url}}}`.
- On COMPLETED: set `loraUrl`, `tier=PREMIUM`, `status=READY`, `trainingEndedAt`, `loraScale=0.9`, bump `user.premiumLoraTrainsUsed += 1` — **single Prisma transaction**.
- On FAILED: `status=FAILED`, `trainingError` set; do NOT increment `premiumLoraTrainsUsed`.
- Idempotent on `jobId`.

### Watermark compositor (`lib/watermark/apply.ts`)
```ts
export async function applyPixelWatermark(p: {
  input: Buffer;
  label?: string;            // default 'memacta'
  corner?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  widthRatio?: number;       // default 0.1
  format?: 'png' | 'jpeg' | 'webp';
}): Promise<{ output: Buffer; format: string; width: number; height: number }>;
```
- Uses `sharp` (add to dependencies).
- SVG pill with fuchsia->orange gradient (`#fe2c55 -> #ff9f40`). 8px safe-area inset.
- Pure function. Falls back to PNG encode on unknown input.
- Pairs with existing client-side `lib/watermark.ts`; `/api/generate` post-processes free-tier persona-attributed outputs through it **before persisting `Generation.resultUrl`**.

## Acceptance criteria

1. `npm run build` succeeds after migration + new routes.
2. Migration `persona_v1` applies cleanly; no existing column is renamed.
3. `POST /api/persona`: 401 signed-out; 403 `{reason:'email_unverified'}` if `emailVerified` null; otherwise creates DRAFT/INSTANT Persona.
4. `POST /api/persona/:id/photos`: up to 5 uploads, runs `createFaceDetect`, first accepted = primary. 422 when `faceCount != 1` or `ageEstimate < 18` or `nsfwScore > 0.6`; rejected photos stored with `rejected=true` for audit.
5. Celebrity blocklist runs at finalize-instant and upgrade-premium. 422 `{reason:'blocklisted_name'}` on match. V1 list = exactly 10 hardcoded names (documented in test file).
6. `POST /api/persona/:id/finalize-instant` requires: (a) a primary non-rejected photo, (b) valid ConsentAttestation matching current `contentHash`, (c) `emailVerified != null`. Sets `status=READY`, `primaryPhotoUrl`, `coverImageUrl`.
7. Consent attestation persists BEFORE any training or generation. `contentHash = sha256(sortedStorageKeys.join('|'))`. Fail-closed on missing/mismatched.
8. `POST /api/persona/:id/preview` generates up to 4 PuLID samples; debits 4 credits (1 each). Fails closed on insufficient credits.
9. `POST /api/persona/:id/upgrade-premium` enforces ALL of:
   - `emailVerified != null`
   - `now - user.createdAt >= 24h` (bypass when `process.env.TEST_SKIP_COOLING_PERIOD === 'true'` AND `NODE_ENV !== 'production'`)
   - `premiumLoraTrainsUsed < 1` on free plan (paid plans use per-month cap via `lib/persona/gates.ts`)
   - persona `status=READY` and `tier=INSTANT`.
   On success: zip photos, call `startFluxLoraTraining` with signed `webhook_url`, set `status=TRAINING`. Does NOT yet bump `premiumLoraTrainsUsed`.
10. Training webhook verifies JWT, is idempotent on `jobId`, and on COMPLETED flips status/tier and bumps `premiumLoraTrainsUsed` in a single Prisma tx. 401 on bad/expired token.
11. `PersonaSelector` renders on the generate panel and lists only READY personas. Chosen `personaId` is sent to `/api/generate` and persisted on the Generation row.
12. `/api/generate` resolves `personaId` server-side:
    - INSTANT -> `{kind:'instant', referenceImageUrl: persona.primaryPhotoUrl}`
    - PREMIUM -> `{kind:'lora', loraUrl, triggerWord, scale: persona.loraScale ?? 0.9}`
    Auto-prepend `triggerWord` when absent in the prompt.
13. Credit debits match `decisions.md` weights: 1/image (instant or premium); preview debits 4.
14. Every free-tier persona-attributed generation is baked via `applyPixelWatermark` (bottom-right, 10% width). Paid-tier callers skip baking.
15. Free users hitting Download see `<DownloadPaywallModal />`; no raw file served. Paid users get clean original.
16. `DELETE /api/persona/:id` cascades PersonaPhoto, SetNull on `ConsentAttestation.personaId` and `Generation.personaId`. Photo `storageKey`s queued for deletion at the storage provider.
17. Analytics events fire with exact names from `decisions.md`: `persona.created`, `persona.instant_preview_generated`, `persona.upgraded_to_premium`, `persona.training_started`, `persona.training_completed`, `persona.training_failed`, `persona.first_generation`, `persona.download_paywall_hit`, `persona.share_watermark_shown`.
18. Rate limits (`lib/rate-limit.ts`): `POST /api/persona` 10/hr/user; `/photos` 30/hr/user; `/preview` 10/hr/user; `/upgrade-premium` 3/day/user; webhook 60/min/IP.
19. UI uses fuchsia-pink-orange gradient + cyan accents on near-black. No Higgsfield neutrals.
20. Diff grep for "Soul ID" returns zero hits outside `memacta-research/` and cross-reference comments.

## Test cases

### Vitest unit tests
1. `tests/lib/persona/gates.test.ts` — all `canCreatePersona` / `canStartPremiumTrain` / `canDownloadClean` branches including `TEST_SKIP_COOLING_PERIOD` bypass, lifetime_limit on free, per-month caps on paid.
2. `tests/lib/persona/consent.test.ts` — `computeContentHash` deterministic + order-insensitive; changes on any storage-key byte delta; rejects empty `statementVersion`.
3. `tests/lib/persona/trigger-word.test.ts` — regex shape, length bounds, deterministic fixture, 10k-synthetic uniqueness stress.
4. `tests/lib/persona/blocklist.test.ts` — exact 10-name seed, case+diacritic normalized, edit-distance-1 near matches rejected, offending match returned.
5. `tests/lib/ai/provider.test.ts` — `IdentitySpec` discriminator narrowing; `ImageGenParams.identity` optional doesn't break existing consumers.
6. `tests/lib/credits.test.ts` (extend) — instant=1, premium=1, preview debits 4.
7. `tests/lib/watermark/apply.test.ts` — pixel-sample asserts on a solid-white 1024x1024 fixture: top-left stays 0xFFFFFF, bottom-right has non-white pixel; dims preserved; corner option honored; PNG/JPEG round-trip.
8. `tests/lib/persona/webhook-token.test.ts` — sign/verify round-trip, rejects expired, rejects wrong-secret.
9. `tests/lib/persona/minor-rejection.test.ts` — mocked `ageEstimate=16` rejects with `reason='minor'` and audits `rejected=true`.

### Playwright E2E (`e2e/persona.spec.ts`, env: `TEST_SKIP_COOLING_PERIOD=true`, `MOCK_FAL=true`)
1. Sign up + verify email via test-only `/api/test/verify-email` (NODE_ENV !== 'production').
2. `/personas/new` — upload 3 fixtures from `e2e/fixtures/persona/*.jpg`, green chips, consent, name "Alex Rae", step 3 shows INSTANT READY + 4 previews, Finish.
3. `/personas` shows the new row with INSTANT READY.
4. `/create` — pick flux-kontext, select Alex Rae chip (asserts glow), prompt "cinematic portrait", Generate, download asserts a PNG with non-white pixels in the watermark region.
5. Paywall on raw download — test-only "View original" affordance triggers `<DownloadPaywallModal />`; analytics probe caught `persona.download_paywall_hit`.
6. Upgrade to premium — status -> TRAINING; mock webhook caller posts to `/api/webhooks/fal/training?token=<valid>` with `{status:'COMPLETED', output:{diffusers_lora_file:{url:'https://test/lora.safetensors'}}}`; UI polls and within 5s flips to PREMIUM READY with trigger word visible.
7. Generate with premium — request body contains `identity.kind === 'lora'` and prompt starts with trigger word; download still watermarked (user still on free plan).
8. Second upgrade blocked — button disabled w/ tooltip; direct API hit returns 403 `{reason:'lifetime_limit'}`.

Fixtures: `e2e/fixtures/persona/face{1,2,3}.jpg` (synthetic; content irrelevant because `MOCK_FAL=true` stubs `createFaceDetect`/`createFluxPulidGeneration`/`startFluxLoraTraining`/`createFluxLoraGeneration`).

## Implementation day breakdown

- **D1:** Prisma deltas + `persona_v1` migration, `lib/persona/service.ts` skeleton, CRUD `/api/persona` + `/api/persona/[id]`, empty `/personas` page.
- **D2:** Photo upload route, `createFaceDetect` in `lib/ai/providers/fal.ts`, NSFW/age/face gates, UploadStep UI, consent persistence, blocklist seed.
- **D3:** `createFluxPulidGeneration`, `/api/persona/:id/preview`, InstantPreview UI, finalize-instant endpoint, end-to-end instant creation.
- **D4:** PersonaSelector injected into `/create`, `/api/generate` personaId wiring, `lib/watermark/apply.ts` server compositor, paywall modal.
- **D5:** `startFluxLoraTraining`, zip uploader, signed webhook helper, `/api/persona/:id/upgrade-premium`, TrainingProgress polling.
- **D6:** `/api/webhooks/fal/training`, `createFluxLoraGeneration`, tier-aware identity resolution in `/api/generate`, analytics events.
- **D7:** Test hardening, rate limits, takedown dialog, copy polish, gradient styling pass, `npm run build` green, all Vitest + Playwright suites green.

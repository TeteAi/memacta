# Feature: beta-readiness-1-5

- memacta UI name: (infrastructure — not user-visible)
- Internal name: `beta-readiness`
- Sprint: 1.5
- Est. effort: 3-4 eng-hours
- Source of truth: this spec + `memacta-research/decisions.md`

## Goal
Close the 7 hard blockers preventing real-user testing of memacta. No new features — only plumbing. After this sprint, a creator can sign up, verify email, create a Persona, hit real rate limits, and have watermarked outputs stored properly in Supabase Storage (not base64 bloat).

## In scope

1. **Transactional email via Resend** — signup verification, password reset, persona training complete notifications.
2. **Password reset flow** — email-driven, NextAuth compatible.
3. **Rate limiter → Upstash Redis** — replace in-memory `Map` with persistent Redis.
4. **Supabase Storage for persona photos and watermarked outputs** — stop storing base64 data URLs.
5. **Sentry DSN wiring verification** — already scaffolded, just ensure the client/server configs pick up `NEXT_PUBLIC_SENTRY_DSN`.
6. **Graceful degradation** — every new integration (Resend, Redis, Sentry, Supabase Storage) must work in dev without its env var (no-op or console log). Production MUST throw on start if any required-in-prod var is missing.
7. **Prod smoke-test script** — a script that a human runs against the deployed site to verify all integrations work (real email sends, real rate limit hits, real file uploads, real Sentry event).

## Explicitly OUT of scope
- New product features (Recast, Talking Studio — those are Sprints 2+).
- Custom domain wiring (that's a DNS task for the user).
- Stripe price ID creation (user task, code already compatible).
- Onboarding UX / gallery seeding / mobile UX / legal pages — Sprint 1.6.

## Environment variables added (required in production)

| Env | Purpose | Required in prod | Fallback in dev |
|---|---|---|---|
| `RESEND_API_KEY` | Send transactional email | YES | Log email to console |
| `RESEND_FROM_EMAIL` | From address | YES | `onboarding@resend.dev` |
| `UPSTASH_REDIS_REST_URL` | Redis rate limit store | YES | In-memory Map (dev only) |
| `UPSTASH_REDIS_REST_TOKEN` | Redis auth | YES | — |
| `NEXT_PUBLIC_SENTRY_DSN` | Client + server error reporting | YES (or sentry inert) | Inert |
| `SUPABASE_URL` | Storage + future admin | YES | — |
| `SUPABASE_SERVICE_ROLE_KEY` | Storage write via service role | YES | — |
| `PERSONA_WEBHOOK_SECRET` | Already required | YES | Random dev string |

Update `.env.example` with every new var + a comment explaining it.

## Task breakdown (aim for ≤4 hours)

### Task 1 — Resend wiring (~60 min)
- Add `resend` npm package.
- New `lib/email/client.ts` — exposes `sendEmail({to, subject, react, text})`. In prod, calls Resend. In dev without `RESEND_API_KEY`, logs to console.
- New `lib/email/templates/` — React Email components or plain HTML strings for:
  - `verification.tsx` — email-verify link
  - `password-reset.tsx` — password-reset link
  - `persona-training-complete.tsx` — "Your Persona is ready"
  - `welcome.tsx` — post-verify welcome
- Wire into NextAuth v5: use NextAuth's built-in Email provider OR add a credentials-flow verify token. Given the codebase is already NextAuth + Credentials, add a **token-based email verify** flow:
  - New model `EmailVerificationToken { id, userId, token, expiresAt, usedAt? }` OR reuse existing NextAuth `VerificationToken` if compatible.
  - On signup (credentials path): generate token, store, send verification email with link `/auth/verify?token=...`.
  - `/api/auth/verify-email` — consumes token, sets `User.emailVerified = new Date()`, deletes token.
  - Resend-verification button on the user's account page if `emailVerified === null`.

### Task 2 — Password reset (~40 min)
- Reuse same token model: `PasswordResetToken { id, userId, token, expiresAt, usedAt? }`.
- Page `/auth/forgot` — form with email input → POST `/api/auth/forgot-password` → always returns 200 (don't leak whether email exists).
- Page `/auth/reset?token=...` — form with new password → POST `/api/auth/reset-password` → validates token + updates password hash.
- Use argon2 or bcrypt (whichever is already in the auth.ts — match existing convention).

### Task 3 — Redis rate limiter (~45 min)
- Add `@upstash/redis` and `@upstash/ratelimit` npm packages.
- Rewrite `lib/rate-limit.ts`:
  - Keep the same exported API: `rateLimit(key, {windowMs, max})`, `rateLimitKey(req, userId)`.
  - Implement with Upstash's sliding-window algorithm internally.
  - If `UPSTASH_REDIS_REST_URL` is unset AND `NODE_ENV !== 'production'`, fall back to the existing in-memory Map (dev convenience).
  - If `UPSTASH_REDIS_REST_URL` is unset AND `NODE_ENV === 'production'`, throw at boot (fail-closed).
- Verify by hitting `/api/persona` 11 times in quick succession — 11th should return 429 (rate-limited per spec AC#18).

### Task 4 — Supabase Storage (~90 min)
- Add `@supabase/supabase-js` npm package.
- New `lib/storage/client.ts` — server-only Supabase client using the service-role key. NEVER import this in a `"use client"` file.
- New `lib/storage/upload.ts`:
  - `uploadPersonaPhoto(userId, personaId, buffer, mime)` → `{storageKey, signedUrl}` (uploads to `persona-photos` bucket, private, returns signed URL with 7-day TTL).
  - `uploadGenerationOutput(userId, generationId, buffer, mime)` → `{storageKey, publicUrl}` (uploads to `generations` bucket, public, returns long-lived URL).
- Update `/api/upload/route.ts`:
  - Keep the fal.ai upload path (for reference images to pass to models).
  - Add branch: if `context === 'persona-photo'`, upload to our `persona-photos` bucket instead of fal storage. Return `{url: signedUrl, key: storageKey, ...}`.
- Update `/api/generate/route.ts` watermark path:
  - Instead of encoding the watermarked buffer as a `data:` URL, upload to `generations` bucket via `uploadGenerationOutput`, store the bucket URL in `Generation.resultUrl`.
- Update `app/api/persona/[id]/photos/route.ts`:
  - Use `uploadPersonaPhoto` instead of writing data URIs.
  - Update `PersonaPhoto.storageKey` to the real storage key (not the full URL).
- Create buckets via SQL migration `prisma/migrations/manual/2026-04-22-storage-buckets.sql`:
  ```sql
  INSERT INTO storage.buckets (id, name, public) VALUES
    ('persona-photos', 'persona-photos', false),
    ('generations', 'generations', true)
  ON CONFLICT (id) DO NOTHING;
  -- Basic policies: service_role has full access, anon/authenticated blocked.
  -- (Service role bypasses RLS anyway, but we want explicit deny for other roles.)
  ```
  User will run this in SQL Editor just like before.

### Task 5 — Sentry verification (~15 min)
- Open existing `instrumentation.ts`, `sentry.server.config.ts`, `sentry.edge.config.ts`, `instrumentation-client.ts`.
- Verify they read `NEXT_PUBLIC_SENTRY_DSN` and no-op when unset.
- Add a test-only route `/api/test/sentry` (NODE_ENV !== 'production') that throws, to confirm errors reach Sentry.
- In the production smoke-test script, the operator hits this route from a logged-in browser and confirms the error appears in Sentry within 60s.

### Task 6 — Graceful degradation audit (~15 min)
- Every new integration lib file exports a `isConfigured()` helper.
- Every route that depends on an integration checks configuration at runtime and either:
  - Returns a helpful 503 with `{error: "email_not_configured"}` in dev, OR
  - Throws at startup in prod (fail-closed).
- Add a new `/api/healthz` check: in addition to DB, probe Redis (ping), Resend (API key present + domain verified), Supabase Storage (bucket exists). Return 200 only if all healthy.

### Task 7 — Prod smoke-test script (~15 min)
- Write `scripts/smoke-prod.sh` (or `.ps1` for Windows) that:
  - `curl -s https://memacta.vercel.app/api/healthz` → expect 200
  - Creates a throwaway user via `/api/auth/register`
  - Polls the mailbox via a manual step (operator visually confirms email arrived)
  - Fires 12 requests at `/api/persona` → expect 10 × 200/401, then 2 × 429
  - Hits `/api/test/sentry` → operator confirms Sentry event
  - Uploads a 64x64 test image to `/api/upload` with persona-photo context → expect a `supabase.co` URL in response
- Script prints a pass/fail summary at the end.

## Acceptance criteria

1. `npm run build` green after all changes.
2. `.env.example` has every new env var documented with a one-line comment.
3. New Prisma model(s) for verification/reset tokens migrated and indexed.
4. Dev run (no Resend/Redis/Sentry env vars) → app boots, email logs to console, rate limits use in-memory Map.
5. Prod run (env vars set) → app boots with all integrations healthy; boot fails clearly if any required var missing.
6. Signing up a new user triggers a verification email that arrives at the user's inbox with a working link that sets `emailVerified`.
7. Password reset flow: email arrives, reset link works, old password invalidated.
8. Rate limiter: hitting `/api/persona` 11 times returns a 429 on the 11th (sliding-window).
9. Generated image outputs land in `generations` bucket (public URL) not base64 data URL. DB `Generation.resultUrl` is a `supabase.co` URL.
10. Persona photos land in `persona-photos` bucket (private, signed URL) not base64 data URL.
11. Sentry captures a test error from `/api/test/sentry` within 60s.
12. `/api/healthz` reports status for every dependency (DB, Redis, Resend, Supabase Storage).
13. 50 new or updated Vitest unit tests still pass.

## Test cases

### Vitest unit tests
1. `tests/lib/email/client.test.ts` — dev fallback logs instead of hitting Resend; `isConfigured()` false without API key.
2. `tests/lib/rate-limit.test.ts` (extend) — mock Upstash client; sliding-window correctness at boundaries; dev-mode fallback.
3. `tests/lib/storage/upload.test.ts` — signed URL generation, content-type passthrough, storage key format.
4. `tests/lib/auth/password-reset.test.ts` — token expiry, single-use, argon2 hash match.
5. `tests/lib/auth/email-verify.test.ts` — token expiry, single-use.

### Playwright E2E
Skip for this sprint — the smoke-test script covers prod. Unit tests cover dev.

## Dependencies (add to package.json)
```
resend
@upstash/redis
@upstash/ratelimit
@supabase/supabase-js
```

Do not add `@sentry/nextjs` — it's already installed from prior Sentry scaffold sprint.

## Return payload (builder)
```json
{
  "featureId": "beta-readiness-1-5",
  "changedFiles": [...],
  "buildOk": true,
  "migrations": ["beta_readiness_tokens"],
  "notes": "<what shipped + any follow-ups>"
}
```

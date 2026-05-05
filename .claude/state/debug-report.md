# Debug Audit — 2026-05-05 (UTC)

## Summary
- Routes checked: 80+ (all footer/sidebar/sitemap entries; every `/tools/<slug>`; auth, legal, billing endpoints)
- Live HTTP: every public route returned 200, including `/auth/*`, `/legal/*`, `/cookies`, `/api/healthz`, `/sitemap.xml`, all 37 tool slugs
- Health check: `{db:"ok",redis:"ok",resend:"ok",storage:"ok"}` — all green
- Auth providers JSON correctly pinned to `https://www.memacta.com` callback URLs (not the broken `memacta.vercel.app`)
- Sitemap XML correct host + correct paths (37+ urls)
- **Blockers: 3 · Major: 6 · Minor: 7**

---

## 🔴 Blockers (ship-stoppers)

| # | Issue | Evidence | Suggested fix (one line) |
|---|---|---|---|
| B1 | **Email-verification redirect lands on a 404.** After consuming the token, `verify-email` redirects to `${appUrl}/persona?verified=1`. Path is singular; live route `/persona` returns 404 (verified via curl). All credentials-flow signups end on a broken page. | `app/api/auth/verify-email/route.ts:57,67` (`dashboardUrl: \`${appUrl}/persona\`` and final redirect) | Change `/persona` → `/personas` (or `/dashboard?verified=1`) in both spots. |
| B2 | **Welcome bonus mismatch — credentials signup grants 3 credits, OAuth signup grants 100, pricing page advertises 100.** Result: every email signup gets ~30× fewer credits than promised, plus the daily-cap math (`lib/daily-cap.ts:15`) was specifically tuned around 100 so a freshly-signed-up credentials user can't even run one standard video. | `app/api/auth/register/route.ts:47` (`credits: 3, // signup bonus`) and `:55,58` (transaction logs "3 free credits") vs `auth.ts:116` (`SIGNUP_BONUS = 100`) vs `lib/credits.ts:74` ("100-credit welcome bonus") | Bump register route's `credits` and transaction `amount` to 100; also fix UI copy (B3). |
| B3 | **Sign-in page sells "3 free credits" in two places.** Same numerical mismatch as B2 surfaces in the user-facing UI. | `app/auth/signin/page.tsx:200` (anon-limit callout: "3 free credits") and `:331` (welcome-bonus banner: "Get 3 free credits when you sign up") | Replace "3" → "100" in both copy strings. |

## 🟠 Major

| # | Issue | Evidence | Suggested fix (one line) |
|---|---|---|---|
| M1 | **"Forgot password?" button on signin page is a no-op.** Plain `<button type="button">` with no `onClick` and no `<Link>` wrapper. Users can't reach `/auth/forgot` from the signin form even though the route + page exist and work. | `app/auth/signin/page.tsx:307-310` | Replace the `<button>` with `<Link href="/auth/forgot">` (matches the pattern used for the `/legal/*` links lower on the page). |
| M2 | **Verify-email URL ignores the request host — uses `NEXT_PUBLIC_APP_URL` then falls back to `localhost:3000`.** This is the same class of bug we already fixed in `forgot-password` (commit 9f44d6e). If the env var ever drifts or unset on a preview deploy, verification links 404 / redirect to localhost. | `app/api/auth/verify-email/route.ts:18` (`process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"`) | Adopt the `resolveOrigin(req)` helper from `forgot-password/route.ts:31-38` — derive from `host` + `x-forwarded-proto`. |
| M3 | **Stripe key resolution path uses two different fallbacks for `getAppUrl()`.** `lib/stripe.ts:58-62` falls back to `http://localhost:3000`; `lib/app-url.ts:13-19` falls back to `https://memacta.vercel.app`. Stripe checkout `success_url`/`cancel_url` will leak the wrong host if `APP_URL`/`AUTH_URL` aren't set, or send users to localhost from prod. | `lib/stripe.ts:58-62` vs `lib/app-url.ts:13-19` | Have `lib/stripe.ts` import + delegate to `getAppUrl` from `lib/app-url.ts` instead of redefining its own. |
| M4 | **`isPaidPlan` and `canDownloadClean` agree, but they read from different shapes.** `lib/download.ts:27-29` takes a string `planId`. `lib/persona/gates.ts:108-111` takes a `GateUser` with `subscription.planId`. Auth.ts session attaches `planId` directly on `session.user.planId` but pipes it through `subscription.planId` lookup. Today they happen to align ("free" vs "anything else") but the parallel definitions are an attractive bug surface — adding e.g. a "trialing" status that should NOT count as paid would have to be patched in two unrelated files. | `lib/download.ts:26-29`, `lib/persona/gates.ts:108-111`, `auth.ts:93,103` | Promote `isPaidPlan(planId)` to a shared helper and have `canDownloadClean` call it. |
| M5 | **`uploadBlob` in transitions tool ignores the auth-required gate.** When the user's session expires mid-pipeline (after Clip A upload but during the frame-extraction round-trip), `uploadBlob` will throw a generic "Upload failed: 401" instead of redirecting them to sign in like the initial upload does. | `components/transitions/transitions-tool.tsx:393-400` (no `handleAuthRequired` check) vs `:374` (proper check) | Mirror the `handleAuthRequired(res, json)` call used at line 374 inside `uploadBlob`. |
| M6 | **Two parallel `/terms` and `/privacy` pages exist alongside `/legal/terms` and `/legal/privacy`.** Both render full policy content (not stubs). Sitemap indexes all four (`app/sitemap.ts:30-35`). SEO duplicate-content risk; if you update one set of policies you almost certainly forget the other. | `app/terms/page.tsx`, `app/privacy/page.tsx` (full content) and `app/legal/terms/page.tsx`, `app/legal/privacy/page.tsx`; `app/sitemap.ts:30-35` lists both | Convert the legacy pages to `redirect("/legal/terms")` server components and remove the legacy entries from `sitemap.ts`. |

## 🟡 Minor / polish

| # | Issue | Evidence | Suggested fix (one line) |
|---|---|---|---|
| P1 | Sitemap fallback host is the Vercel preview URL. If `APP_URL` and `AUTH_URL` ever fall back, search engines indexing the Vercel preview will get URLs pointing at the same origin — fine — but the test harness's expectation that the production sitemap reads `www.memacta.com` only holds while one of the env vars is set. | `app/sitemap.ts:11-13` (`?? "https://memacta.vercel.app"`) | Use `getAppUrl()` from `lib/app-url.ts` so there's a single grep target for the fallback. |
| P2 | Footer "Apps" link points to `/apps` (returns 200) but no top-level entry; sidebar doesn't surface it. Clicking it from footer works; users won't discover it elsewhere. Low impact, but it's an orphan if the page intentionally exists. | `components/footer.tsx:26` (`/apps`); page renders but isn't in sidebar/sitemap | Add `/apps` to `app/sitemap.ts` if you want it indexed, or remove the footer link. |
| P3 | Discord CTA in footer points at `https://discord.gg/memacta` (server may not exist). Other social icons (Twitter/X, Instagram, TikTok, YouTube) still have `href="#"` placeholders that show the cursor as a link but go nowhere. | `components/footer.tsx:91-101` (4× `href="#"`) | Either fill in real socials, drop the icons, or convert them to disabled `<button>`s. |
| P4 | `app/api/contact/route.ts:93`, `app/api/upload/route.ts:100`, `app/api/persona/[id]/route.ts:47` and `app/api/persona/[id]/takedown/route.ts:37` all `console.log` raw on every request (some are JSON-shaped, some aren't). Vercel log volume + cost. | grep showed 8+ `console.log` occurrences in app routes | Standardize on `console.warn` for anomalies + remove the chatty `console.log` lines, or wrap behind `if (process.env.DEBUG)`. |
| P5 | Two TODOs left in delete handlers about "queue storageKeys for deletion" — i.e. orphaned storage objects accumulate forever after a persona/photo delete. Not a bug today, but storage bills will grow. | `app/api/persona/[id]/route.ts:45`, `app/api/persona/[id]/photos/[photoId]/route.ts:51` | File a follow-up: implement a periodic cleaner or delete via Supabase Storage SDK in-line. |
| P6 | `/effects/skibidi` and `/effects/mukbang` are listed in the sidebar (`components/sidebar.tsx:126-127`) but neither is in `app/sitemap.ts`. The routes resolve at runtime (presumably via the dynamic `[slug]` page under `/effects`); just inconsistent inventory. | `components/sidebar.tsx:117-128` vs `app/sitemap.ts:25` (`/effects` only) | Either expand `/effects` into per-effect URLs in the sitemap or accept the dynamic route catch-all (currently fine). |
| P7 | Concat path in `lib/video-stitch.ts:107,118` deliberately drops audio (`-an`, `:a=0`). The transitions tool produces silent stitched outputs. Comment at top of file calls this out as a known follow-up. Not a defect, but a creator complaint vector. | `lib/video-stitch.ts:107-118` | Add an inline UI hint ("output muted by ffmpeg.wasm — coming soon") near the result so users don't think their audio is broken. |

## ✅ Verified working

- All 80+ public routes return 200 — homepage, pricing, community, tools index, every `/tools/<slug>` (37 checked), legal pages (`/legal/{terms,privacy,dmca,ai-likeness}`, `/cookies`), `/auth/{signin,signup,forgot,reset}`, `/about`, `/contact`, `/blog`, `/careers`, `/trust`, `/effects`, `/models`, `/prompt-guide`, `/community/contests`, `/apps`, `/dashboard`, `/create`.
- `/api/auth/providers` returns JSON with `callbackUrl: "https://www.memacta.com/api/auth/callback/google"` — auth callback **is** correctly pinned to the custom domain, not the Vercel preview.
- `/api/healthz` returns `{status:"ok", checks:{db:"ok",redis:"ok",resend:"ok",storage:"ok"}}` in ~700 ms.
- `/sitemap.xml` returns valid XML with `https://www.memacta.com` host on every `<loc>`. Includes static routes + per-model entries from `lib/ai/models.ts`.
- `/auth/signup` 307s to `/auth/signin?mode=signup` (server-side redirect via `redirect()` in `app/auth/signup/page.tsx`) — landing page renders correctly.
- `/pricing` body contains "100 credits / day" copy (5 occurrences); the legacy "30 credits" copy is gone.
- `auth.ts:16` sets `trustHost: true`; password-reset URL is built from request host (`app/api/auth/forgot-password/route.ts:31-38`); these match the fixes in commit 9f44d6e.
- `app/auth/signin/page.tsx:285-302` — password show/hide eye toggle is wired (`onClick={() => setShowPassword(v => !v)}`, correct `aria-pressed`/`aria-label`). Same on `app/auth/reset/page.tsx:102-119`.
- Signin page legal links go to `/legal/terms` and `/legal/privacy` (lines 366-368), not the legacy `/terms`/`/privacy`.
- Every model in `lib/ai/models.ts` has a matching entry in `CREDIT_COSTS` (`lib/credits.ts:20-46`) — 18 of 18, no fallback price ever used in practice.
- Stripe webhook (`app/api/billing/webhook/route.ts`) verifies signature (line 53), handles `checkout.session.completed`, `customer.subscription.{updated,deleted}`, `invoice.payment_succeeded`, idempotency on session/invoice id, refunds via the credit-transaction ledger. Returns 503 + structured warn log when `STRIPE_SECRET_KEY` or `STRIPE_WEBHOOK_SECRET` aren't set.
- Stripe checkout (`app/api/stripe/checkout/route.ts`) returns 503 with friendly message when not configured (line 49-58) and 503 with structured error when a specific plan's `STRIPE_PRICE_*` env var is missing (line 61-77). The legacy `/api/stripe/webhook` correctly re-exports the canonical `/api/billing/webhook` handler.
- `/api/generate` daily-cap is 100 (`lib/daily-cap.ts:15`) and the structured 429 message ("This generation costs N credits, but only X of your daily 100-credit limit is left…") fires correctly (`app/api/generate/route.ts:181-198`). Failed generations refund credits + log a "refund" CreditTransaction row (line 244-262).
- `lib/download.ts smartDownload` correctly branches: paid → raw, free + image → canvas watermark, free + video → ffmpeg.wasm watermark with raw-fallback in `catch` (lines 60-72). Fallback on wasm failure is graceful.
- `lib/video-watermark.ts` lazy-loads ffmpeg via `lib/ffmpeg-loader.ts` — homepage payload not impacted; first watermarked download incurs the ~30 MB core fetch (cached afterwards).
- Transitions tool client (`components/transitions/transitions-tool.tsx`) shows a multi-step progress UI (extract → generate → stitch), handles auth-required, validates upload size (30 MB) and MIME type, falls back to "AI middle only" when both clips aren't real videos.
- Persona pages: `/personas` requires auth and redirects to `/auth/signin?callbackUrl=/personas`; `/personas/new` same; `/personas/[id]` uses `notFound()` for missing/foreign personas (`app/personas/[id]/page.tsx:42`). Email-verification gate (`canStartPremiumTrain` → `email_unverified`) and 24h cooling period are enforced server-side.
- Welcome modal only fires when `user.onboardedAt` is null (`app/dashboard/page.tsx:101` + render gate), never re-shows.
- Mobile padding: `/personas/new`, `/dashboard`, `/personas` all use `px-6` consistently. `/create` uses `px-4 sm:px-6` (better at 375px). Stat row in dashboard wraps `grid-cols-2 sm:grid-cols-3 lg:grid-cols-6` so the iPhone-SE width gets 2 columns of cards. `<main>` containers all use `mx-auto max-w-*`. Header in `dashboard-client.tsx:113` uses `flex-col sm:flex-row` so the "+ Create New" / "Settings" pair stacks vertically on phones.
- Footer + sidebar inventories cross-checked: every `<Link>` href in both files resolves to a 200 on prod.
- No tap targets <44px on the audited mobile-priority pages — all CTAs use `py-2.5` or `py-3` with `text-sm` and adequate horizontal padding.

## Things I couldn't verify (and why)

- **Real Stripe checkout end-to-end** — needs valid `STRIPE_SECRET_KEY` + per-plan `STRIPE_PRICE_*` env vars; code path is correct, but I cannot prove the live deploy has them set. Trigger a checkout from `/pricing` while logged in — if the response is 503 with `error: "billing_coming_soon"` or `"plan_not_configured"`, the env isn't wired in prod.
- **Authenticated flows** — generation, persona creation/training, library, dashboard data, account page, library claim — all gated by auth and I deliberately did not create test accounts on prod. Manual smoke test required.
- **fal.ai upstream** — reading code only; have not confirmed each `FAL_ENDPOINTS` slug currently resolves on fal.ai's side. The error mapping in `lib/ai/fal-provider.ts:11-48` is comprehensive and surfaces the right user-facing copy when an endpoint 403s.
- **Email delivery** — `Resend` health check is green, but I cannot confirm DKIM/SPF/from-address validity for verification + reset emails without sending one.
- **Image watermark visual quality** — code path is sound (canvas pipeline with CORS-tainted-canvas fallback); did not download a sample to inspect the brand pill rendering.
- **Mobile rendering at 375px** — only inspected the source markup + Tailwind class breakpoints; did not load the routes in a real 375 px viewport. The wizard at `/personas/new` redirects to login when signed out so the wizard interior couldn't be smoke-tested.
- **Sentry** — instrumentation files exist (`sentry.{server,edge}.config.ts`, `instrumentation.ts`, `instrumentation-client.ts`); did not confirm DSN is set and events flow.

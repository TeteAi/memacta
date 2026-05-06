# Mobile Audit — 2026-05-06 (UTC)

Audit performed on local dev server (`npm run dev`, Next 15.5) at viewport
**375×667** primary, with verification passes at **390×844** and **414×896**.
Signed-out session only — auth-gated routes were confirmed to redirect, not
walked further.

## Summary
- Routes walked: 16 (`/`, `/auth/signin`, `/auth/signin?mode=signup`, `/auth/forgot`, `/pricing`, `/pricing/topup`, `/create`, `/create/video`, `/create/image`, `/library`, `/dashboard`, `/community`, `/copilot`, `/tools`, `/tools/transitions`, `/tools/face-swap`)
- Buttons / links clicked or programmatically fired: ~28 distinct interactions
- **Dead-click bugs: 2 confirmed**
- **Layout bugs: 1 (horizontal overflow at ≤381px)**
- **Tap-target bugs: 7 distinct components below 44×44**

The user's "buttons don't respond" complaint most plausibly maps to:
1. The hero "Trending Now" cards on the home page that look clickable but
   aren't wired up (most likely culprit — it's the most visible surface).
2. The signed-out Library "See what others are creating" cards.
3. The 36×36 hamburger toggle button which is small enough that real
   thumbs occasionally miss it (verified: when synthetic clicks hit at
   y=51 they land on the parent header div, not the button).

---

## 🔴 Dead-click / unresponsive bugs (the user's complaint)

### 1. Home "Trending Now" showcase cards do nothing on tap
- **Route + selector:** `/` · `[data-testid="showcase-card"]` (12 cards)
- **File:line:** `components/home/showcase-grid.tsx:14-56`
- **Repro:** Scroll to the "Trending Now" section on the homepage, tap any
  thumbnail card. Cursor changes to pointer on desktop hover, hover
  border/shadow animation runs, but tap does nothing.
- **Root cause:** `<div className="… cursor-pointer">` — no `<Link>`
  wrapper, no `onClick`, no `<a>`. Live DOM check: `hasOnClick: false`,
  `hasReactOnClick: false`, `tag: DIV`. Tapping never navigates.
- **Smallest fix:** wrap the outer `<div>` in `<Link href={`/community/${item.id}`}>`
  (or whatever the intended target is) — the cards advertise themselves
  as clickable via `cursor-pointer`, so either remove that affordance or
  make them navigate.

### 2. Signed-out Library "See what others are creating" cards do nothing
- **Route + selector:** `/library` (signed out) · `.cursor-pointer` inside
  `[data-testid="library-empty-state"]` (6 cards)
- **File:line:** `app/library/page.tsx:96-121`
- **Repro:** Sign out, visit `/library`, scroll past the empty-state
  message, tap any of the showcase preview tiles.
- **Root cause:** Same pattern — `<div className="… cursor-pointer">`
  with `hover:scale-105` but no link/handler. Confirmed with
  `hasOnClick: false`, `hasReactOnClick: false`.
- **Smallest fix:** wrap each `<div>` in a `<Link href={`/community/${item.id}`}>`
  or just drop `cursor-pointer` and `hover:scale-105` so it doesn't
  promise interactivity.

### 3. Hamburger toggle is below the recommended hit-target size
- **Route + selector:** every page · `[aria-label="Toggle sidebar"]`
- **File:line:** `components/nav.tsx:38-53` (`className="w-9 h-9 …"`)
- **Repro:** On a 375-wide viewport the button measures **36×36 px**.
  In our test environment a synthetic click intended for the button (at
  y=51 instead of inside the button's y=14–50 range) landed on the
  parent header `<div class="flex h-16 …">`, which has no `onClick`, so
  the sidebar didn't open. The handler itself works perfectly when the
  click reaches the button.
- **Root cause:** Tap target smaller than Apple HIG (44×44) and Material
  (48×48) minimums. The button works mechanically; users with average
  thumbs miss it.
- **Smallest fix:** bump to `w-11 h-11` (44px) or wrap in a 44×44 padded
  hit area: `className="w-9 h-9 … flex … p-2.5 -m-2.5"` style trick, or
  just `min-w-[44px] min-h-[44px]`.

---

## 🟠 Layout / overflow

### 4. `/community` header overflows at ≤381px
- **File:line:** `app/community/page.tsx:49-66`
- **Repro:** At 375 px wide the page reports
  `document.documentElement.scrollWidth = 381` — a 6 px horizontal
  scroll. Verified: at 390 wide, scrollWidth = 390 (no overflow). At
  414, no overflow.
- **Root cause:** `<main className="p-8 …">` (32 px padding all sides) +
  the row containing the "Community" h1 plus the "Contests" and
  "Submit Project" buttons can't fit in the remaining 311 px. The flex
  row wraps neither down nor in.
- **Smallest fix:** swap `flex items-center justify-between mb-6` for
  `flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4`,
  or tighten the page wrapper to `p-4 sm:p-8`.

### 5. Bottom-of-sidebar "Start Creating" CTA only fits when keyboard is
    closed; legal links (Terms / Privacy / AI Likeness / DMCA) sit at
    15 px tall just above it
- **File:line:** `components/sidebar.tsx:339-360`
- **Repro:** Open the sidebar on a 375×667 viewport. Footer legal links
  are inline `<a>` with `text-[10px]` → bounding box 15×26 (Terms),
  15×31 (Privacy), 15×49 (AI Likeness), 15×29 (DMCA). They sit
  above the gradient "Start Creating" button.
- **Root cause:** `text-[10px]` + 4 inline links with `gap-x-3` give a
  cluster of unreliable tap targets in the busiest part of the drawer.
- **Smallest fix:** `text-xs` (12 px) + `py-2` per link, or move the
  legal block to a single "Legal" row that opens an inline expand.
  Either way these links cannot stay 15 px tall on touch.

---

## 🟡 Tap-target sizing / polish

The "Toggle sidebar" hamburger covered above is the most consequential
one. Other below-44-px targets, in priority order:

### 6. Header logo `<Link>` to "/" — 104×32
- **File:line:** `components/nav.tsx:55-57`
- The `<BrandMark className="text-2xl">` link is 104×32. Mostly cosmetic
  — the brand mark isn't the primary nav target — but it is the largest
  thing in the top-left and below 44 px tall.

### 7. Community post "Like" buttons — 36×20 (card heart + count)
- **File:line:** `components/community/post-card.tsx:90-99`
- The heart glyph + count is 20 px tall. Heart icons are notoriously
  imprecise to tap; recommend `p-2 -m-2` to expand the hit area without
  changing visual weight, plus `type="button"` (currently defaults to
  `submit`).

### 8. Sign-in form "Show / Hide password" toggle — 36×36
- **File:line:** `app/auth/signin/page.tsx:312-329`
- 36×36 tap area inside a password field. Same Apple HIG miss.

### 9. ShareModal close button "✕" has no explicit size
- **File:line:** `components/social/share-modal.tsx:120-128`
- Renders at ~20×20 (just the glyph at `text-xl`). Easy to miss on
  touch. Add `w-11 h-11 flex items-center justify-center`.

### 10. Aspect-ratio chips on `/create/video` — 89×37
- **File:line:** `app/create/video/page.tsx:97-108`
- 37 px tall is borderline. Bump `py-2.5` → `py-3` to clear 44.

### 11. Footer "Discord" social icon — 36×36
- **File:line:** `components/footer.tsx` (Discord block, around line 130)
- 36×36 (`w-9 h-9`). Not a critical target but flagged for consistency.

### 12. Footer link grid — 19 px tall rows
- **File:line:** `components/footer.tsx` (the 4-column link list)
- ~50 inline `<Link>` items render at heights of 19–24 px. They are
  unlikely to be the user's complaint (these are deep navigational
  links not primary CTAs) but together they're the biggest cluster of
  sub-44 targets in the app.

---

## ✅ Verified working

These were tapped (programmatically dispatched native click events,
verified state transition) and behaved correctly:

- **Home `/`** — header "Sign up free" link → `/auth/signup`,
  AI-Influencer hero cards (10 distinct `<Link>` cards) →
  `/tools/ai-influencer`, "Create Your AI Influencer" hero CTA →
  `/tools/ai-influencer`, "See Examples" → `/community`, "Start Creating
  Now" + "View Plans" CTA banner buttons, ToolCategories grid (6 cards,
  all real `<Link>`).
- **Hamburger toggle** — when click reaches the 36×36 button, sidebar
  toggles open AND closed correctly. Backdrop click closes the drawer.
  X-icon morphs to hamburger when state flips. Identity / Editing /
  Video Tools / Advanced / Effects & Templates / Studio expanders
  open and close (verified Identity → Persona link becomes visible).
- **Sidebar links** — `<Link onClick={onClose}>` pattern correctly
  closes the drawer on navigation. Quick links and tool sub-items
  render with `translate-x-0` once the drawer is open.
- **`/auth/signin`** — "Continue with Google" button (44×327, ample
  size), "Sign up free" mode toggle (h1 swaps from "Welcome back" →
  "Create your account"), "Show password" toggles input `type` from
  password → text, "Forgot password?" link → `/auth/forgot`.
- **`/auth/forgot`** — form renders, "Send reset link" button is the
  full-width submit, "Sign in" link → `/auth/signin`. No overflow, no
  hidden tap targets.
- **`/pricing`** — "Get Started Free" link (44×278), "Get Started"
  subscribe buttons (44×278/279, x3, type="submit" but not in a form so
  fine), "Buy a credit top-up" link, FAQ `<details>` accordion expands
  on summary click. No overflow.
- **`/create`** — all 3 tile `<Link>`s (Text to Video / Image to Video
  / Image Generation) navigate correctly, "Explore 33+ tools" /
  "Browse effects" / "Create a Persona" footer chips work.
- **`/create/video`** — Generate Video button is correctly
  `disabled=true` when prompt is empty, becomes `disabled=false` after
  typing into the textarea (verified via `input` event dispatch).
  Aspect chips toggle the active class. Native `<select>` elements are
  fine on mobile.
- **`/create/image`** — same disabled→enabled transition verified.
- **`/library`** — empty-state "Start Creating" gradient button is a
  real `<Link href="/create">` (44×height after wrap), "← Back to Home"
  works.
- **`/community`** — feed renders, like buttons toggle (♡109 → ♥110
  verified, network call succeeded). FAQ `<details>` accordion works.
- **`/tools/transitions`** — both `ClipDropzone`s correctly trigger the
  hidden file input when their outer `<div>` is tapped (no preview
  state). Preset buttons (146×96) are large enough; `aria-pressed`
  flips on click. Generate button is `disabled` until a clip is
  uploaded — confirmed.
- **`/tools/face-swap`** — 2 dropzones at 278×152 each, both fire the
  hidden file input click correctly.
- **Persona-nudge dismiss button** — wraps a 28-px circle in a
  `min-h-[44px] min-w-[44px]` button so the actual hit area meets HIG.
  Confusing visually but functional.
- **ShareModal** (when triggered) — backdrop has `onClick={onClose}`,
  modal body has `onClick={(e) => e.stopPropagation()}` so clicks
  inside don't accidentally close. Caption textarea, schedule
  checkbox, datetime input, Cancel / Post Now buttons all work.
- **Cross-viewport sanity** — at 390×844 and 414×896 every page tested
  reports `scrollWidth === viewport.innerWidth` (no overflow).

---

## Things I couldn't verify

Each of the below requires either a real signed-in session, real
external integration, or a real touch device that fires
`touchstart`/`touchend` (the dev preview emits synthetic mouse events
through Chrome DevTools Protocol which behave subtly differently from
mobile WebKit):

- **Real iOS Safari touch behaviour.** Synthetic clicks pass through
  React's `onClick` handlers identically to mouse clicks. They do NOT
  exercise: 300 ms tap-delay (mostly gone now but still present in
  some embeded WebViews), touch-cancellation when scrolling starts,
  and iOS' "double-tap-to-zoom" interception of single taps on
  elements without an explicit click handler. The "dead-click" bugs
  above (cards that visually look clickable but have no handler) are
  the kind of thing that on iOS sometimes works (because the OS sends
  a synthetic mouse click) and sometimes doesn't (because the user
  scrolled even slightly mid-tap and the OS suppressed it). The user's
  complaint is consistent with this.
- **Real auth flows** — Google OAuth pop-up, the Persona training
  pipeline, Stripe Checkout redirect. Confirmed only that the buttons
  are not dead.
- **Persona wizard** — gated behind `/personas/new` which requires
  auth.
- **Soul Cinema, Studio editor, Chat thread** — mostly auth-gated.
- **Turnstile widget** — only renders when `NEXT_PUBLIC_TURNSTILE_SITE_KEY`
  is set; in dev this is not configured, so the signup form had no
  challenge widget visible. The form code does the right thing:
  `turnstileReady = !turnstileSiteKey || Boolean(turnstileToken)`, so
  with no env key the Create Account button is not blocked. Confirmed
  not crashing.
- **Native iOS keyboard occlusion.** When the iOS soft keyboard opens
  on `<input type="email">` etc., it covers the bottom ~40% of the
  viewport. None of the auth / create / contact forms scroll the
  active input into view on focus (no `scrollIntoView({ block:
  "center" })` in any input's `onFocus`). On a real iPhone this would
  hide the password field on `/auth/signin` until the user manually
  scrolls. Worth confirming on hardware.
- **Watermark canvas long-press download.** The `smartDownload` flow
  for free-tier users renders a watermarked canvas and triggers a
  programmatic download. On iOS, programmatic `<a download>` clicks
  are ignored by Safari for cross-origin URLs — videos hosted off
  `memacta.com` may save as `.html` instead of `.mp4`. Could not
  verify without a real generation.

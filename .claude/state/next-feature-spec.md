# Feature: polish-pass-8

**Name:** Polish Pass — Prompt Builder v2 + Careers + Discord + Footer sweep
**Category:** P6/P7 polish (marketing surface, static pages, conversion utility)
**Priority:** P2 (closes 3 remaining gap items + 1 meta-sweep)

## Why this, why now

After 9 feature loops, the remaining candidates in `feature-gap-analysis.md` are honestly thin:

- **UGC Factory** — caller-flagged in the directive as structurally near-identical to the just-shipped Fashion Factory. Building it would be a re-skin. SKIP.
- **Reference Extension** — overlaps materially with shipped Multi Reference + Soul ID + Soul Moodboard + Soul Cast. SKIP.
- **Sora 2 Upscale** — narrow single-model duplicate of the shipped Upscale tool. SKIP.
- **Careers page** — genuine gap, low-effort. INCLUDE.
- **Discord link** — trivial sweep. INCLUDE.
- **Prompt Guide** — currently a 2-section static page (6 tips + 4 example prompts at `app/prompt-guide/page.tsx`). The biggest quality delta remaining is upgrading it into an **interactive prompt builder**. This gives the site a third conversion surface (after Copilot chat and preset tools) and turns a dead static page into a working tool that deep-links into /create. INCLUDE.

This batched polish pass ships three real gap items + one meaningful UX upgrade in a single loop, with zero Prisma deltas, zero Stripe, zero new providers.

## User story

> As a new visitor I want to craft a great prompt before I spend credits, so I land on /prompt-guide, pick a category (video / image / character), fill in chips (subject, style, lighting, camera, mood), watch my prompt build live, copy it or deep-link straight into /create/video?prompt= to generate — no signup required to experiment.

> As a recruiter I want to see what the company is about, so I land on /careers, read the mission + values + open role blurbs, and hit an email mailto link.

> As a community member I want a place to chat, so I see the Discord link in the footer socials row next to Twitter/Instagram/TikTok/YouTube.

## Wireframe

### /prompt-guide (upgraded in place)

```
┌──────────────────────────────────────────────────────────────────────┐
│  Prompt Guide                             [Video] [Image] [Character]│  <- category toggle
│  Build a killer prompt, chip by chip.                                │
├──────────────────────────────────────────────────────────────────────┤
│                                                                      │
│   1. Subject                                                         │
│   [a golden retriever puppy] (text input, required)                  │
│                                                                      │
│   2. Style (pick 1)                                                  │
│   [cinematic] [photoreal] [anime] [oil painting] [3D render]         │
│                                                                      │
│   3. Lighting (pick 1)                                               │
│   [golden hour] [neon glow] [soft studio] [volumetric fog]           │
│                                                                      │
│   4. Camera (pick 1, video/image only)                               │
│   [close-up] [wide angle] [bird's eye] [tracking shot] [dolly zoom]  │
│                                                                      │
│   5. Motion (video only)                                             │
│   [slow motion] [timelapse] [panning left] [orbiting]                │
│                                                                      │
│   6. Mood (pick 1)                                                   │
│   [ethereal] [dramatic] [peaceful] [mysterious] [nostalgic]          │
│                                                                      │
├──────────────────────────────────────────────────────────────────────┤
│  Live prompt preview:                                                │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │ a golden retriever puppy, cinematic, golden hour lighting,   │   │
│  │ close-up, slow motion, dramatic mood                         │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                                                                      │
│  [Copy prompt]    [Open in Create ->]    [Send to Copilot]           │
│                                                                      │
├──────────────────────────────────────────────────────────────────────┤
│  Tips & tricks (existing 6-tip grid, unchanged)                      │
│  Example prompts (existing 4-prompt gallery) - each now has a        │
│  "Try it" link that deep-links with ?prompt=...                      │
└──────────────────────────────────────────────────────────────────────┘
```

### /careers

```
┌──────────────────────────────────────────────────────────────────────┐
│  Careers at memacta                                                  │
│  Build the creator tools of tomorrow.                                │
├──────────────────────────────────────────────────────────────────────┤
│  ┌─ Our mission ─────┐ ┌─ Our values ──────┐ ┌─ How we work ──────┐ │
│  │  Democratize      │ │ - Ship fast        │ │ - Remote-first     │ │
│  │  creative AI for  │ │ - Creators first   │ │ - Async            │ │
│  │  everyone.        │ │ - Open source      │ │ - Equity for all   │ │
│  └───────────────────┘ └───────────────────┘ └───────────────────┘ │
├──────────────────────────────────────────────────────────────────────┤
│  Open roles (4-6 stub cards)                                         │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │ Senior AI Engineer - Remote - Full-time                        │  │
│  │ Work on our fal.ai adapter layer and next-gen model pipeline. │  │
│  │ [Apply via email ->]                                           │  │
│  └───────────────────────────────────────────────────────────────┘  │
│  ...                                                                 │
├──────────────────────────────────────────────────────────────────────┤
│  Don't see a fit? [careers@memacta.ai]                               │
└──────────────────────────────────────────────────────────────────────┘
```

### Discord link (footer)

- Add 5th social icon in the footer brand-row socials cluster (alongside existing Twitter, Instagram, TikTok, YouTube in `components/footer.tsx` lines 81-94).
- href `https://discord.gg/memacta` (stub — placeholder URL).
- aria-label "Join our Discord".
- Same styling class chain as the other 4 icons (`w-9 h-9 rounded-full bg-white/15 ...`).

## Routes

- `/prompt-guide` — upgraded in place (renders `<PromptBuilder />` above existing tips/examples grids).
- `/careers` — new static page `app/careers/page.tsx`.
- Footer — add Discord icon + Careers link in `col1Links`.

No API routes, no middleware changes.

## Components

**Create:**

- `lib/prompt-builder.ts` — **pure** helpers (no React, no network):
  - `composePrompt(inputs: PromptInputs, category: PromptCategory): string`
  - `CATEGORY_FIELDS: Record<PromptCategory, PromptField[]>` — which fields show per category
  - `PROMPT_CATEGORIES = ["video", "image", "character"] as const`
  - `STYLE_OPTIONS`, `LIGHTING_OPTIONS`, `CAMERA_OPTIONS`, `MOTION_OPTIONS`, `MOOD_OPTIONS` — typed string arrays
- `components/prompt-builder/prompt-builder.tsx` — client component (`"use client"`). Holds category toggle + chip state + live preview + 3 action buttons. Uses `useState`. Does NOT read `useSearchParams` (writes to URL via `<Link>` href only).
- `components/prompt-builder/chip-group.tsx` — presentational: list of toggle buttons with single-select or null-select semantics.
- `app/careers/page.tsx` — server component, static content.
- `components/careers/open-role-card.tsx` — server component.
- `tests/unit/prompt-builder.test.ts`
- `tests/e2e/prompt-builder.spec.ts`

**Modify:**

- `app/prompt-guide/page.tsx` — render `<PromptBuilder />` at top (wrap in `<Suspense>` only if builder reads search params; current spec says it does NOT, so no Suspense needed). Add a `<Link href={"/create/video?prompt=" + encodeURIComponent(prompt)}>Try it</Link>` anchor inside each example card; image-type examples link to `/create/image?prompt=...`.
- `components/footer.tsx` — add Discord svg anchor to the 4-socials block, add `{ href: "/careers", label: "Careers" }` to `col1Links` right after the "About" entry.

**Do NOT modify:**

- `components/sidebar.tsx` — no QUICK_LINKS change, no new section entry.
- `app/apps/page.tsx`
- `app/copilot/page.tsx`
- `lib/copilot.ts`
- `prisma/schema.prisma`
- Any existing route's client component.

## Data model deltas

**None.** No Prisma migration. Verified current `prisma/schema.prisma` has: User, Subscription, CreditTransaction, Project, Character, Generation, Post, Like, CreditPackage, Purchase, SocialAccount, ScheduledPost, PostAnalytics, Account, Session, VerificationToken — zero touch needed.

## API contracts

**None.** Pure frontend feature. Prompt Builder composes a string client-side via `lib/prompt-builder.ts` and either copies it (navigator.clipboard) or navigates to `/create/*?prompt=...` / `/copilot?prompt=...` via `<Link>`. No server route.

No `handleAuthRequired` needed — this feature adds zero network requests.

## Design tokens (must-hold)

- Card surface `bg-[#181828]`.
- Card border `border-white/15`.
- Page bg `bg-[#0a0a16]` or transparent on top of layout root.
- Gradient text: `text-brand-gradient` CSS utility (globals.css line 71). **NEVER** `bg-brand-gradient bg-clip-text text-transparent`.
- Primary CTA: `bg-brand-gradient` + `glow-btn` + `text-white font-semibold`.
- Active chip: `bg-brand-gradient text-white`.
- Inactive chip: `bg-white/10 text-white/70 hover:bg-white/15`.
- **Zero `slate-*` or `zinc-*` tokens.** Grep must pass a word-boundary check (`/\b(slate|zinc)-\d/`) — not `[class*="slate-"]` which false-matches `translate-x-*`.

## Deep-link contract

Prompt Builder's "Open in Create" button href maps by category:

| Category  | Target                                      |
|-----------|---------------------------------------------|
| video     | `/create/video?prompt={urlencoded}`         |
| image     | `/create/image?prompt={urlencoded}`         |
| character | `/tools/soul-id?prompt={urlencoded}`        |

"Send to Copilot" -> `/copilot?prompt={urlencoded}` (Copilot already Suspense-wraps useSearchParams — no rework).

Existing `/create/video` + `/create/image` pages already honor `?prompt=`. Verify, don't re-wire.

## Acceptance criteria

1. `npx next build` succeeds.
2. `/prompt-guide` renders a category toggle with three buttons (Video, Image, Character); default is Video.
3. Switching category shows/hides the correct field chips — Motion only for Video; Camera for Video+Image; Character shows Subject/Style/Lighting/Mood only.
4. Each chip group is single-select with a visually active/inactive state using `bg-brand-gradient` vs `bg-white/10`.
5. Subject textarea is required; "Open in Create" button is disabled (attribute) until Subject has non-empty trimmed text.
6. Live prompt preview updates on every keystroke/chip toggle, joins active fields with `, `, and renders inside a `bg-[#181828] border-white/15 rounded` surface with `data-testid="prompt-preview"`.
7. "Copy prompt" button calls `navigator.clipboard.writeText` with the composed string; on success shows a transient "Copied!" inline label for ~1500ms.
8. "Open in Create" button navigates to `/create/video?prompt=...` for Video, `/create/image?prompt=...` for Image, `/tools/soul-id?prompt=...` for Character. The prompt query string is URL-encoded.
9. "Send to Copilot" button navigates to `/copilot?prompt=...`.
10. Existing 6 Tips cards and 4 Example cards remain rendered below the builder (no regression of static content). Each example prompt has a "Try it" anchor that deep-links based on its `type` field (Video -> `/create/video?prompt=...`, Image -> `/create/image?prompt=...`).
11. `/careers` page renders: h1 "Careers at memacta" with `text-brand-gradient`, 3-card mission/values/how-we-work row, 4-6 open-role stub cards (each with a `mailto:careers@memacta.ai?subject=...` link), and a footer CTA. Use `data-testid="open-role-card"` on each role card.
12. Footer has a 5th social icon for Discord with `aria-label="Join our Discord"`, `href="https://discord.gg/memacta"`, and the same styling class chain as the existing four (`w-9 h-9 rounded-full bg-white/15 ...`).
13. Footer `col1Links` includes a `{ href: "/careers", label: "Careers" }` entry inserted right after the "About" entry (position 2).
14. Zero new `slate-*` / `zinc-*` tokens in any modified or new file. Word-boundary regex `/\b(slate|zinc)-\d/` must match nothing in the diff.
15. `text-brand-gradient` class is used for all gradient headings; zero occurrences of `bg-brand-gradient bg-clip-text text-transparent` in new code.
16. No new Prisma model, no new migration, no new API route.
17. No new dependency added in `package.json` (`navigator.clipboard` is standard browser API; category state uses React `useState`).
18. Sidebar and QUICK_LINKS remain unchanged (no bloat).

## Test plan

### Unit tests — `tests/unit/prompt-builder.test.ts` (target 8 cases)

All import the pure helper module `@/lib/prompt-builder`.

1. `composePrompt({subject: "a puppy", style: "cinematic", lighting: "golden hour"}, "video")` returns `"a puppy, cinematic, golden hour"`.
2. `composePrompt({subject: "a puppy"}, "video")` returns `"a puppy"` — filters empty fields.
3. `composePrompt({subject: "   hello   "}, "video")` returns `"hello"` — trims subject.
4. Category filter: `composePrompt({subject: "x", motion: "slow motion"}, "image")` — output does NOT contain "slow motion" (image has no motion field).
5. Category filter: `composePrompt({subject: "x", camera: "close-up", motion: "timelapse"}, "character")` — output does NOT contain "close-up" or "timelapse".
6. `CATEGORY_FIELDS.video` contains `"motion"`; `CATEGORY_FIELDS.image` does NOT contain `"motion"`; `CATEGORY_FIELDS.character` does NOT contain `"motion"` or `"camera"`.
7. `composePrompt({subject: "", style: "cinematic"}, "video")` returns empty string.
8. `PROMPT_CATEGORIES` is a readonly tuple with exactly `["video", "image", "character"]` in that order.

### E2E tests — `tests/e2e/prompt-builder.spec.ts` (target 10 cases)

Scope tests to the builder surface. Use `data-testid` selectors to avoid sidebar/footer collisions. Any `getByRole("button", { name: "Video" | "Image" | "Character" })` MUST be scoped via `page.getByTestId("prompt-builder").getByRole(...)` — sidebar has a section labeled "Video Tools" which would collide.

1. Page renders: `await page.goto("/prompt-guide")`, expect h1 text "Prompt Guide" visible, `data-testid="prompt-builder"` visible, `data-testid="prompt-preview"` present with empty-string content initially.
2. Category toggle: default is Video, clicking `getByTestId("prompt-builder").getByRole("button", { name: "Image" })` switches; Motion chip-group disappears, Camera remains.
3. Character toggle hides both Motion and Camera chip-groups.
4. Chip select: fill subject "neon street", click chip "cinematic", expect `getByTestId("prompt-preview")` text contains "neon street" and "cinematic" comma-separated.
5. Chip deselect (click same chip twice): preview drops that keyword.
6. "Open in Create" button is disabled when subject is empty (`await expect(btn).toBeDisabled()`).
7. "Open in Create" deep-link: fill subject "skyline", click Image category, click style "photoreal", click button, expect URL to match `/\/create\/image\?prompt=/` and the decoded query string to include "skyline" and "photoreal".
8. "Copy prompt" button calls clipboard (override `navigator.clipboard.writeText` via `page.addInitScript` to capture writes on a global) and shows "Copied!" inline for ~1500ms.
9. `/careers` smoke: visit `/careers`, expect h1 containing "Careers" visible, expect `page.getByTestId("open-role-card")` count >= 4.
10. Footer Discord: visit `/`, scope to `page.getByRole("contentinfo")`, expect a link with `aria-label="Join our Discord"` whose `href` starts with `https://discord.gg/`.

Do **NOT** add `test.skip(!process.env.FAL_KEY)` — this feature makes zero fal.ai calls.

For the footer Discord test, use `page.getByRole("contentinfo")` (the `<footer>` element semantic role) to avoid matching a future sidebar entry.

## Constraints to pass to the builder (checklist)

- [ ] `npx next build` not `npm run build`.
- [ ] Suspense-wrap any client component using `useSearchParams` — **N/A**: Prompt Builder does NOT read URL search params.
- [ ] `Promise.allSettled` fan-out — **N/A**, no generation.
- [ ] `handleAuthRequired` from `@/lib/auth-redirect` — **N/A**, no protected fetches.
- [ ] `test.skip(!process.env.FAL_KEY)` — **N/A**.
- [ ] Playwright color-token check via word-boundary regex (`/\b(slate|zinc)-\d/`) with `page.evaluate`.
- [ ] Use `text-brand-gradient` utility, NEVER `bg-brand-gradient bg-clip-text text-transparent`.
- [ ] Use `glow-btn` class on primary CTAs ("Open in Create", "Apply via email").
- [ ] No `slate-*` or `zinc-*` tokens.
- [ ] No Prisma migration.
- [ ] No Stripe / billing changes.
- [ ] Scope footer tests to `getByRole("contentinfo")`.
- [ ] Scope category-toggle button lookups to `getByTestId("prompt-builder")` to dodge sidebar "Video Tools" collision.
- [ ] `/apps` gallery cards already carry `data-testid="tool-card"` + `data-slug` — unaffected.
- [ ] Do NOT modify `components/sidebar.tsx` QUICK_LINKS.
- [ ] Do NOT touch `/apps` page, `/chat` legacy, or existing `/copilot` client (Suspense wrap already in place).

## Out of scope (explicitly)

- No new Prisma models / migrations / SQLite touches.
- No new API routes.
- No real Discord OAuth — link is a plain anchor to a placeholder URL.
- No job-board integration — careers roles are hard-coded stubs.
- No server-rendered SEO per-role pages — all roles render inline on `/careers`.
- No changes to existing `/copilot`, `/tools/*`, `/models/*`, `/u/*`, `/apps`.
- No "send prompt to Soul Cinema" or "send prompt to Popcorn" links — those tools use richer structured inputs, a free-text prompt would not map cleanly.

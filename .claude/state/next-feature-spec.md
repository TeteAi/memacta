# Feature: fashion-factory

- **Name:** Fashion Factory
- **Category:** Identity / Styling (new sub-flow built on top of Outfit Swap)
- **Priority:** P1 (highest remaining gap item that showcases real fal.ai generation and drives signup)
- **Source:** `.claude/state/feature-gap-analysis.md` line 6 — "Fashion Factory" listed under MISSING completely. Higgsfield's Fashion Factory is a batch outfit-lookbook generator: upload one person + many outfit references → get back N styled shots at once. Distinct from the already-shipped slim `outfit-swap` tool (which concatenates image URLs into a prompt string and never passes them to fal). This feature posts a real `imageUrl` payload to the existing `/api/generate` route per outfit, so every shot is a genuine fal.ai call against `flux-kontext` (image-edit model with reference-image support).

## User story

As a fashion creator or brand stylist, I want to upload one photo of myself (or a model / an AI influencer) and drop in 3-6 outfit reference images, then hit "Generate Lookbook" once and receive a grid of N styled shots — each showing my person wearing one of the outfits. I want to preview the batch, download any shot, share the whole lookbook to my community feed, and fall back gracefully when a single shot fails without losing the others.

This is the feature that makes memacta feel like a pro fashion tool rather than a single-prompt toy: batch generation, side-by-side comparison, and one-click posting of the whole set.

## Wireframe

```
+------------------------------------------------------------+
|  <- Apps / Identity                                        |
|  Fashion Factory                    [beta pill]  [share]   |
|  Upload one person + up to 6 outfits -> a full lookbook    |
+------------------------------------------------------------+
|                                                            |
|  +------------- Person --------------+                     |
|  | [ upload zone - 1 slot ]          |                     |
|  |   (PNG/JPG <= 10 MB, or URL)      |                     |
|  +-----------------------------------+                     |
|                                                            |
|  +------------- Outfits (1-6) -------+                     |
|  | [+][+][+][+][+][+]                |  <- tiles, each     |
|  |  o1 o2 o3 o4 o5 o6                |     a file-drop     |
|  +-----------------------------------+                     |
|                                                            |
|  Style prompt (optional):                                  |
|  +-----------------------------------+                     |
|  | "studio backdrop, editorial light"|                     |
|  +-----------------------------------+                     |
|                                                            |
|  Model: [flux-kontext v]   Cost: 5 x N credits             |
|                                                            |
|           [  Generate Lookbook  ]   <- disabled until      |
|                                        1 person + >=1 fit  |
|                                                            |
+------------------------------------------------------------+
|  RESULTS                                                   |
|  +------+------+------+                                    |
|  |  01  |  02  |  03  |   <- each tile: shot, outfit label,|
|  |  ok  |  ok  | fail |      download, "retry" on failure  |
|  +------+------+------+                                    |
|  |  04  |  05  |  06  |                                    |
|  |  ok  |  ok  | ...  |   <- "..." = still running         |
|  +------+------+------+                                    |
|                                                            |
|  [ Download all (zip) ]   [ Post lookbook to community ]   |
+------------------------------------------------------------+
```

## Routes (Next.js app-router)

- `app/tools/fashion-factory/page.tsx` — Fashion Factory landing + workspace (client component wrapping a server shell, following the pattern of `app/tools/ai-influencer/page.tsx`). This dedicated file will take precedence over the generic `app/tools/[slug]/page.tsx` catch-all because Next.js app-router prefers the named segment.
- No new API route needed — the client fans out N concurrent `POST /api/generate` calls (one per outfit), each with `model: "flux-kontext"`, `mediaType: "image"`, and `imageUrl: <person-image-url>`. The outfit reference is embedded in the `prompt` string as an explicit URL clause so the edit-model can pick it up.

## Components (under `components/`)

- `components/fashion/fashion-factory.tsx` — top-level client component. Holds all state (person, outfits[], prompt, per-shot status, per-shot resultUrl). Wires the generate button. `data-testid="fashion-factory"`.
- `components/fashion/person-dropzone.tsx` — single-slot file/URL dropzone, mirrors the existing `tool-page.tsx` image-upload UX (click-or-paste-URL, blob preview). `data-testid="person-dropzone"`.
- `components/fashion/outfit-grid.tsx` — 6 outfit-slot tiles, each independently swappable, with plus/preview/remove states. `data-testid="outfit-grid"`. Children carry `data-testid="outfit-slot-<index>"` (0-5).
- `components/fashion/lookbook-grid.tsx` — results grid that renders one `LookbookTile` per outfit. `data-testid="lookbook-grid"`. Children carry `data-testid="lookbook-tile-<index>"` and expose `data-status="idle|running|succeeded|failed"`.
- `components/fashion/lookbook-tile.tsx` — individual result tile with thumbnail, download button, and retry-on-failure button.
- `components/fashion/lookbook-share-button.tsx` — posts the full set (or just the succeeded shots) to `/api/community/posts` as a single `toolUsed: "fashion-factory"` post; reuses the pattern from `components/social/share-button.tsx`.

All components must:
- Use only the memacta design-palette tokens: `bg-brand-gradient`, `text-brand-gradient`, `bg-[#181828]`, `bg-[#1e1e32]`, `border-white/15`, `text-white/70`, `bg-[#FE2C55]` (error), `text-purple-400` (hover accents).
- Never use `slate-*`, `zinc-*`, or `gray-<n>` tokens (repo-wide ban confirmed during 2026-04-16 audit).
- Mark `"use client"` only where state is needed.

## Data-model deltas

**None.** The feature reuses existing models:

- `Generation` — one row per outfit shot, populated automatically by the existing `/api/generate` POST handler (lines 161-176 of `app/api/generate/route.ts`). `model` = `"flux-kontext"`, `mediaType` = `"image"`, `imageUrl` = person source URL, `prompt` = composed text that embeds the outfit reference URL.
- `Post` — one row created when the user posts the lookbook via `/api/community/posts`. `toolUsed` = `"fashion-factory"`. No schema change: the existing `toolUsed String?` column is already aggregated by `lib/profile.ts::computeTopModels`, so Fashion Factory will surface correctly on creator profiles.
- `CreditTransaction` — N rows (one per outfit shot) from the existing credit-deduct flow.

No Prisma migration required. This is a pure-frontend + existing-API feature.

## Provider adapter contract

No new provider adapter. Fashion Factory issues N independent calls against the existing `/api/generate` route, which resolves to `falProvider.generate()` with `model: "flux-kontext"`. The per-request shape is the existing `GenerationRequest`:

```ts
interface FashionShotRequest {
  prompt: string;      // composed via composeFashionPrompt()
  model: "flux-kontext";
  mediaType: "image";
  imageUrl: string;    // the person reference URL
  aspectRatio?: "1:1"; // default square for lookbook consistency
}
```

The prompt composition lives in a new pure helper `lib/fashion.ts::composeFashionPrompt(personUrl, outfitUrl, stylePrompt)` so it is unit-testable in isolation. The helper returns a single string of the form:

```
Outfit transfer. Keep the person's face and body identity exactly. Dress them in the outfit from this reference image: <outfitUrl>. <userStylePrompt-or-default>. Studio-quality, editorial lighting, full-body shot.
```

A second pure helper `lib/fashion.ts::buildFashionBatch(personUrl, outfitUrls[], stylePrompt)` returns an array of request payloads ready for `fetch("/api/generate", ...)`.

## Acceptance criteria

1. `app/tools/fashion-factory/page.tsx` renders at `/tools/fashion-factory` with the fuchsia-pink-orange brand gradient header and zero `slate-`/`zinc-` tokens.
2. The page is linked from `/apps` (either by adding a `fashion-factory` entry to `lib/tools/p2-tools.ts` with `category: "identity"`, `mediaOut: "image"`, and appropriate inputs, or by appending a manual entry to the ALL_TOOLS array in `app/apps/page.tsx`). It is also reachable from the sidebar "Identity" section, inserted between "Outfit Swap" and "AI Influencer".
3. The user can upload exactly 1 person image (drag-drop, click-to-pick, or paste URL). The UI disables generation until a person is provided.
4. The user can add 1 to 6 outfit images in any order; empty slots are skipped. The UI disables generation until at least 1 outfit is provided.
5. An optional style-prompt textarea is present and, when populated, is merged into every per-outfit prompt via `composeFashionPrompt`.
6. Clicking "Generate Lookbook" fans out N concurrent `POST /api/generate` calls (one per filled outfit), each with `model: "flux-kontext"`, `mediaType: "image"`, `imageUrl` = person URL, `prompt` = result of `composeFashionPrompt(...)`. Use `Promise.allSettled` so one rejection does not short-circuit the batch.
7. Each result tile reflects the real status lifecycle: `idle` -> `running` (spinner) -> `succeeded` (thumbnail + download) or `failed` (error pill + retry button). One failed shot must not break the rest of the grid.
8. Retry on a failed tile fires a new `POST /api/generate` against the same payload and updates only that tile's state.
9. "Post lookbook to community" submits a single post to `POST /api/community/posts` with `toolUsed: "fashion-factory"`, `mediaUrl` = first succeeded shot URL, `title` = `"${N}-look fashion factory drop"`, and `description` = user's style prompt. Disabled until at least one shot has succeeded.
10. Anonymous users get the existing `anon_generations` cookie treatment — first few shots succeed for free, subsequent shots return `401 auth_required` and the UI surfaces a single aggregated signup prompt (not N duplicate toasts).
11. Authenticated users are charged the real credit cost — 5 credits x (# outfits) for `flux-kontext`. Partial failures are refunded per the existing `/api/generate` behaviour; the UI shows the remaining credit balance after the batch completes (using the `creditsRemaining` field the API already returns).
12. `composeFashionPrompt` and `buildFashionBatch` are pure helpers in `lib/fashion.ts` (no React, no DB) and are fully unit-tested.
13. All E2E tests pass in mock-provider mode (when `FAL_KEY` is unset, the mock provider returns immediately). The real-fal round-trip test (test 8) is gated with `test.skip(!process.env.FAL_KEY)`.
14. No regression: the 18-model detail pages, `/u/<username>`, `/community`, `/apps`, and existing `/tools/<slug>` routes all continue to render.
15. `npm run build` succeeds cleanly and the route manifest contains `/tools/fashion-factory`.

## Test cases

### Vitest unit tests — `tests/unit/fashion.test.ts`

1. `composeFashionPrompt("person.png", "outfit.png", "editorial light")` — returned string contains the literal `outfit.png`, contains the literal `editorial light`, and does NOT contain `person.png` (the person is carried by `imageUrl`, not by prompt text).
2. `composeFashionPrompt("p.png", "o.png", "")` — style-prompt fallback is used; result includes the default `"Studio-quality, editorial lighting"` phrase.
3. `composeFashionPrompt("p.png", "https://cdn.x.com/o.jpg?token=abc&v=2", "noir")` — outfit URL embedded verbatim, querystring preserved, no double-escaping.
4. `composeFashionPrompt("p.png", "o.png", "style\nwith\nnewlines")` — newlines are preserved or collapsed but the result remains JSON-encodable (`JSON.stringify` round-trips).
5. `buildFashionBatch("p.png", ["o1.png", "o2.png"], "editorial")` — returns an array of length 2, each element has `model: "flux-kontext"`, `mediaType: "image"`, `imageUrl: "p.png"`, `aspectRatio: "1:1"`, and a prompt produced by `composeFashionPrompt`.
6. `buildFashionBatch("p.png", [], "")` — returns an empty array (does not throw).
7. `buildFashionBatch("p.png", new Array(7).fill("o.png"), "")` — clamps to 6 or throws a typed `"too many outfits"` error; pick one and test deterministically.
8. `buildFashionBatch("", ["o.png"], "")` and `buildFashionBatch("p.png", [""], "")` — throw or return an empty guarded array (pick one path and assert).

### Vitest unit tests — `tests/unit/sidebar-identity.test.ts` (new, small)

9. Sidebar Identity section contains a link with `href="/tools/fashion-factory"` and the label `"Fashion Factory"`, positioned between `"Outfit Swap"` and `"AI Influencer"`.

### Playwright E2E — `tests/e2e/fashion-factory.spec.ts`

1. **Happy path (mocked provider)** — visit `/tools/fashion-factory`, paste a URL into the person slot, paste 2 URLs into outfit slots 0 and 1, fill the style-prompt textarea, click "Generate Lookbook", assert both lookbook tiles reach `data-status="succeeded"` within 30s.
2. **Generate disabled until inputs present** — visit the page, confirm the "Generate Lookbook" button is disabled with zero outfits, becomes enabled after one outfit + person are both provided, and becomes disabled again when the person slot is cleared.
3. **Partial failure isolates** — inject a failing URL pattern (the mock-provider rejects URLs containing `"fail"`) so shot #1 fails while shot #0 succeeds; assert tile 0 shows a thumbnail and tile 1 shows a retry button.
4. **Retry recovers** — from the partial-failure state, swap the outfit URL on tile 1 to a passing one, click retry, assert the tile re-enters `running` and then `succeeded`.
5. **Sidebar entry** — from any page, open the sidebar, expand the Identity section, click "Fashion Factory", assert the URL is `/tools/fashion-factory` and the H1 matches.
6. **Appears on /apps** — visit `/apps`, locate the Fashion Factory card, click it, assert navigation to `/tools/fashion-factory`.
7. **Community post (mocked)** — after a successful batch, click "Post lookbook to community", assert a success toast and that `/community` now contains a post whose `toolUsed` badge reads "fashion-factory".

### Environment-gated E2E (skipped when `FAL_KEY` unset)

8. **Real fal.ai round-trip** — same as test 1 but with `FAL_KEY` present; assert returned URLs are on `cdn.fal.ai` or `v3.fal.media`.

---

**Implementation notes for the builder:**

- Base the file-upload UX on `components/tools/tool-page.tsx` — that pattern already works with the existing `/api/upload` endpoint for blob->url conversion (see commit e4e4f6f).
- The concurrent fan-out MUST use `Promise.allSettled`, not `Promise.all`, so one rejection does not short-circuit the batch. Per-tile state lives in a `Record<number, ShotState>` keyed by outfit index.
- The dedicated `app/tools/fashion-factory/page.tsx` takes precedence over the generic `app/tools/[slug]/page.tsx` catch-all in Next.js app-router, so you do NOT need to special-case the catch-all. Mirror the `app/tools/ai-influencer/page.tsx` precedent.
- If you decide to also add a `fashion-factory` entry to `lib/tools/p2-tools.ts` (for the /apps grid), keep its `slug: "fashion-factory"` aligned with the dedicated route path. The generic `tool-page.tsx` is NOT compatible with this feature (it can't do batch fan-out) — the dedicated page must render instead.
- Credit-display already listens for successful `/api/generate` responses via the `creditsRemaining` field — no extra plumbing needed. After the batch completes, take the `creditsRemaining` from the LAST successful response and surface it in the UI.
- For the community-post title, use `"${N}-look fashion factory drop"`.
- Do NOT edit `prisma/schema.prisma`. Do NOT add a migration. Do NOT add Stripe-dependent code.

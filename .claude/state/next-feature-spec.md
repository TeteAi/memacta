# Feature: higgsfield-popcorn

- **Name:** Higgsfield Popcorn
- **Category:** P4 — Effects & Templates (short-form vertical video presets)
- **Priority:** P1 (highest-ROI remaining gap; pairs with just-shipped Soul Cinema to cover both long-form narrative and short-form vertical)
- **Source:** `feature-gap-analysis.md` — "Higgsfield Popcorn" listed under MISSING. Chosen over UGC Factory (structurally near-identical to shipped Fashion Factory), Mixed Media (too large — unified canvas requires timeline surgery), and Reference Extension (heavy overlap with shipped Multi Reference + Soul ID + Soul Moodboard + Soul Cast).

## User story

As a creator who wants to feed a TikTok/Reels posting schedule, I open **Popcorn**, pick one of ~12 short-form presets (each is a recipe: base prompt + tone + motion style + 9:16 aspect + 3s or 5s duration), optionally upload a subject image, type a one-line subject idea, and click **Pop** once. Popcorn fires 3 vertical clips in parallel — same preset, three seeds — so I get a variation pack I can immediately share to the community or stage in the social scheduler. One clip failing does not block the others; each tile has its own retry.

The key differentiator versus Soul Cinema: Popcorn is preset-first (pick a vibe, skip the scripting), always 9:16, always short, and always returns **3 variations** rather than a narrative sequence. It is the "scroll-bait factory" the Cinema flow is not.

## Wireframe

```
+--------------------------------------------------------------------------+
|  Apps / Effects / Popcorn                                                |
|                                                                          |
|  [icon]  Popcorn                                                  beta   |
|          Pop out 3 short-form vertical clips from one preset             |
|                                                                          |
|  Step 1 - Pick a preset ----------------------------------------------   |
|  +------+ +------+ +------+ +------+                                     |
|  |Snack | |Cafe  | |Neon  | |Retro |   [ see all 12 -> ]                 |
|  |Hop   | |Gloom | |Runway| |GRWM  |                                     |
|  +------+ +------+ +------+ +------+                                     |
|   active                                                                 |
|                                                                          |
|  Step 2 - Subject (optional) -----------------------------------------   |
|  +- drop subject image ---------------------------------------+          |
|  |  [ cleared | uploaded thumb ]                              |          |
|  +------------------------------------------------------------+          |
|  +-----------------------------------------------------------+           |
|  | "a 22-yo skateboarder with cherry-red hair"               |           |
|  +-----------------------------------------------------------+           |
|                                                                          |
|  Model: kling-25-turbo    Cost: 9 credits x 3 = 27 credits               |
|  +----------------------------------------------+                        |
|  |              POP (generate 3)                |                        |
|  +----------------------------------------------+                        |
|                                                                          |
|  Results (9:16 vertical) ---------------------------------------------   |
|  +-----+  +-----+  +-----+                                               |
|  |seed |  |seed |  |seed |   each tile: loading -> video -> retry|share  |
|  | #1  |  | #2  |  | #3  |                                               |
|  |9:16 |  |9:16 |  |9:16 |                                               |
|  +-----+  +-----+  +-----+                                               |
|                                                                          |
|  [ Share pack to community ]   [ Schedule all to social ]                |
+--------------------------------------------------------------------------+
```

## Routes

- `app/tools/popcorn/page.tsx` — dedicated route wins over `app/tools/[slug]/page.tsx` fallback. Metadata + server-rendered shell that hosts the client component.
- `app/api/popcorn/pack/route.ts` — `POST` endpoint. Auth-gated. Accepts `{ presetId, subjectPrompt, subjectImageUrl? }`, returns `{ packId, clips: Array<{ seed, mediaUrl } | { seed, error }> }`. Internally maps to `buildPopcornBatch(...)` and fans out to the existing provider layer (mirrors the Fashion Factory / Soul Cinema pattern; no new provider code). **Alternative accepted:** the client MAY skip this route and fan out directly to `/api/generate` three times — either is acceptable. The server route is cleaner because it lets us record a single `Project` row with `clipsJson` holding all three seeds, rather than three independent `Generation` rows.
- `app/api/popcorn/share/route.ts` — `POST`. Auth-gated. Accepts `{ clips: string[], presetId }`, creates a `Post` row with `toolUsed: "popcorn"` and `mediaType: "video"` (first clip becomes primary `mediaUrl`, other clips JSON-stringified into `description`). Returns `{ postId }`.

No changes to `/api/generate`. No changes to `/api/soul-cinema/*`.

## Components

All new files under `components/popcorn/`:

- `components/popcorn/popcorn.tsx` — client root. Holds state `{ presetId, subjectPrompt, subjectUrl, clips }` plus generation lifecycle. Wires `handleAuthRequired` from `@/lib/auth-redirect`. Fires `Promise.allSettled` fan-out to `/api/generate` (or `/api/popcorn/pack`) for each of 3 seeds.
- `components/popcorn/preset-grid.tsx` — renders the 12 preset cards from `POPCORN_PRESETS` (see data model). Each card: gradient thumb (no real image URL — CSS gradient keyed on preset id), name, 3-word tagline, selected state uses `bg-brand-gradient` + `aria-pressed="true"`. Shows first 4 by default with a `see all` expander to reveal the rest.
- `components/popcorn/subject-uploader.tsx` — reuses the Fashion Factory `person-dropzone` visual language. `data-testid="subject-uploader"`. Emits `onUploaded(url, previewDataUrl)`.
- `components/popcorn/subject-input.tsx` — textarea. `data-testid="subject-prompt"`. 140-char soft limit. Shows remaining count.
- `components/popcorn/clip-grid.tsx` — 3-column (desktop) / 1-column (mobile) responsive grid. Renders 3 `<ClipTile/>` components.
- `components/popcorn/clip-tile.tsx` — `data-testid="clip-tile"` + `data-seed={seed}` + `data-status={status}` where status is one of `idle | running | succeeded | failed`. 9:16 aspect container. On success, renders `<video autoplay muted loop playsinline>`. On failure, renders retry button (`data-testid="retry-clip-btn"`). Single clip download button.
- `components/popcorn/pack-actions.tsx` — "Share pack to community" (calls `/api/popcorn/share` or existing `/api/community/posts`) + "Schedule all to social" (links to `/social/schedule?urls=...`). Both disabled until at least one clip is `succeeded`.

Edits to existing files:

- `components/sidebar.tsx` — add `{ label: "Popcorn", href: "/tools/popcorn" }` inside the **Effects & Templates** section, inserted as the **second** item directly after `All Effects` (sibling of `On Fire`, before `Neon Glow`). This places it where discovery traffic lands.
- `lib/tools/p2-tools.ts` — append a new `popcorn` entry so it surfaces on `/apps`. Category `"editing"` (Popcorn is preset-driven media-out, not identity). `mediaOut: "video"`. Inputs: `[{ key: "preset", label: "Preset", type: "text" }, { key: "subject", label: "Subject prompt", type: "prompt" }]`. Name `"Popcorn"`. Description `"Pick a short-form preset, pop out 3 vertical variations in one click."`.

## Data model deltas

**Zero Prisma migrations.** All data reuses existing columns:

- `Project.clipsJson` — stores `{ presetId, seeds: [n1, n2, n3], clips: [{ seed, url }] }` when user hits "Save pack as project".
- `Post.toolUsed` — set to `"popcorn"` when user shares a pack. `Post.description` holds the preset id + extra clip URLs as JSON (pattern already used by Fashion Factory lookbook share).
- `Generation` rows — created transparently by `/api/generate` as usual.

Preset library is **pure code**, not DB, in a new file:

- `lib/popcorn.ts` — exports `POPCORN_PRESETS: PopcornPreset[]`, `getPopcornPreset(id)`, `buildPopcornBatch(presetId, subjectPrompt, subjectImageUrl?, seeds?)`, and `composePopcornPrompt(preset, subjectPrompt)`. Mirrors the `lib/fashion.ts` + `lib/soul-cinema.ts` pattern. Fully unit-testable; no React, no DB.

```ts
// lib/popcorn.ts shape
export type PopcornPreset = {
  id: string;                               // "snack-hop", "cafe-gloom", ...
  name: string;                             // "Snack Hop"
  tagline: string;                          // "rapid pastel pan"
  gradientClass: string;                    // Tailwind gradient for thumb
  basePrompt: string;                       // baked-in style directive
  motion: string;                           // "rapid handheld pan"
  tone: string;                             // "playful, pastel, snackable"
  model: "kling-25-turbo" | "seedance-20";  // short-form friendly
  durationSec: 3 | 5;
  aspectRatio: "9:16";
};
```

12 presets to implement: `snack-hop`, `cafe-gloom`, `neon-runway`, `retro-grwm`, `sunset-drive`, `mirror-glitch`, `tokyo-streetwear`, `studio-cook`, `locker-room-pump`, `pet-close-up`, `weekend-hike`, `night-in`.

## Provider adapter contract

**No new provider adapter.** Popcorn is a composition layer over existing providers. The `buildPopcornBatch` helper produces request payloads in the exact `/api/generate` wire format already validated by the existing `Body` Zod schema in `app/api/generate/route.ts`:

```ts
export interface PopcornGenerateRequest {
  prompt: string;           // = composePopcornPrompt(preset, subjectPrompt)
  model: string;            // = preset.model
  mediaType: "video";
  imageUrl?: string;        // optional subject reference passthrough
  aspectRatio: "9:16";      // always portrait
  duration: number;         // = preset.durationSec (3 or 5)
  seed: number;             // deterministic seeds from buildPopcornBatch
}

export function buildPopcornBatch(
  presetId: string,
  subjectPrompt: string,
  subjectImageUrl?: string,
  seeds?: [number, number, number],
): PopcornGenerateRequest[] {
  // length === 3, throws if preset not found or subjectPrompt empty
}
```

Seeds default to `[17, 42, 91]` for reproducibility in tests. When called without seeds, the production client passes `[Date.now() % 1e6, Date.now() % 1e6 + 7, Date.now() % 1e6 + 13]` so variations are distinct.

## Acceptance criteria

1. `npx next build` passes with no new errors or warnings.
2. `/tools/popcorn` returns 200 and renders a page with heading `Popcorn` and `data-testid="popcorn"` on the root client component.
3. The preset grid shows **exactly 12** preset cards, each with `data-testid="preset-card"` and a `data-preset-id` attribute matching one of the 12 ids in `POPCORN_PRESETS`.
4. Clicking a preset card sets `aria-pressed="true"` on that card and `"false"` on the other 11; the selected preset id is reflected in a `data-selected-preset` attribute on the root `popcorn` testid container.
5. The subject-prompt textarea enforces a **140-char soft limit** with a visible remaining counter.
6. The **Pop** button is disabled until a preset is selected AND the subject prompt has at least one non-whitespace character. Button has `data-testid="pop-btn"`.
7. Clicking Pop fires **exactly 3** parallel `POST /api/generate` requests (or 1 `POST /api/popcorn/pack` that fans out server-side — either is acceptable). Each request has `mediaType: "video"`, `aspectRatio: "9:16"`, `duration` matching the preset, and a distinct `seed`.
8. The three clip tiles render immediately in `running` state (`data-status="running"`), then each transitions independently to `succeeded` (with a `<video>` child element) or `failed` (with a retry button).
9. A single-clip failure does **not** abort the other two. Failed tile shows `data-testid="retry-clip-btn"`; clicking retry re-fires only that one seed and the tile re-enters `running`.
10. On 401 `auth_required` from any of the 3 requests, the client calls `handleAuthRequired` once (not thrice) and bounces the browser to `/auth/signup?return=/tools/popcorn`.
11. With at least 1 `succeeded` clip the `Share pack to community` button enables. Clicking it calls `/api/popcorn/share` (or `/api/community/posts` with `toolUsed: "popcorn"`) and on success navigates to `/community`.
12. Sidebar **Effects & Templates** section has a `Popcorn` link as the **second** item (right after `All Effects`), with `href="/tools/popcorn"`.
13. `/apps` grid card for `popcorn` exists, renders its category badge (`editing`) and media-out badge (`video`), and links to `/tools/popcorn`.
14. Design tokens are consistent: cards use `bg-[#181828]`, borders use `border-white/15` (or `white/10`), CTAs use `bg-brand-gradient` + `glow-btn`. **Zero** occurrences of `slate-` or `zinc-` tokens in any new file under `components/popcorn/`, `app/tools/popcorn/`, `app/api/popcorn/`, or `lib/popcorn.ts`.
15. **No `blob:` URLs reach `/api/generate`**. The subject-uploader must upload to `/api/upload` first and pass back the hosted URL (same pattern as `person-dropzone.tsx`).

## Test cases

### Vitest unit tests — `tests/popcorn.test.ts`

All tests operate on pure helpers in `lib/popcorn.ts`. No DB, no network, no React.

1. `POPCORN_PRESETS.length === 12` — guards against accidental preset drift.
2. Every preset has a non-empty `id`, `name`, `tagline`, `basePrompt`, `motion`, `tone`, `gradientClass`; `aspectRatio === "9:16"`; `durationSec` is 3 or 5; `model` is one of `"kling-25-turbo"` or `"seedance-20"`.
3. Preset ids are globally unique (`new Set(ids).size === 12`).
4. `getPopcornPreset("snack-hop")` returns the matching preset.
5. `getPopcornPreset("does-not-exist")` returns `undefined`.
6. `composePopcornPrompt(preset, "a skateboarder")` includes the subject verbatim, includes `preset.basePrompt`, includes `preset.motion`, includes `preset.tone`, and does NOT include `subjectImageUrl`.
7. `buildPopcornBatch("snack-hop", "a skater")` returns an array of length 3.
8. Every element has `mediaType: "video"`, `aspectRatio: "9:16"`, and `duration === preset.durationSec`.
9. The 3 elements have 3 distinct seeds (`new Set(batch.map(b => b.seed)).size === 3`).
10. Passing `subjectImageUrl: "https://x.com/a.jpg"` sets `imageUrl` on every element; omitting it means no element has `imageUrl`.
11. `buildPopcornBatch("snack-hop", "")` throws `Error` with message matching `/subject/i` (empty subject guard).
12. `buildPopcornBatch("unknown-preset", "anything")` throws `Error` with message matching `/preset/i`.
13. Explicit seeds override defaults: `buildPopcornBatch("snack-hop", "x", undefined, [1,2,3]).map(b=>b.seed)` equals `[1,2,3]`.
14. Sidebar assertion: verify via import that the Effects & Templates section of `SIDEBAR_SECTIONS` (lift it to a module-level export if not already) contains, at index 1, `{ href: "/tools/popcorn", label: "Popcorn" }`. If lifting the constant is disruptive, use a static source-file grep inside the test that asserts the exact line exists in `components/sidebar.tsx`.
15. `P2_TOOLS` contains exactly one entry with `slug === "popcorn"`, `category === "editing"`, `mediaOut === "video"`, and `inputs.length >= 2`.

### Playwright E2E — `e2e/popcorn.spec.ts`

Happy path and failure paths. Uses the dev server, `mockProvider` in the AI layer, and `test.skip(!process.env.FAL_KEY, ...)` **inside the test body** (NOT at describe-block level — this was a real regression the Soul Cinema round fixed) for the one real-fal.ai round-trip.

1. **Page renders.** `await page.goto('/tools/popcorn')`. `expect(page.getByRole('heading', { name: 'Popcorn' })).toBeVisible()`. `expect(page.getByTestId('popcorn')).toBeVisible()`.
2. **Preset grid has 12 cards.** `expect(page.getByTestId('preset-card')).toHaveCount(12)`. (If the UI collapses to 4 by default, click `see all` first.)
3. **Preset selection toggles aria-pressed.** Click the 3rd preset card; assert it has `aria-pressed="true"` and the other cards have `aria-pressed="false"`.
4. **Pop button gated.** Initially disabled. Select preset — still disabled (no subject). Type subject — enabled.
5. **Happy path — 3 clips succeed (mocked provider).** Fill subject, select preset, click `pop-btn`. Wait for 3 `clip-tile` elements with `data-status="succeeded"`. Assert each has a nested `<video>` element. Assert the three `data-seed` attributes are distinct.
6. **Partial failure + retry.** Route-intercept `/api/generate` so the second of three calls responds with `{status:"failed"}` (HTTP 502). After Pop: exactly 1 tile has `data-status="failed"`, 2 have `data-status="succeeded"`. The failed tile exposes `retry-clip-btn`. Click retry — that tile re-enters `running`, then `succeeded` (intercept reset for retry). The other two tiles remain untouched.
7. **Auth-required bounce.** Intercept `/api/generate` to return 401 `{error:"auth_required"}`. Click Pop. Expect `page.url()` to equal `/auth/signup?return=/tools/popcorn` (wait for navigation). Guarantees `handleAuthRequired` fires at most once despite the 3-way fan-out.
8. **Sidebar link present.** Open sidebar, expand Effects & Templates, click `Popcorn`, expect `/tools/popcorn`.
9. **/apps shows the card.** `await page.goto('/apps')`. Click the card labelled `Popcorn`. Expect `/tools/popcorn`.
10. **Share pack action.** After mocked happy path, click `Share pack to community`, assert final URL starts with `/community` and the POST body captured via request interception includes `toolUsed: "popcorn"`.
11. **Design tokens.** `await expect(page.locator('[class*="slate-"], [class*="zinc-"]')).toHaveCount(0)` on `/tools/popcorn`.
12. **9:16 clips.** Each clip-tile container has `aspect-[9/16]` (or equivalent `style.aspectRatio === "9 / 16"`) — assert via `getAttribute('class')` regex or computed style.
13. **Real fal.ai (optional, gated).** `test.skip(!process.env.FAL_KEY, 'needs FAL_KEY')` placed **inside the test body**. Fills form, clicks Pop, waits up to 90s for at least one tile to transition to `succeeded` with a real `https://fal.media/...` URL. This test is allowed to be flaky/slow; it is opt-in via env.

---

### Builder instructions summary

1. Do NOT touch `/api/generate`, `/api/soul-cinema/*`, `lib/soul-cinema.ts`, `lib/fashion.ts`, or any existing component outside of `components/sidebar.tsx` and `lib/tools/p2-tools.ts`.
2. Create files in this order: `lib/popcorn.ts` -> unit tests -> `app/api/popcorn/pack/route.ts` + `app/api/popcorn/share/route.ts` -> components -> `app/tools/popcorn/page.tsx` -> sidebar + p2-tools edits -> e2e.
3. Mirror the auth pattern from `components/fashion/fashion-factory.tsx` (see `handleAuthRequired`, `Promise.allSettled`, upload-before-generate).
4. Every new UI file must pass the design-token grep (no `slate-`, `zinc-`, `gray-` as base tokens — use `white/10`, `white/15`, `#181828`, `#111122`, `text-brand-gradient`, `bg-brand-gradient`, `glow-btn`).
5. Remember the Windows quirk: do NOT run `prisma generate` in builder scripts — it hits a DLL file lock. `npx next build` alone is the green-light gate.

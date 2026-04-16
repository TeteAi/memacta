# Feature: mixed-media

- **Name:** Mixed Media Studio
- **Category:** Effects & Templates (Preset-driven creation)
- **Priority:** P4
- **Source:** `feature-gap-analysis.md` line 6 — "Mixed Media" listed under MISSING completely. The stale feature-status.json entries `mixed-media-presets` and `mixed-media-community` from 2026-04-09 are stubs: `grep -ri "mixed.?media" lib/ components/ app/` returns zero code files. This is the fifth tractable "preset factory" tool to complete memacta's creation matrix, complementing:
  - **Fashion Factory** (outfit-on-person batch)
  - **Soul Cinema** (multi-scene narrative)
  - **Popcorn** (short-form 9:16 preset variations)
  - **Copilot** (conversational director)
  - **Mixed Media** (style-blend single-shot) ← this feature

Chosen this round over UGC Factory (structurally near-identical to Fashion Factory — re-skin risk explicitly flagged by caller), Reference Extension (heavy overlap with shipped Soul ID + Soul Moodboard + Multi Reference + Soul Cast), Sora 2 Upscale (narrow single-model duplicate of Upscale), Careers/Discord (low-impact quick wins better handled by deploy-agent in a final sweep). Mixed Media is the widest-reach remaining creation surface and is distinct from everything shipped: it blends **multiple aesthetic styles** into a single output (e.g. "anime + photoreal", "oil-painting + 3D-render"), whereas prior preset tools pick ONE style per generation.

## User story

**As a** creator who wants visually unique outputs that don't look like generic single-style AI,
**I want to** pick 2-3 aesthetic style presets (e.g. "Anime Realism", "Renaissance Cyberpunk", "Pixel Dreamscape"), optionally drop a subject reference image, and type a subject prompt,
**so that** memacta fan-outs variations in parallel to the real fal.ai pipeline and I get a shareable lookbook of distinctive mixed-aesthetic images/videos that stand out on social.

## Wireframe (ASCII)

```
+--------------------------------------------------------------+
| [<- Back]  Mixed Media Studio             [Credits: 120]      |
|                                                                |
|   Blend aesthetic styles into one striking shot.              |
|                                                                |
| +- 1. Pick 2-3 styles to blend -----------------------------+ |
| |  [Anime Realism]  [Oil Painting]  [3D Claymation]        | |
| |  [Pixel Dream]    [Renaissance]   [Cyberpunk Noir]       | |
| |  [Vaporwave]      [Paper Cutout]  [Sketch-to-Real]       | |
| |  [Watercolor]     [Low-Poly]      [Chromatic Glitch]     | |
| |    ^active ok       ^active ok      (tap to toggle)      | |
| +----------------------------------------------------------+ |
|                                                                |
| +- 2. Subject --------------------------------------------+   |
| |  Prompt: [A warrior on horseback charging through mist_]|   |
| |  Reference (optional): [ Drop image or click to upload ]|   |
| +---------------------------------------------------------+   |
|                                                                |
| +- 3. Output --------------------------------------------+     |
| |  Media: [Image ok] [Video]    Aspect: [1:1] [16:9] [9:16]|   |
| |  Variations per blend: [1] [2 ok] [3]                 |     |
| +-------------------------------------------------------+     |
|                                                                |
|   Preview: "anime-realism x oil-painting x warrior..."        |
|   Cost: 2 styles x 2 variations = 4 generations (12 credits)  |
|                                                                |
|                              [ Generate Blend Pack ]  [glow]  |
|                                                                |
|                                                                |
| -- Lookbook -------------------------------------------------- |
|                                                                |
|  [VariantA ok] [VariantB ok] [VariantC retry] [VariantD ok]   |
|   Anime x Oil  Anime x Oil   Oil x Claymtn    Oil x Claymtn   |
|                                                                |
|  Failed tile shows [ Retry ] button - clicking re-dispatches  |
|  that single variation only (keeps the rest).                 |
+--------------------------------------------------------------+
```

## Routes (Next.js app-router)

- `app/tools/mixed-media/page.tsx` — server entry, exports `metadata` (title: "memacta - Mixed Media Studio"). Imports the client component wrapped in `<Suspense fallback={<MixedMediaSkeleton/>}>` because the client component reads `useSearchParams` to support `/tools/mixed-media?preset=anime-realism&subject=...` deep links from Copilot.
- `app/api/mixed-media/share/route.ts` — POST `{ items: [{ prompt, styles, url, mediaType }] }` -> persists a `Post` row with `toolUsed="mixed-media"` using existing Prisma schema. Gated by `getServerSession(authOptions)`; returns 401 with `{ error: "auth_required", redirect: "/auth/signin?callbackUrl=/tools/mixed-media" }` on anon.

No new top-level route. Reuses `/api/generate` for fan-out (same pattern as Fashion Factory / Soul Cinema / Popcorn).

## Components (filenames under `components/mixed-media/`)

- `components/mixed-media/mixed-media-client.tsx` — main `"use client"` component. Owns state: `selectedStyleIds: string[]`, `subjectPrompt: string`, `referenceUrl: string | null`, `mediaType: "image"|"video"`, `aspectRatio: "1:1"|"16:9"|"9:16"`, `variationsPerBlend: 1|2|3`, `isGenerating: boolean`, `results: MixedMediaResult[]`. Reads `useSearchParams()` for `?preset=<id>` and `?subject=<text>` deep-link seeding.
- `components/mixed-media/style-preset-grid.tsx` — 4x3 grid of 12 style-preset tiles. Each tile has `aria-pressed`, gradient background (matches Popcorn tile visual grammar), `data-testid="style-tile"`, `data-style-id={id}`, `data-active={true|false}`. Enforces min 2, max 3 selection.
- `components/mixed-media/subject-panel.tsx` — prompt textarea + optional reference image uploader (via existing `/api/upload`; uploads once, stores returned URL). `data-testid="subject-panel"`.
- `components/mixed-media/output-settings.tsx` — segmented controls for mediaType (image/video), aspectRatio (1:1/16:9/9:16), variationsPerBlend (1/2/3). `data-testid="output-settings"`.
- `components/mixed-media/lookbook-grid.tsx` — responsive grid of `MixedMediaTile`. Each tile shows generated media or skeleton/error. `data-testid="lookbook-grid"`.
- `components/mixed-media/mixed-media-tile.tsx` — single result tile: `data-testid="lookbook-tile"`, `data-status={"pending"|"succeeded"|"failed"}`, `data-blend-id`. Failed state shows a `[Retry]` button that re-dispatches that single variation only.
- `components/mixed-media/generate-button.tsx` — primary CTA using `className="glow-btn"`, disabled when `selectedStyleIds.length < 2 || !subjectPrompt.trim()`. `data-testid="generate-btn"`. Shows computed credit cost as secondary text: `{blends.length * variationsPerBlend * (mediaType === "video" ? 9 : 3)} credits`.
- `components/mixed-media/skeleton.tsx` — skeleton shown by the Suspense boundary while the client bundle hydrates.

## Data model deltas

**None.** Zero Prisma migrations.

- Sharing a blend re-uses existing `Post` model with `toolUsed="mixed-media"` and `mediaType` + `mediaUrl` + `prompt` (existing fields). `styles` metadata is serialized into the existing `prompt` field as a prefix like `[anime-realism x oil-painting] warrior on horseback...`.
- Generations flow through the existing `/api/generate` endpoint which already writes to `Generation` rows.
- No new enum values, no new columns, no migration.

## Provider adapter contract

**No new adapter.** Reuses existing `/api/generate` contract:

```ts
POST /api/generate
Body: {
  prompt: string;          // composed by lib/mixed-media.ts composeMixedMediaPrompt()
  model: string;           // "flux-kontext" for image, "kling-25-turbo" for video
  mediaType: "image" | "video";
  aspectRatio: "1:1" | "16:9" | "9:16";
  imageUrl?: string;       // optional subject reference passthrough (NEVER a blob: URL)
  duration?: number;       // 5 sec default for video
}
Response: { mediaUrl: string } | { error: "auth_required", redirect: string } | { error: string }
```

Fan-out uses `Promise.allSettled(requests.map(r => fetch("/api/generate", ...)))` — identical pattern to Fashion Factory, Soul Cinema, and Popcorn. No provider code added.

## Pure helper library (`lib/mixed-media.ts`)

Fully unit-testable, no React, no Prisma.

```ts
export type MixedMediaStyle = {
  id: string;            // slug, e.g. "anime-realism"
  name: string;          // display, e.g. "Anime Realism"
  tagline: string;       // one-liner for tile subtitle
  gradientClass: string; // Tailwind gradient for tile background
  promptFragment: string; // injected into composed prompt
  compatibleMedia: ("image"|"video")[]; // some styles only work for one media type
};

export const MIXED_MEDIA_STYLES: MixedMediaStyle[] = [
  { id: "anime-realism",     name: "Anime Realism",     tagline: "2D characters, 3D depth",
    gradientClass: "from-pink-500 to-purple-500",
    promptFragment: "anime character design blended with photorealistic lighting and cinematic depth",
    compatibleMedia: ["image", "video"] },
  { id: "oil-painting",      name: "Oil Painting",      tagline: "classical brushwork",
    gradientClass: "from-amber-600 to-rose-500",
    promptFragment: "rich oil-painting brushstrokes, Rembrandt-style lighting, thick impasto texture",
    compatibleMedia: ["image"] },
  { id: "3d-claymation",     name: "3D Claymation",     tagline: "stop-motion clay",
    gradientClass: "from-orange-400 to-yellow-400",
    promptFragment: "stop-motion claymation aesthetic, visible clay thumbprints, soft studio lighting",
    compatibleMedia: ["image", "video"] },
  { id: "pixel-dream",       name: "Pixel Dream",       tagline: "16-bit nostalgia",
    gradientClass: "from-cyan-400 to-violet-500",
    promptFragment: "16-bit pixel-art style with dithering, limited color palette, retro game aesthetic",
    compatibleMedia: ["image", "video"] },
  { id: "renaissance",       name: "Renaissance",       tagline: "museum grandeur",
    gradientClass: "from-yellow-700 to-amber-900",
    promptFragment: "Renaissance oil-painting composition, dramatic chiaroscuro, museum gallery aesthetic",
    compatibleMedia: ["image"] },
  { id: "cyberpunk-noir",    name: "Cyberpunk Noir",    tagline: "neon rain detective",
    gradientClass: "from-fuchsia-500 to-cyan-400",
    promptFragment: "cyberpunk noir atmosphere with neon-reflected rain, volumetric fog, detective-film framing",
    compatibleMedia: ["image", "video"] },
  { id: "vaporwave",         name: "Vaporwave",         tagline: "80s synth sunset",
    gradientClass: "from-pink-400 to-cyan-300",
    promptFragment: "vaporwave aesthetic, 80s synthwave sunset, chromatic gradient, retro computer-graphics",
    compatibleMedia: ["image", "video"] },
  { id: "paper-cutout",      name: "Paper Cutout",      tagline: "layered paper craft",
    gradientClass: "from-emerald-400 to-sky-400",
    promptFragment: "handcrafted paper cutout style, layered construction-paper depth, visible paper fibers",
    compatibleMedia: ["image"] },
  { id: "sketch-to-real",    name: "Sketch to Real",    tagline: "pencil becomes photo",
    gradientClass: "from-stone-400 to-stone-600",
    promptFragment: "hybrid pencil-sketch blending seamlessly into photorealistic rendering, graphite edge details",
    compatibleMedia: ["image"] },
  { id: "watercolor",        name: "Watercolor",        tagline: "soft wet-on-wet flow",
    gradientClass: "from-teal-300 to-blue-400",
    promptFragment: "watercolor wet-on-wet painting style, soft color bleeds, delicate washes",
    compatibleMedia: ["image"] },
  { id: "low-poly",          name: "Low Poly",          tagline: "geometric 3D",
    gradientClass: "from-violet-500 to-indigo-600",
    promptFragment: "low-polygon 3D-render aesthetic, faceted geometry, flat shaded lighting",
    compatibleMedia: ["image", "video"] },
  { id: "chromatic-glitch",  name: "Chromatic Glitch",  tagline: "RGB split VHS",
    gradientClass: "from-red-500 to-blue-500",
    promptFragment: "chromatic aberration glitch effect, RGB-channel split, VHS scanline interference",
    compatibleMedia: ["image", "video"] },
];

export type ComposeMixedMediaInput = {
  selectedStyleIds: string[];       // length 2 or 3
  subjectPrompt: string;             // user's subject description
  mediaType: "image" | "video";
};

export function composeMixedMediaPrompt(input: ComposeMixedMediaInput): string { /* ... */ }

export type MixedMediaBlend = {
  blendId: string;          // deterministic id: styles joined with "-x-"
  styleIds: string[];       // sorted copy for stability
  styleNames: string[];     // display names, same order
};

export function buildMixedMediaBlends(selectedStyleIds: string[]): MixedMediaBlend[] { /* ... */ }

export type MixedMediaBatchInput = {
  selectedStyleIds: string[];
  subjectPrompt: string;
  referenceUrl?: string;
  mediaType: "image" | "video";
  aspectRatio: "1:1" | "16:9" | "9:16";
  variationsPerBlend: 1 | 2 | 3;
  videoModel?: string;
  imageModel?: string;
};

export type MixedMediaRequest = {
  blendId: string;
  variationIndex: number;
  prompt: string;
  model: string;
  mediaType: "image" | "video";
  aspectRatio: "1:1" | "16:9" | "9:16";
  imageUrl?: string;
  duration?: number;
};

export function buildMixedMediaBatch(input: MixedMediaBatchInput): MixedMediaRequest[] { /* ... */ }
```

**Rules baked into helpers:**
1. `composeMixedMediaPrompt` MUST embed every selected style's `promptFragment` in order, joined with " fused with ", prefixed onto the subject prompt. Example: `"anime character design blended with photorealistic... fused with rich oil-painting brushstrokes... - subject: warrior on horseback charging through mist"`.
2. `composeMixedMediaPrompt` MUST NOT include the raw `referenceUrl` in the prompt text — the URL goes into the request as `imageUrl` only.
3. `buildMixedMediaBlends` throws if `selectedStyleIds.length < 2 || > 3`. A single blend combines ALL selected styles (not pairwise permutations) — so 2 styles -> 1 blend, 3 styles -> 1 blend. The `variationsPerBlend` field controls how many outputs per blend.
4. `buildMixedMediaBatch` returns `variationsPerBlend` requests per blend. With 1 blend and `variationsPerBlend=3`, returns 3 requests; with `variationsPerBlend=0`, returns empty.
5. Default model: `"flux-kontext"` for image, `"kling-25-turbo"` for video. Override via `videoModel`/`imageModel`.
6. If a selected style's `compatibleMedia` does not include the chosen `mediaType`, `buildMixedMediaBatch` throws `MixedMediaIncompatibleMediaError` — the UI must validate and disable the generate button BEFORE calling it.

## API contracts

### POST `/api/mixed-media/share`

**Auth:** Required via `getServerSession(authOptions)`. On anon, returns `401` with `{ error: "auth_required", redirect: "/auth/signin?callbackUrl=/tools/mixed-media" }`. Client wraps the fetch call with `handleAuthRequired` from `@/lib/auth-redirect`.

**Request:**
```ts
{
  items: Array<{
    prompt: string;          // composed prompt from composeMixedMediaPrompt
    styleIds: string[];      // for display chip rendering on /community
    mediaUrl: string;        // https URL returned by /api/generate
    mediaType: "image" | "video";
  }>;
  isPublic: boolean;         // defaults true
}
```

**Response:** `{ success: true, postIds: string[] }` — one Post row per item with `toolUsed="mixed-media"`.

## Acceptance criteria

1. `lib/mixed-media.ts` exports `MIXED_MEDIA_STYLES` array with exactly 12 entries; every entry has non-empty `id`, `name`, `tagline`, `gradientClass`, `promptFragment`, and `compatibleMedia` array.
2. `composeMixedMediaPrompt` returns a string that contains every selected style's `promptFragment` verbatim and the raw `subjectPrompt` text.
3. `composeMixedMediaPrompt` NEVER includes a `referenceUrl`, `http://`, or `blob:` in its output.
4. `buildMixedMediaBlends` throws `MixedMediaSelectionError` when `selectedStyleIds.length < 2` or `> 3`.
5. `buildMixedMediaBatch` returns `variationsPerBlend` requests per blend (so 3 with variationsPerBlend=3).
6. `buildMixedMediaBatch` throws `MixedMediaIncompatibleMediaError` when any selected style's `compatibleMedia` excludes the chosen `mediaType` (e.g. choosing "oil-painting" + mediaType="video").
7. Request objects from `buildMixedMediaBatch` set `imageUrl` to `referenceUrl` only when provided; never include `imageUrl: ""`.
8. `/tools/mixed-media` page renders with `<h1>` containing "Mixed Media" and `data-testid="mixed-media-page"` on the main element.
9. The style grid renders exactly 12 tiles (`data-testid="style-tile"`), each with a unique `data-style-id`; clicking toggles `aria-pressed` and caps selection at 3.
10. Generate button is disabled until at least 2 styles are selected AND `subjectPrompt.trim().length > 0`; enabled state uses `className="glow-btn"`.
11. Fan-out uses `Promise.allSettled` — a 2-succeed-1-fail scenario renders 2 succeeded tiles + 1 failed tile with a `[Retry]` button; retry re-fires only that single variation and does not re-dispatch succeeded ones.
12. All `fetch("/api/generate", ...)` and `fetch("/api/mixed-media/share", ...)` calls are wrapped with `handleAuthRequired` from `@/lib/auth-redirect`.
13. Deep link `/tools/mixed-media?preset=anime-realism&subject=warrior+in+mist` pre-selects the `anime-realism` tile (single-style deep links are expanded by the UI — user must pick one more before generating) and pre-fills the subject textarea with "warrior in mist". The client component is Suspense-wrapped because it calls `useSearchParams`.
14. Sidebar "Effects & Templates" section contains a "Mixed Media" link to `/tools/mixed-media`, inserted immediately after the existing "Popcorn" entry (so order: All Effects -> Popcorn -> Mixed Media -> On Fire -> ...).
15. `/apps` gallery includes a Mixed Media card with `data-testid="tool-card"` and `data-slug="mixed-media"` linking to `/tools/mixed-media`.
16. `lib/tools/p2-tools.ts` contains a `mixed-media` entry with `category: "editing"` and `mediaOut: "image"` (video is the secondary mode; default card shows image output so the P2 entry reflects that).
17. Footer col1 `col1Links` (`components/footer.tsx`) contains an entry `{ href: "/tools/mixed-media", label: "Mixed Media" }` inserted immediately after the existing "Prompt Guide" entry.
18. Zero `slate-` or `zinc-` tokens appear in `components/mixed-media/` or `app/tools/mixed-media/` (enforce via Playwright test using word-boundary regex through `page.evaluate`, NOT `[class*="slate-"]` which false-positives on `translate-x-*`).
19. Style tile gradients use `bg-gradient-to-br ${style.gradientClass}`; primary heading uses `text-brand-gradient` class (NOT `bg-brand-gradient bg-clip-text text-transparent` inline); generate button uses `glow-btn` class.
20. `npx next build` succeeds with `/tools/mixed-media` and `/api/mixed-media/share` in the route list.

## Test plan

### Vitest unit tests — `tests/unit/mixed-media.test.ts`

1. `MIXED_MEDIA_STYLES` has exactly 12 entries.
2. Every style has non-empty required fields (`id`, `name`, `tagline`, `gradientClass`, `promptFragment`, `compatibleMedia`).
3. Every style `id` is unique across the array.
4. `composeMixedMediaPrompt` with 2 styles includes both `promptFragment` strings verbatim.
5. `composeMixedMediaPrompt` includes the subject prompt verbatim.
6. `composeMixedMediaPrompt` does NOT include a given `referenceUrl` in output even when one is in the input (it's passed as imageUrl only, not in the prompt).
7. `buildMixedMediaBlends(["anime-realism"])` throws `MixedMediaSelectionError`.
8. `buildMixedMediaBlends(["a","b","c","d"])` throws `MixedMediaSelectionError`.
9. `buildMixedMediaBlends(["anime-realism","oil-painting"])` returns array of length 1 with stable `blendId` and both styleIds in sorted order.
10. `buildMixedMediaBatch({ selectedStyleIds: ["anime-realism","oil-painting"], subjectPrompt:"x", mediaType:"image", aspectRatio:"1:1", variationsPerBlend:2 })` returns array of length 2.
11. `buildMixedMediaBatch` with `variationsPerBlend:3` returns 3 requests all sharing the same `blendId` but different `variationIndex`.
12. `buildMixedMediaBatch` throws `MixedMediaIncompatibleMediaError` when mediaType="video" is chosen with a style whose `compatibleMedia` is image-only (e.g. oil-painting).
13. `buildMixedMediaBatch` with `referenceUrl` undefined returns requests whose `imageUrl` property is undefined (NOT empty string).
14. Default model is `"flux-kontext"` for `mediaType:"image"` and `"kling-25-turbo"` for `mediaType:"video"`.
15. Sidebar `SIDEBAR_SECTIONS` "Effects & Templates" items contain "Mixed Media" at index 2 (right after "All Effects" at index 0 and "Popcorn" at index 1).
16. `p2-tools.ts` contains a `mixed-media` entry with `category:"editing"` and `mediaOut:"image"` and at least 2 inputs.

### Playwright E2E — `tests/e2e/mixed-media.spec.ts`

Every test body opens with `test.skip(!process.env.FAL_KEY && /* test that requires real fal */, ...)` — INSIDE the test body, not at describe top level. Tests 1-11 are deterministic (no FAL), test 12 is the real fal round-trip gated by `FAL_KEY`.

1. `/tools/mixed-media` page renders with heading "Mixed Media" and `data-testid="mixed-media-page"`.
2. Grid shows 12 `data-testid="style-tile"` tiles with unique `data-style-id`.
3. Clicking a tile toggles `aria-pressed` to "true".
4. Attempting to select a 4th tile does NOT set aria-pressed (selection capped at 3).
5. Generate button is disabled with 0 or 1 tiles selected; becomes enabled when 2 tiles + non-empty subject prompt are provided.
6. Deep-link `/tools/mixed-media?preset=anime-realism&subject=warrior` pre-selects the anime-realism tile and pre-fills the subject textarea.
7. Incompatible media warning: after selecting "oil-painting" (image-only) AND toggling to video mediaType, the generate button shows a disabled state with aria-label containing "not compatible".
8. Mocked `/api/generate` (2 succeed, 1 fail with `variationsPerBlend:3`): lookbook renders 3 tiles — 2 `data-status="succeeded"` and 1 `data-status="failed"` with a visible `[Retry]` button.
9. Clicking retry on the failed tile re-dispatches only that one request (verified by counting `/api/generate` calls via `page.route`), and succeeded tiles keep their `data-status="succeeded"`.
10. Color-token guard: using `page.evaluate` with a word-boundary regex `/\bslate-\d+|\bzinc-\d+/` over all element `className` values on the page returns empty; the "translate-x-" false-positive test case must pass.
11. Sidebar "Effects & Templates" section contains the "Mixed Media" link at the correct position.
12. `/apps` gallery contains a tool card with `data-testid="tool-card"` and `data-slug="mixed-media"` pointing to `/tools/mixed-media`.
13. (FAL_KEY-gated, `test.skip(!process.env.FAL_KEY)` INSIDE the test body) End-to-end happy path: select 2 compatible image styles, type "A lighthouse at storm", click Generate, poll until at least 1 tile reaches `data-status="succeeded"` with a non-empty `data-media-url` starting with `https://`.

## Design-token constraints

**Must use:**
- Background near-black: `bg-[#181828]` or `bg-[#0a0a16]` for card surfaces.
- Borders: `border-white/15` (not `border-white/10` for subtle, `border-white/20` for emphasis).
- Brand gradient headings: `className="text-brand-gradient"` — the CSS utility in `globals.css` line 71.
- Primary CTAs: `className="glow-btn"` — the CSS utility already used by Fashion Factory, Soul Cinema, Popcorn, Copilot.
- Style tile active state: `aria-pressed="true"` + a `ring-2 ring-fuchsia-400` or `ring-cyan-400` outline.
- Tile subtitles: `text-white/70` for body, `text-white/50` for secondary hints.

**Must NOT use:**
- `slate-*` tokens (any).
- `zinc-*` tokens (any).
- Raw `bg-brand-gradient bg-clip-text text-transparent` triple — use the `text-brand-gradient` utility.
- `higgsfield.ai` logo, favicon, or brand marks.
- blob: URLs in any API request body (upload to `/api/upload` first, use returned https URL).

## Required builder constraints (copy verbatim from caller)

- Use `npx next build` (NOT `npm run build`) for local build sanity — the project's script runs `prisma generate` first which hits a Windows .dll file-lock.
- Suspense-wrap any client component using `useSearchParams` (the mixed-media client component MUST be Suspense-wrapped because it reads `?preset=` and `?subject=`).
- `Promise.allSettled` fan-out pattern from fashion-factory / soul-cinema / popcorn when firing multiple generations.
- `handleAuthRequired` from `@/lib/auth-redirect` for every protected-route fetch (`/api/generate`, `/api/mixed-media/share`).
- `test.skip(!process.env.FAL_KEY)` INSIDE each test body that needs a real FAL round-trip, NOT at describe top level.
- Playwright color-token check uses word-boundary regex via `page.evaluate`, NOT `[class*="slate-"]` which false-positive matches `translate-x-*`.
- `/apps` gallery cards carry `data-testid="tool-card"` + `data-slug` (already added in a previous loop — verify the Mixed Media card inherits this).
- Use `text-brand-gradient` utility NOT `bg-brand-gradient bg-clip-text text-transparent`.
- Use `glow-btn` class on primary CTAs.
- No `slate-` or `zinc-` tokens anywhere.
- No Prisma migration — zero schema changes.
- No Stripe / billing changes.
- Do not break existing `/chat`, `/api/chat`, `/copilot`, `/tools/popcorn`, `/tools/soul-cinema`, `/tools/fashion-factory`, `/models/[slug]`, `/u/[username]`, `/apps`. Run `npx next build` locally before committing.

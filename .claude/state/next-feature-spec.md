# Feature: soul-cinema

- **Name:** Soul Cinema — character-driven narrative story builder
- **Category:** P5 — Cinema Studio (complements existing /studio manual timeline)
- **Priority:** P1 (highest remaining user-facing gap that exercises real fal.ai generation AND deepens the creator loop by chaining Character → multi-scene narrative output)
- **Supersedes:** the stale `soul-cinema` entry in feature-status.json (dated 2026-04-09) that was never shipped — no route, no component, no tool def currently exist for it. This spec is the real build.

## User story

> As a creator who has already trained a **Soul ID** character (or has one of the seeded showcase characters), I want to type a story prompt like "Maya finds a mysterious letter and chases its author through a rainy Tokyo night" and have Soul Cinema automatically break that story into 3–6 scene beats, generate a short video clip for each scene using my chosen video model, and stitch them into a playable reel I can download, share to the community, or save as a Project to continue editing in Cinema Studio. The character's look stays consistent across every scene because we reuse the same Soul ID reference image for each generation.

This differs from the existing `/studio` Cinema Studio page, which is a **manual** per-clip timeline. Soul Cinema is **narrative-first**: one prompt, one character, multiple automatically-scripted scenes, one fan-out API round trip to fal.ai. The output lands in the same `Project` row so the user can then open it in `/studio/[id]` for manual refinement.

## Wireframe

```
+------------------------------------------------------------+
| Cinema > Soul Cinema                                        |
|                                                             |
|  ########  SOUL CINEMA                                      |
|  ########  Turn a story beat into a character-driven reel.  |
|                                                             |
| +-- Step 1: Pick your character -----------------------+    |
| | [avatar]  Maya        [avatar]  Leo      [+ New]    |    |
| |   *chosen*            hover:ring-pink                |    |
| +-------------------------------------------------------+    |
|                                                             |
| +-- Step 2: Tell the story ----------------------------+    |
| | [textarea 4-row — "Maya finds a letter in the rain…"]|    |
| | Genre:  [Drama][Noir][SciFi][Romance][Action]        |    |
| | Tone:   [Moody][Bright][Tense][Dreamy]               |    |
| | Scenes: (o) 3   ( ) 4   ( ) 5   ( ) 6                |    |
| | Model:  [v Kling 3]   Aspect: [16:9|9:16]            |    |
| +-------------------------------------------------------+    |
|                                                             |
| +-- Step 3: Storyboard (auto-generated from your story) +    |
| | +--------+ +--------+ +--------+                     |    |
| | |scene 1 | |scene 2 | |scene 3 |   [Regenerate beats]|    |
| | |"Rain…" | |"She… " | |"Chase "|                     |    |
| | | idle   | | idle   | | idle   |                     |    |
| | +--------+ +--------+ +--------+                     |    |
| |                                                        |    |
| |      [  Generate reel — 9 credits  ]  (glow-btn)      |    |
| +-------------------------------------------------------+    |
|                                                             |
| +-- Step 4: Reel (after generate) ---------------------+    |
| | +--------+ +--------+ +--------+                     |    |
| | |[> 1]   | |[> 2]   | |[> 3]   |  succeeded          |    |
| | |succeed | |failed  | |succeed |  [retry 2]          |    |
| | +--------+ +--------+ +--------+                     |    |
| | [Save as Project]  [Share to Community]  [Download]  |    |
| +-------------------------------------------------------+    |
+------------------------------------------------------------+
```

## Routes

Next.js app-router paths:

- `/tools/soul-cinema` — dedicated page (wins over the `/tools/[slug]` catch-all). This is the canonical Soul Cinema URL.
- `/api/soul-cinema/script` — `POST` — server endpoint that turns `{ storyPrompt, sceneCount, genre, tone, character }` into an array of `{ sceneNumber, beat, prompt }` objects. Pure deterministic transform (no LLM call); uses prompt-template composition in `lib/soul-cinema.ts` so it is testable without external services.
- `/api/soul-cinema/save` — `POST` — creates or updates a `Project` row with `clipsJson` populated from the generated scene clips. Thin wrapper over the existing `prisma.project.create` logic; used for the "Save as Project" button so the user can jump straight to `/studio/{id}` and keep editing.

No changes to `/api/generate` — Soul Cinema fans out to the existing endpoint once per scene via `Promise.allSettled`, same pattern as Fashion Factory.

## Components

All under `components/soul-cinema/`:

- `components/soul-cinema/soul-cinema.tsx` — root client component orchestrating the 4-step flow (character pick -> story input -> storyboard -> reel). Holds state: `characterId`, `storyPrompt`, `genre`, `tone`, `sceneCount`, `model`, `aspectRatio`, `scenes[]`, `results[]`.
- `components/soul-cinema/character-picker.tsx` — horizontal avatar strip. Loads characters from `/api/characters` (add this endpoint if missing — thin wrapper over `prisma.character.findMany({ where: { userId } })` via a server action `getUserCharacters()` in `lib/soul-cinema.ts`). Shows a 3-tile fallback of showcase characters for anonymous users, plus a "+ New" tile linking to `/tools/soul-id`.
- `components/soul-cinema/story-form.tsx` — textarea + genre chips + tone chips + scene-count radio + model select. Emits `{ storyPrompt, genre, tone, sceneCount, model, aspectRatio }` upward via `onChange`.
- `components/soul-cinema/storyboard-grid.tsx` — pure display component: shows the parsed scene beats from `/api/soul-cinema/script`. Has a "Regenerate beats" button that re-calls the script endpoint with a different seed so users can shuffle the auto-written beats.
- `components/soul-cinema/reel-grid.tsx` + `components/soul-cinema/reel-tile.tsx` — per-scene tile with idle/running/succeeded/failed states. Matches the `LookbookTile` pattern from Fashion Factory (commit 23970f4). Each tile has its own retry button, status badge, and preview player (`<video>` for succeeded, spinner for running, error + retry for failed).
- `components/soul-cinema/reel-actions.tsx` — the three action buttons after generation: "Save as Project" (POST to `/api/soul-cinema/save`), "Share to Community" (POST first-succeeded clip to `/api/community/posts` with `toolUsed: "soul-cinema"`), "Download" (client-side `<a download>` on the first succeeded URL; note: full reel-stitch download is out of scope — single-clip download is acceptable).

## Data model deltas

**None.** Soul Cinema is pure frontend + existing `/api/generate` fan-out + existing `Project` model.

- The existing `Project.clipsJson: String` field already stores an array of `{ id, prompt, model, resultUrl, durationSec, order }` (see `ClipSchema` in `app/api/projects/route.ts`). Soul Cinema's `/api/soul-cinema/save` endpoint builds this exact shape from its `scenes[]` state and calls the same Prisma insert.
- The existing `Character.refImageUrls: String` field (JSON-serialized array of URLs) already exists. Soul Cinema reads `JSON.parse(character.refImageUrls)[0]` as the consistency reference URL passed to `/api/generate` per scene.
- The existing `Post.toolUsed` field already exists and will receive `"soul-cinema"` for community shares — no migration needed; consistent with how Fashion Factory uses `"fashion-factory"`.

This keeps the feature landing cleanly on top of Prisma without any migration risk (especially important given the Windows `.dll` file-lock on `prisma generate`).

## Provider adapter contract

No new AI provider adapter. Soul Cinema reuses the existing `videoModels()` list from `lib/ai/models.ts` via the already-wired `/api/generate` endpoint.

The **new** typed contract is the pure script-transform signature that lives in `lib/soul-cinema.ts`:

```ts
// lib/soul-cinema.ts

export type SoulCinemaScene = {
  sceneNumber: number;  // 1-indexed
  beat: string;         // one-sentence description shown in storyboard
  prompt: string;       // full composed prompt sent to /api/generate
};

export type SoulCinemaScriptInput = {
  storyPrompt: string;           // user's raw story text, min 10 chars
  sceneCount: 3 | 4 | 5 | 6;
  genre: "drama" | "noir" | "scifi" | "romance" | "action";
  tone: "moody" | "bright" | "tense" | "dreamy";
  characterName: string;         // e.g. "Maya" — embedded in every scene prompt
  characterRefUrl?: string;      // Soul ID reference — passed to /api/generate as imageUrl
  seed?: number;                 // optional shuffle seed for "Regenerate beats"
};

/**
 * Pure, deterministic scene-script generator.
 * Splits the story into `sceneCount` beats using a stable template library
 * keyed by genre, then composes a per-scene prompt string that mentions the
 * character name, the genre's cinematographic style directives, and the tone.
 * Must be synchronous and free of I/O so the unit tests can assert output
 * character-by-character.
 */
export function buildSoulCinemaScript(
  input: SoulCinemaScriptInput
): SoulCinemaScene[];

export type SoulCinemaBatchInput = {
  scenes: SoulCinemaScene[];
  model: string;                 // one of videoModels().map(m => m.id)
  aspectRatio: "16:9" | "9:16" | "1:1";
  characterRefUrl?: string;      // passed as imageUrl on every /api/generate call
  durationSec?: number;          // default 5
};

export type SoulCinemaGenerateRequest = {
  prompt: string;
  model: string;
  mediaType: "video";
  imageUrl?: string;
  aspectRatio: "16:9" | "9:16" | "1:1";
  duration: number;
};

/**
 * Pure function that maps a batch of scenes into an array of /api/generate
 * request bodies. Mirror of `buildFashionBatch` from lib/fashion.ts — same
 * validation posture (throws on >6 scenes, filters empty beats).
 */
export function buildSoulCinemaBatch(
  input: SoulCinemaBatchInput
): SoulCinemaGenerateRequest[];
```

The client-side orchestrator then executes the batch with `Promise.allSettled` — one fetch per scene, per-tile state managed locally — exactly matching the Fashion Factory pattern. No new AI adapter surface.

## Acceptance criteria

1. Visiting `/tools/soul-cinema` renders the page with heading `Soul Cinema`, subtitle, and all four step sections (character picker, story form, storyboard, reel area) wrapped in the standard dark shell. `data-testid="soul-cinema-page"` on the root `<main>`.
2. Design tokens follow the memacta palette only: `#181828` card backgrounds, `white/15` borders, `text-brand-gradient` headings, `bg-brand-gradient` primary CTAs, `glow-btn` class on the main Generate button. Zero occurrences of `slate-` or `zinc-` Tailwind tokens in any file under `components/soul-cinema/` or `app/tools/soul-cinema/`.
3. Character picker shows at least 3 showcase characters for anonymous users (hardcoded fallbacks with `name`, `avatarUrl`, `refImageUrl`). For authenticated users, it fetches `/api/characters` (add this endpoint if missing — thin wrapper over `prisma.character.findMany({ where: { userId } })`) and prepends their own Soul ID characters. Each tile has `data-testid="character-tile"` and the selected tile gets `aria-pressed="true"`.
4. Story form textarea has `data-testid="story-prompt"`, genre and tone chip rows each have 4–5 chips (single-select, highlighted selection uses `bg-brand-gradient`), scene count is a 4-button radio (3/4/5/6, default 3), model select uses `videoModels()` from `lib/ai/models.ts`. Aspect ratio toggles between `16:9` and `9:16` only (no `1:1` for Cinema output).
5. Clicking "Generate storyboard" (or automatic on form change, debounced 400ms) POSTs to `/api/soul-cinema/script`. The response is rendered as 3–6 storyboard tiles, each showing `Scene N` + the one-sentence beat. Tiles have `data-testid="storyboard-tile"`.
6. Main "Generate reel" button is disabled until: a character is selected AND story prompt is >=10 chars AND storyboard has >=3 tiles. Button label reads `Generate reel — {sceneCount * 3} credits` (video is 3 credits per scene).
7. Clicking the enabled Generate button kicks off `Promise.allSettled` of N fetches to `/api/generate` (N = sceneCount). Each reel tile transitions idle -> running -> succeeded|failed independently. Failed tiles show a Retry button that re-fires that single scene's fetch without affecting the others.
8. `buildSoulCinemaScript` must always produce exactly `sceneCount` scenes for valid input, each with a unique `sceneNumber` (1..N), a non-empty `beat`, and a `prompt` that contains the character name AND the genre style directive AND the tone adjective.
9. `buildSoulCinemaBatch` must throw `Error("Soul Cinema supports at most 6 scenes")` when given 7+ scenes, must return `[]` when given empty scenes, and must pass `characterRefUrl` through as `imageUrl` on every request body when provided.
10. "Save as Project" button POSTs to `/api/soul-cinema/save` with `{ name: "Soul Cinema — {genre} / {storyPrompt.slice(0,40)}", clips: [...] }` where each clip has `{ id, prompt, model, resultUrl, durationSec, order }`. On success, redirects to `/studio/{projectId}`. Anonymous users get `handleAuthRequired` redirect to signup.
11. "Share to Community" button POSTs the first succeeded clip to `/api/community/posts` with `toolUsed: "soul-cinema"`, media type `video`, title derived from the story prompt. Uses `handleAuthRequired` on 401.
12. Sidebar Studio section (in `components/sidebar.tsx`) gains a new `{ label: "Soul Cinema", href: "/tools/soul-cinema" }` entry, inserted between "Cinema Studio" and "Saved Projects". Label is exactly `Soul Cinema` (with the space).
13. `lib/tools/p2-tools.ts` gains a `soul-cinema` entry with `category: "identity"` (to surface it next to Soul ID/Cast) and `mediaOut: "video"`, so it appears in the `/apps` gallery. Inputs: `character` (image-ref), `story` (prompt), `genre` (text), `sceneCount` (text).
14. `npx next build` must succeed after the feature lands. No new route collisions; `/tools/soul-cinema` resolves to the dedicated page, not the catch-all. The build must show `/tools/soul-cinema` in the dynamic route listing.
15. Anonymous users can reach Step 3 (storyboard) but get a signup redirect via `handleAuthRequired` when they hit the Generate reel button if they have exceeded `ANON_MAX_GENERATIONS` (existing `/api/generate` behavior is reused unchanged — no duplicate gate needed in Soul Cinema code).

## Test cases

### Vitest unit tests — `tests/unit/soul-cinema.test.ts`

1. `buildSoulCinemaScript` returns exactly `sceneCount` scenes for input with sceneCount=3.
2. `buildSoulCinemaScript` returns exactly 6 scenes for sceneCount=6.
3. Every scene's `prompt` contains the exact `characterName` substring.
4. Every scene's `prompt` contains the genre-specific style keyword (e.g. "noir" -> contains `chiaroscuro` or `shadow` or similar pre-defined string; assert against the exact token in the implementation's genre library).
5. Every scene's `prompt` contains the tone adjective (e.g. tone="moody" -> contains `moody` or synonym from the tone map).
6. Changing `seed` between two calls with otherwise identical input produces at least one scene with a different `beat` string (shuffle actually shuffles).
7. `buildSoulCinemaScript` with `characterRefUrl` provided does NOT embed the URL into the prompt string (the URL goes on `imageUrl`, never the prompt — same posture as `composeFashionPrompt`).
8. `buildSoulCinemaBatch` returns an array with length equal to `scenes.length`.
9. `buildSoulCinemaBatch` throws when passed 7+ scenes.
10. `buildSoulCinemaBatch` returns `[]` when passed empty scenes.
11. `buildSoulCinemaBatch` request body has `mediaType: "video"` on every entry.
12. `buildSoulCinemaBatch` with `characterRefUrl` present puts that URL on every entry's `imageUrl` field.
13. `buildSoulCinemaBatch` with no `characterRefUrl` omits the `imageUrl` field (strict undefined, not empty-string).
14. Sidebar Studio section ordering: a synchronous import-and-assert that `Soul Cinema` label appears between `Cinema Studio` and `Saved Projects` (read the Studio section array from `components/sidebar.tsx`).
15. `p2-tools.ts` has a `soul-cinema` entry with `category: "identity"`, `mediaOut: "video"`, and `inputs.length >= 3`.

### Playwright E2E — `e2e/soul-cinema.spec.ts`

**Happy path (mocked fal.ai):**

1. Navigate to `/tools/soul-cinema`. Expect `data-testid="soul-cinema-page"` visible and heading `Soul Cinema`.
2. Expect at least 3 `data-testid="character-tile"` elements rendered (showcase fallback). Click the first one — it should get `aria-pressed="true"`.
3. Fill `data-testid="story-prompt"` with `Maya finds a mysterious letter and chases its author through a rainy Tokyo night`.
4. Click the `Noir` genre chip and the `Moody` tone chip.
5. After debounce, expect exactly 3 `data-testid="storyboard-tile"` elements to render.
6. Confirm the main Generate button becomes enabled; its label includes `9 credits`.
7. With `page.route('**/api/generate', ...)` intercepting and returning `{ status: "succeeded", url: "/mock/scene.mp4" }` for the first two calls and `{ status: "failed", error: "mock" }` for the third, click Generate. Wait for all three tiles to settle. Assert 2 tiles show `data-status="succeeded"` and 1 shows `data-status="failed"` with a visible Retry button.
8. Click Retry on the failed tile (with the mock now returning success). The tile re-renders with `data-status="succeeded"`.
9. Assert the three action buttons are visible: `Save as Project`, `Share to Community`, `Download`.

**Additional E2E assertions:**

10. Sidebar: expand Studio section, assert a link labelled `Soul Cinema` exists pointing to `/tools/soul-cinema`.
11. `/apps` page: assert a card with text `Soul Cinema` is visible and its href is `/tools/soul-cinema`.
12. Unknown scene-count (e.g. navigating with `?sceneCount=99`) must not crash the page — falls back to 3.

**Real fal.ai round-trip (skipped in CI without FAL_KEY):**

13. Gated on `process.env.FAL_KEY` — uses a tiny real story ("Leo waves at the camera once"), sceneCount=3, model `kling-25-turbo`. Asserts at least one tile reaches `data-status="succeeded"` within 120s. Uses `test.skip(!process.env.FAL_KEY)` inside the test body (not the describe block) — same lesson as fashion-factory where the skip was accidentally moved up and silenced the whole suite.

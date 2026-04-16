# Feature: model-intro-pages

- **Name:** Model Intro / Marketing Pages
- **Category:** P1 (Core Create) — marketing surface for each AI model
- **Priority:** Highest-priority unblocked item from `.claude/state/feature-gap-analysis.md`. The 8 "Model intro pages" bullets (Sora 2, Veo 3.1, Kling 3.0, WAN 2.6, Seedance 2.0, Nano Banana Pro, Nano Banana 2, Flux 2) collapse into one data-driven route. Prompt Guide is already shipped at `/prompt-guide`, and Creator Profiles requires a Prisma migration (deferred to the next iteration to keep this unit shippable in one pass). Stripe is deferred per user instruction.

## User story

> As a prospective creator evaluating memacta, I want a dedicated landing page for each AI model (Sora 2, Veo 3.1, Kling 3, Nano Banana Pro, Flux 2, etc.) so I can see what the model does, sample outputs, its strengths, typical prompts, and one click to try it — without guessing which model to pick in the generic `/create/video` form. Hitting "Try Sora 2" drops me into the create page with the correct model preselected. If I'm not signed in, the existing anonymous-credit flow handles my first 3 free generations, and the signup-gate kicks in for the 4th.

This directly showcases the real `lib/ai/fal-provider.ts` integration that shipped in commit 6cfae60 and drives signups — mirroring Higgsfield's `/kling-3`, `/sora2-ai-video`, `/veo3.1`, `/wan-2.6`, `/nano-banana-pro`, `/flux-2-intro` URLs.

## Wireframe

```
+------------------------------------------------------------------+
|  [memacta nav]                                          [credits]|
+------------------------------------------------------------------+
|  Models / Sora 2                                                 |
|                                                                  |
|  +----------------+                                              |
|  | SORA 2         |  Long-form narrative video                   |
|  | [pro] [video]  |  from OpenAI                                 |
|  +----------------+                                              |
|  A brief one-paragraph pitch describing what the model is best   |
|  at, who made it, what aspect ratios / durations it supports.    |
|                                                                  |
|  [  Try Sora 2 -> bg-brand-gradient glow-btn  ]                  |
|                                                                  |
|  ---------------- Strengths ----------------                     |
|  - Long-form narrative coherence                                 |
|  - Photoreal motion                                              |
|  - Complex camera language                                       |
|                                                                  |
|  ---------------- Sample prompts ----------------                |
|  +--------------------------------+  +------------------------+  |
|  | "A woman walks through Tokyo   |  | "Astronaut on a lunar  |  |
|  |  neon-lit streets at dusk..."  |  |  surface, golden hour" |  |
|  | [Copy] [Try this prompt ->]    |  | [Copy] [Try this ->]   |  |
|  +--------------------------------+  +------------------------+  |
|                                                                  |
|  ---------------- Specs ----------------                         |
|  | Media type | Video                                            |
|  | Aspect     | 16:9, 9:16                                       |
|  | Duration   | up to 10s                                        |
|  | Provider   | fal.ai (fal-ai/sora-2/text-to-video)             |
|                                                                  |
|  ---------------- Related models ----------------                |
|  [ Veo 3.1 ]  [ Kling 3 ]  [ WAN 2.6 ]                           |
+------------------------------------------------------------------+
```

## Routes

Next.js app-router paths:

- `/models` — index grid of all 18 models grouped into Video (10) + Image (8). Cards link to `/models/[slug]`.
- `/models/[slug]` — dynamic model intro page. `slug` matches `ModelInfo.id` from `lib/ai/models.ts` (e.g. `sora-2`, `veo-31`, `kling-3`, `nano-banana-pro`, `flux-2`).
- `generateStaticParams` returns all 18 model IDs so these pages prerender as SSG at build time.
- The "Try this model" CTA links to `/create/video?model=<id>` for video or `/create/image?model=<id>` for image models (the existing GenerateForm already reads the model from initial state; we will pass it via a new optional `initialModel` prop to honor the query string on mount).

## Components

All new files under `components/models/`:

- `components/models/model-hero.tsx` — header block: name, badge pill (new/fast/pro), media-type pill, one-line tagline, gradient Try CTA. Server component.
- `components/models/model-specs.tsx` — two-column spec table (Media type, Aspect, Duration, Provider endpoint, FAL slug). Server component.
- `components/models/sample-prompts.tsx` — grid of 3 sample prompts. Client component (needs `navigator.clipboard`). Each card has Copy + "Try this prompt" link to `/create/{video|image}?model=<id>&prompt=<urlencoded>`.
- `components/models/related-models.tsx` — pill list of 3 sibling models (same `mediaType`, different id) as `Link`s. Server component.
- `components/models/model-card.tsx` — card used on the `/models` index. Server component.

Extended data source (not a component, but required):

- `lib/ai/model-details.ts` — new file exporting `MODEL_DETAILS: Record<string, ModelDetails>` where `ModelDetails` extends the existing `ModelInfo` with:
  - `tagline: string` (one-sentence marketing line, ~80 chars)
  - `pitch: string` (one paragraph, ~250 chars)
  - `strengths: string[]` (3–5 bullets)
  - `samplePrompts: string[]` (3 example prompts, curated per model)
  - `maxDurationSec?: number` (video only)
  - `supportedAspects: ("16:9" | "9:16" | "1:1")[]`
  - `provider: "fal.ai"` (fixed)
  - `falEndpoint: string` (read/mirrored from `FAL_ENDPOINTS` in `fal-provider.ts`)
  - `relatedModelIds: string[]` (3 siblings)

Extended create form:

- `components/create/generate-form.tsx` — accept optional `initialModel?: string` prop; when provided AND it matches a model of the correct mediaType, use it instead of `videoModels()[0]`. Also accept `initialPrompt?: string` and seed `prompt` state from it. The parent create pages (`app/create/video/page.tsx`, `app/create/image/page.tsx`, `app/create/image-to-video/page.tsx`) become client-aware of `searchParams` and pass those values through.

Sidebar addition (minor):

- `components/sidebar.tsx` — add a new top-level quick link "Models" pointing to `/models` between "AI Chat" and "My Library" (or alternately as a section). Keeps footer parity with Higgsfield's per-model links.

## Data model deltas

**None.** This feature is purely read-only marketing content derived from `lib/ai/models.ts` + new static content in `lib/ai/model-details.ts`. No Prisma migration, no DB writes, no new API routes.

## Provider adapter contract

Not applicable — no new provider work. The feature consumes existing `FAL_ENDPOINTS` from `lib/ai/fal-provider.ts` as a read-only source of truth for the "Provider endpoint" spec row.

Invariant (enforced by unit test): every key in `MODEL_DETAILS` must also exist in `FAL_ENDPOINTS`, and every model ID in `MODELS` must have a corresponding `MODEL_DETAILS` entry.

## Acceptance criteria

1. `npm run build` passes with zero errors and zero warnings, and the build output lists `/models` and `/models/[slug]` among the compiled routes.
2. `/models` renders an index with exactly 18 model cards grouped into "Video Models" (10) and "Image Models" (8) sections. Each card shows name, badge (if any), and a one-line tagline, and links to `/models/<id>`.
3. All 18 `/models/[slug]` pages render successfully (no 404s) for slugs: `kling-3`, `kling-25-turbo`, `kling-o1`, `sora-2`, `veo-31`, `veo-3`, `wan-26`, `minimax-hailuo`, `seedance-20`, `seedance-pro`, `soul-v2`, `nano-banana-pro`, `nano-banana-2`, `wan-25-image`, `seedream-4`, `gpt-image-15`, `flux-kontext`, `flux-2`.
4. An unknown slug (`/models/does-not-exist`) returns Next.js `notFound()` (404).
5. Each detail page contains:
   a. An `<h1>` with the model's display name.
   b. A visible "Try <ModelName>" link whose `href` is `/create/video?model=<id>` for video models or `/create/image?model=<id>` for image models.
   c. A Strengths section with at least 3 bullet items.
   d. A Sample Prompts section with 3 example prompts.
   e. A Specs section listing the fal.ai endpoint slug (e.g. `fal-ai/sora-2/text-to-video`).
   f. A Related models row with 3 links to sibling `/models/<id>` pages, all of which resolve.
6. Clicking "Try Sora 2" on `/models/sora-2` lands on `/create/video?model=sora-2`, and the model-picker dropdown has `Sora 2` selected on initial render (not `Kling 3`).
7. Clicking a "Try this prompt" link on `/models/kling-3` lands on `/create/video?model=kling-3&prompt=<...>`, and the prompt textarea is pre-filled with the URL-encoded prompt.
8. Design tokens match the memacta palette: `bg-[#0e0e1a]` base, `bg-[#181828]` cards, `border-white/15`, headings use `bg-brand-gradient bg-clip-text text-transparent`, CTAs use `bg-brand-gradient glow-btn rounded-xl`. No Higgsfield neutrals, no new colors introduced.
9. The sidebar `/models` quick link is present and highlighted when on `/models` or `/models/<any>`.
10. Every entry in `MODEL_DETAILS` has a matching `FAL_ENDPOINTS` key, and every entry in `MODELS` has a matching `MODEL_DETAILS` entry (verified by unit test — catches drift if a future model is added).

## Test cases

### Vitest unit tests (`tests/unit/model-details.test.ts`)

```ts
import { describe, it, expect } from "vitest";
import { MODELS } from "../../lib/ai/models";
import { MODEL_DETAILS } from "../../lib/ai/model-details";
import { FAL_ENDPOINTS } from "../../lib/ai/fal-provider";

describe("MODEL_DETAILS", () => {
  it("has an entry for every model in MODELS", () => {
    for (const m of MODELS) {
      expect(MODEL_DETAILS[m.id], `missing details for ${m.id}`).toBeDefined();
    }
  });

  it("every model id maps to a real fal.ai endpoint", () => {
    for (const id of Object.keys(MODEL_DETAILS)) {
      expect(FAL_ENDPOINTS[id], `missing fal endpoint for ${id}`).toBeDefined();
    }
  });

  it("each model has 3 sample prompts", () => {
    for (const [id, d] of Object.entries(MODEL_DETAILS)) {
      expect(d.samplePrompts.length, `${id} sample prompts`).toBe(3);
    }
  });

  it("each model has at least 3 strengths bullets", () => {
    for (const [id, d] of Object.entries(MODEL_DETAILS)) {
      expect(d.strengths.length, `${id} strengths`).toBeGreaterThanOrEqual(3);
    }
  });

  it("every relatedModelId resolves to a real model", () => {
    const ids = new Set(MODELS.map((m) => m.id));
    for (const [id, d] of Object.entries(MODEL_DETAILS)) {
      for (const r of d.relatedModelIds) {
        expect(ids.has(r), `${id} related ${r}`).toBe(true);
      }
    }
  });

  it("falEndpoint field matches FAL_ENDPOINTS lookup", () => {
    for (const [id, d] of Object.entries(MODEL_DETAILS)) {
      expect(d.falEndpoint).toBe(FAL_ENDPOINTS[id]);
    }
  });
});
```

### Playwright E2E happy path (`tests/e2e/models.spec.ts`)

```ts
import { test, expect } from "@playwright/test";

test("models index shows 18 model cards split video/image", async ({ page }) => {
  await page.goto("/models");
  await expect(page.getByRole("heading", { name: /Video Models/i })).toBeVisible();
  await expect(page.getByRole("heading", { name: /Image Models/i })).toBeVisible();
  const cards = page.locator('[data-testid^="model-card-"]');
  await expect(cards).toHaveCount(18);
});

test("Sora 2 intro page renders and Try CTA preselects the model", async ({ page }) => {
  await page.goto("/models/sora-2");
  await expect(page.locator("h1")).toHaveText(/Sora 2/);
  await expect(page.getByText(/fal-ai\/sora-2\/text-to-video/)).toBeVisible();

  const tryCta = page.getByRole("link", { name: /Try Sora 2/i });
  await expect(tryCta).toHaveAttribute("href", "/create/video?model=sora-2");
  await tryCta.click();

  await expect(page).toHaveURL(/\/create\/video\?model=sora-2/);
  const picker = page.locator("select").first();
  await expect(picker).toHaveValue("sora-2");
});

test("Sample prompt link preselects model and seeds the prompt textarea", async ({ page }) => {
  await page.goto("/models/kling-3");
  const firstTryPrompt = page.getByRole("link", { name: /Try this prompt/i }).first();
  await firstTryPrompt.click();
  await expect(page).toHaveURL(/\/create\/video\?model=kling-3&prompt=/);
  const textarea = page.locator("textarea").first();
  await expect(textarea).not.toHaveValue("");
});

test("unknown model slug returns 404", async ({ page }) => {
  const res = await page.goto("/models/does-not-exist");
  expect(res?.status()).toBe(404);
});

test("sidebar Models quick link is present and active on /models", async ({ page }) => {
  await page.goto("/models");
  const link = page.getByRole("link", { name: "Models" }).first();
  await expect(link).toBeVisible();
  await expect(link).toHaveAttribute("href", "/models");
});
```

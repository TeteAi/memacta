# Feature: copilot

- **Name:** memacta Copilot
- **Category:** P0 — Conversational creative assistant (upgrades the existing dead `/chat` stub into a real prompt-crafting + deep-linking copilot)
- **Priority:** P1 (highest-ROI remaining gap — takes the stubbed `/chat` mock-reply surface and turns it into a real creator-aiming assistant that deep-links users into every shipped tool)
- **Source:** `feature-gap-analysis.md` — "Copilot" listed under MISSING completely. Chosen over Mixed Media (requires heavy timeline surgery), Reference Extension (overlaps with Multi Reference + Soul ID + Soul Moodboard + Soul Cast), UGC Factory (structurally near-identical to shipped Fashion Factory — re-skin risk), and Sora 2 Upscale (narrow single-model utility that duplicates existing Upscale). Copilot is the widest-reach remaining feature: one conversational surface that exposes all 18 models, 33+ tools, 12 Popcorn presets, Soul Cinema, and Fashion Factory via deep-linked action chips. Also the highest-visible quality upgrade because the current `/chat` returns `"memacta: I understand. (mock)"` — it's demonstrably a stub.

## User story

As a new creator who doesn't know which of memacta's 18 models or 33+ tools to use, I open **Copilot** (rebranded `/chat`). I type `"make a 10-second cinematic reel of a samurai in rain"`. Copilot replies with a short paragraph explaining the recommended approach AND three actionable **action chips** at the bottom of the message: `[ Open Soul Cinema ]`, `[ Use Veo 3.1 + this prompt ]`, `[ Try Popcorn "Cafe Gloom" preset ]`. Clicking any chip deep-links me into the right shipped surface with the prompt, model, and preset pre-filled.

If I don't know what to ask, a **starter grid** offers 6 one-click prompts: "Make me a short-form reel", "Style a fashion lookbook", "Build a character and cast them into a scene", "Turn a still image into a 5-second video", "Write a narrative for Soul Cinema", "Recommend a model for X". Each starter injects a structured request + an intent tag so Copilot replies with pre-shaped recommendations.

The key differentiator versus the current `/chat`: Copilot is **intent-aware** (not a blind LLM passthrough), returns **structured action chips** (not just plain text), and routes users into real shipped features via deep links that match the URL contract already used by `/create?model=X&prompt=Y`, `/tools/popcorn`, `/tools/fashion-factory`, `/tools/soul-cinema`, and `/effects/[id]`.

## Wireframe

```
+--------------------------------------------------------------------------+
|  Copilot                                                    beta         |
|  Your AI director - I'll pick the right model, tool, and preset.         |
|                                                                          |
|  +------ Starter prompts (shown when empty) --------------------------+  |
|  |  [Short-form reel]  [Fashion lookbook]   [Character + scene]     |  |
|  |  [Image -> video]   [Soul Cinema beat]   [Which model for...?]   |  |
|  +--------------------------------------------------------------------+  |
|                                                                          |
|  +------ Conversation ------------------------------------------------+  |
|  |  You: make a 10s cinematic reel of a samurai in rain               |  |
|  |                                                                     |  |
|  |  Copilot:  For a cinematic 10-second reel with motion and mood,    |  |
|  |            Veo 3.1 gives the best photoreal rain. If you want a   |  |
|  |            short 3-clip pack instead, Popcorn's Cafe Gloom preset |  |
|  |            nails the atmosphere in a vertical format.              |  |
|  |                                                                     |  |
|  |            +-------------------+ +----------------------+          |  |
|  |            | Use Veo 3.1 now   | | Try Cafe Gloom in    |          |  |
|  |            | with this prompt  | | Popcorn              |          |  |
|  |            +-------------------+ +----------------------+          |  |
|  |            +------------------------+                              |  |
|  |            | Open Soul Cinema with  |                              |  |
|  |            | narrative prefill      |                              |  |
|  |            +------------------------+                              |  |
|  +--------------------------------------------------------------------+  |
|                                                                          |
|  +- Type a message... -------------------------+  +---------+            |
|  |                                             |  | Send -> |            |
|  +---------------------------------------------+  +---------+            |
+--------------------------------------------------------------------------+
```

## Routes

- `app/copilot/page.tsx` — new canonical route. Server component that renders `<Copilot/>`. Metadata `{ title: "memacta - Copilot" }`. Full-height layout, wider than current `/chat` (max-width 4xl instead of 3xl).
- `app/chat/page.tsx` — UPDATE (not delete) to also import and render the new `<Copilot/>` component so legacy `/chat` URLs keep working and upgrade automatically. Do NOT break tests that already hit `/chat`.
- `app/api/copilot/suggest/route.ts` — `POST`. Accepts `{ messages: Array<{role, content}>, intent?: string }`. Returns `{ reply: string, actions: Array<CopilotAction> }`. Rule-based (keyword/intent matching against a local library — **no** external LLM call; this keeps the build deterministic and testable). The matching logic lives in a pure helper in `lib/copilot.ts` so it's fully unit-testable without spinning up Next.
- `/api/chat` — UNCHANGED. Still returns the same mock reply. This route is **not** deleted; some legacy tests depend on it. Copilot uses its own `/api/copilot/suggest` endpoint so we don't disturb the existing wire contract.

Deep-link contracts Copilot produces (all already supported by the shipped app):

- `/create/video?model=veo-31&prompt=<urlencoded>` — model picker deep-link (already wired in `app/create/video/page.tsx`).
- `/create/image?model=flux-2&prompt=<urlencoded>` — image create deep-link.
- `/create/image-to-video?prompt=<urlencoded>` — image-to-video.
- `/tools/popcorn?preset=cafe-gloom&subject=<urlencoded>` — Popcorn deep-link (see "Component edits" below — Popcorn must read these two query params on mount).
- `/tools/fashion-factory?prompt=<urlencoded>` — Fashion Factory style-prompt prefill (existing `stylePrompt` state seeded from `?prompt=`).
- `/tools/soul-cinema?story=<urlencoded>&genre=<slug>` — Soul Cinema story+genre prefill.
- `/effects/[id]` — pass through for effect shortcuts (no params needed).

## Components

All new files under `components/copilot/`:

- `components/copilot/copilot.tsx` — client root. `"use client"`. Wraps the whole experience. Uses `Suspense` boundary around any child that calls `useSearchParams` (for `?q=...` deep links from landing pages). Holds `{ messages, input, loading, showStarter }` state. Wires `handleAuthRequired` from `@/lib/auth-redirect` on the `POST /api/copilot/suggest` call. `data-testid="copilot"` on root.
- `components/copilot/starter-grid.tsx` — renders 6 starter prompt cards in a 2x3 grid. Each card has `data-testid="starter-card"` and `data-intent={intent}` (e.g. `short-form`, `fashion-lookbook`, `character-scene`, `image-to-video`, `soul-cinema-beat`, `recommend-model`). Clicking a card injects the structured prompt and auto-sends (mirrors ChatGPT starter cards UX). Hidden once `messages.length > 0`.
- `components/copilot/message-bubble.tsx` — renders one user or assistant message. User bubble: `bg-brand-gradient` right-aligned. Assistant bubble: `bg-white/10` left-aligned. Below assistant bubbles renders a `<ActionChips actions={...}/>` row if `actions.length > 0`. `data-testid="message-bubble"` + `data-role={role}`.
- `components/copilot/action-chips.tsx` — renders a wrapped row of `<Link href={action.href}>` chips, one per `CopilotAction`. Each chip is a small pill with an icon + label. `data-testid="action-chip"` + `data-action-type={action.type}` + `data-href={action.href}`. Uses `glow-btn` only on the primary action (index 0); rest are ghost-bordered.
- `components/copilot/compose-box.tsx` — the text input + Send button at the bottom. `data-testid="compose-box"`. `data-testid="send-btn"` on the submit button. Disabled while loading or when input is empty. Enter-to-send (with Shift+Enter newline support).
- `components/copilot/message-list.tsx` — vertical scroll container. Auto-scrolls to bottom when a new message arrives. `data-testid="message-list"`.

Edits to existing files:

- `components/sidebar.tsx` — rename the existing `{ label: "AI Chat", href: "/chat" }` QUICK_LINKS entry to `{ label: "Copilot", href: "/copilot" }`. **Do not** delete the entry or break the icon. Same position in the list.
- `components/nav.tsx` (if it has a top-level `AI Chat` / Chat link) — same rename. Spot-check only; don't alter anything else. (Builder: use `Grep` for `"/chat"` across `components/` and `app/` and only rename the navigation surfaces, **not** the page routes themselves.)
- `components/popcorn/popcorn.tsx` — add `?preset=<id>&subject=<text>` deep-link support. On mount (inside a `Suspense` boundary if not already wrapped), read `useSearchParams()`, and if `preset` matches a valid `POPCORN_PRESETS` id, pre-select it; if `subject` is set, pre-fill the subject prompt textarea. Do not auto-fire generation. Must be wrapped in `Suspense` per the Next 15 build rule.
- `components/fashion/fashion-factory.tsx` — same pattern: `?prompt=` pre-fills the style prompt textarea on mount. Suspense-wrap.
- `components/soul-cinema/soul-cinema.tsx` — `?story=` pre-fills the story textarea; `?genre=` pre-selects the matching genre chip.
- `lib/tools/p2-tools.ts` — append a new entry `{ id: "copilot", slug: "copilot", name: "Copilot", description: "Your AI director - ask and I'll pick the model, tool, and preset.", category: "identity", mediaOut: "image", inputs: [{key:"prompt",label:"What do you want to make?",type:"prompt"}] }`. The `/tools/[slug]` fallback will render a redirect hint → `/copilot`, OR the builder may add a small `app/tools/copilot/page.tsx` that simply does `redirect("/copilot")`. **Note on category:** `"identity"|"editing"` is the hard Zod union in the existing type; keep `"identity"` and document via the card title that this is a helper.

Do NOT touch: `app/api/chat/route.ts`, `components/chat/chat.tsx`, `app/api/generate/*`, `app/api/popcorn/*`, `app/api/soul-cinema/*`, any Prisma schema, any model adapter, any credit logic.

## Data model deltas

**Zero Prisma migrations.** Copilot is entirely stateless on the server — conversation history is held in client state and POSTed with each suggestion request (same pattern as the existing `/api/chat` mock). No user-scoped storage, no history persistence, no new DB table.

The `CopilotAction` shape is a pure TypeScript type exported from `lib/copilot.ts`:

```ts
export type CopilotAction = {
  type:
    | "create-video"
    | "create-image"
    | "image-to-video"
    | "popcorn-preset"
    | "fashion-factory"
    | "soul-cinema"
    | "effect-shortcut"
    | "tool-redirect";
  label: string;         // "Use Veo 3.1 with this prompt"
  href: string;          // "/create/video?model=veo-31&prompt=..."
  icon?: "video" | "image" | "wand" | "spark" | "clapper" | "popcorn";
};

export type CopilotSuggestion = {
  reply: string;
  actions: CopilotAction[];  // 0 .. 4 actions; always <= 4
  intent: string;            // inferred intent tag
};

export function buildCopilotSuggestion(
  userMessage: string,
  intent?: string,
): CopilotSuggestion {
  // Pure, deterministic. No network. Must be <= 10ms per call on a warm V8.
}

export const COPILOT_STARTERS: Array<{
  intent: string;
  label: string;          // short button label
  prompt: string;         // full prompt injected into the chat
}>;  // length === 6
```

## API contracts

`POST /api/copilot/suggest`

Request body (Zod-validated):

```ts
{
  messages: Array<{ role: "user" | "assistant"; content: string }>;  // min 1, max 50
  intent?: string;  // optional intent tag from starter grid
}
```

Response (200):

```ts
{
  reply: string;          // 1-3 sentences, plaintext (no markdown)
  actions: CopilotAction[];  // 0..4
  intent: string;
}
```

Error responses:

- `400 {error:"invalid"}` on schema mismatch (matches existing `/api/chat` pattern).
- `401 {error:"auth_required"}` when the anonymous quota is exhausted. **IMPORTANT:** Copilot suggestions alone do NOT burn generation credits — only the deep-linked `/api/generate` call does. So the 401 only fires if we elect to charge a small "copilot query" anon credit. Default: do NOT charge copilot for suggestions (unlimited anon queries). Document this in a comment in the route handler.

Server route hands off to `buildCopilotSuggestion(lastUserMessage, intent)` from `lib/copilot.ts` and returns the result. No provider call, no external LLM, no DB write. This keeps the whole feature deterministic and testable in CI.

## Design-token constraints

- CTA buttons (Send, primary action chip): `bg-brand-gradient` + `glow-btn`.
- Assistant bubbles: `bg-white/10 text-white`.
- User bubbles: `bg-brand-gradient text-white`.
- Cards (starter grid): `bg-[#181828] border border-white/15 hover:border-white/25`.
- Hero title: use `text-brand-gradient` utility — **NOT** `bg-brand-gradient bg-clip-text text-transparent` (that's the known bug spelled out in the caller instructions and Higgsfield Popcorn audit). There IS a `.text-brand-gradient` utility in `app/globals.css` line 71; use it directly as a class.
- Zero `slate-`, `zinc-`, or `gray-` base color tokens (`gray-400` etc). Use `white/10`, `white/15`, `white/60`, `white/70` or the named colors `pink-*`, `purple-*`, `cyan-*`, `orange-*` for accents only.
- Icons: inline SVG at 16px (w-4 h-4) inside action chips.
- Action chip variant rules:
  - Primary (index 0): `bg-brand-gradient text-white glow-btn`.
  - Secondary (index 1+): `border border-white/15 bg-white/5 text-white hover:bg-white/10`.

## Test plan

### Vitest unit tests — `tests/copilot.test.ts`

Pure helper tests; no DB, no network, no React.

1. `COPILOT_STARTERS.length === 6` — guards against accidental drift.
2. Every starter has a non-empty `intent`, `label`, `prompt`; `intent` values are globally unique.
3. `buildCopilotSuggestion("make a 10s cinematic reel of a samurai in rain")` returns `reply.length > 0`, `actions.length >= 1`, and contains at least one action with `type === "create-video"` (because the prompt contains "reel" / "video" / "cinematic").
4. `buildCopilotSuggestion("style a fashion lookbook")` returns at least one action with `type === "fashion-factory"` and `href` starting with `/tools/fashion-factory`.
5. `buildCopilotSuggestion("short-form tiktok")` returns at least one action with `type === "popcorn-preset"` and `href` starting with `/tools/popcorn?preset=`.
6. `buildCopilotSuggestion("build a character")` returns at least one action with `href` starting with `/tools/soul-id` OR `/tools/soul-cast` OR `type === "tool-redirect"`.
7. `buildCopilotSuggestion("turn this photo into a video")` returns at least one `type === "image-to-video"` action.
8. `buildCopilotSuggestion("write a narrative for soul cinema")` returns at least one `type === "soul-cinema"` action; the `href` carries `?story=` with the prompt urlencoded.
9. `buildCopilotSuggestion("xyz unreadable gibberish 123")` still returns a valid `CopilotSuggestion` with `actions.length >= 1` (fallback: at least one "Open Create" action).
10. All actions returned by `buildCopilotSuggestion(...)` always have non-empty `label`, non-empty `href` starting with `/`, a valid `type`, and the `href` passes a simple URL parse (no malformed querystrings).
11. `buildCopilotSuggestion(...).actions.length <= 4` — hard cap to keep UI tidy.
12. `buildCopilotSuggestion("make a video", "short-form")` (explicit intent) overrides the keyword match and forces Popcorn to be the primary action (index 0).
13. `buildCopilotSuggestion` treats the prompt case-insensitively (same result for `"REEL"` and `"reel"`).
14. Sidebar assertion: verify via source-file grep that `components/sidebar.tsx` contains `href: "/copilot"` and does NOT contain `label: "AI Chat"` after the rename. Use `fs.readFileSync` in the unit test.
15. `P2_TOOLS` contains exactly one entry with `slug === "copilot"`.

### Playwright E2E — `e2e/copilot.spec.ts`

Non-opt-in tests (8) + 1 opt-in FAL_KEY-gated round-trip for the downstream deep-link.

1. **Page renders.** `await page.goto('/copilot')`. `expect(page.getByRole('heading', { name: 'Copilot' })).toBeVisible()`. `expect(page.getByTestId('copilot')).toBeVisible()`.
2. **Starter grid has 6 cards.** `expect(page.getByTestId('starter-card')).toHaveCount(6)`.
3. **Starter click sends a message.** Click the first `starter-card`. Wait for `message-bubble` with `data-role="user"` to appear. Then wait for `data-role="assistant"`. Verify at least one `action-chip` is visible.
4. **Free-text send.** Fill the compose box with `"make a 10 second cinematic reel of a samurai in rain"`, click `send-btn`. Wait for user bubble, then assistant bubble. Assert at least one `action-chip` has `data-action-type="create-video"`.
5. **Action chip navigation.** Click the first `action-chip` after the assistant reply in test 4. Expect `page.url()` to start with `/create/video?model=`. Verify `?prompt=` carries the urlencoded original message (contains `samurai`).
6. **Fashion Factory deep-link prefill.** Click a starter card whose intent is `fashion-lookbook`. When the assistant reply renders, click the first `action-chip` → expect URL starts with `/tools/fashion-factory?prompt=`. Then navigate there, and assert the style-prompt textarea is pre-filled. (If the deep-link implementation is deferred to a follow-up, split this test into two and mark the prefill assertion `test.fixme` — do not gate merge on it.)
7. **Popcorn deep-link prefill.** Analogous to test 6 but targets `/tools/popcorn?preset=cafe-gloom&subject=...`. After navigation, assert the preset card with `data-preset-id="cafe-gloom"` has `aria-pressed="true"` and the subject textarea is pre-filled.
8. **Sidebar rename.** Open sidebar. Assert a link labelled `Copilot` exists with `href="/copilot"`. Assert NO link labelled `AI Chat` exists (verifies the rename, not an additive change).
9. **Legacy /chat still loads.** `await page.goto('/chat')`. The page must return 200 (not 404). It may render either the legacy chat OR the new Copilot — either is acceptable.
10. **Design tokens.** Use `page.evaluate` + a word-boundary regex to scan the rendered DOM of `/copilot` for `slate-` and `zinc-` class tokens. Must be zero. Use the same pattern that fixed the Popcorn audit:
    ```ts
    const bad = await page.evaluate(() => {
      const all = Array.from(document.querySelectorAll('*'));
      const rx = /\b(slate|zinc)-\d/;
      return all.filter((el) => rx.test(el.className || '')).length;
    });
    expect(bad).toBe(0);
    ```
    Do **not** use `[class*="slate-"]` as a CSS selector — it false-positive matches `translate-x-0`.
11. **Apps gallery shows Copilot card.** `await page.goto('/apps')`. Locate a card labelled `Copilot`. Clicking it navigates to `/copilot`.
12. **No Prisma writes on copilot POST.** Intercept `/api/copilot/suggest`, trigger it, and assert response body has `reply`, `actions`, `intent`. We don't need to assert the DB directly — just that the endpoint works in an anonymous browser session with no cookie prep.
13. **Opt-in: real downstream generation round-trip.** `test.skip(!process.env.FAL_KEY, 'needs FAL_KEY')` **inside the test body** (not at describe-block level — this was a regression the Popcorn round fixed). Send `"make a 5 second video of a neon city"`. Click the first action chip. On the landing page, fill any required extra fields and click Generate. Wait up to 90s for a `https://fal.media/...` URL to appear. This test is allowed to be flaky/slow.

### Design-token constraints reminder (for the builder)

- `text-brand-gradient` utility — **NOT** `bg-brand-gradient bg-clip-text text-transparent`.
- `glow-btn` on primary CTAs only.
- Zero `slate-`, `zinc-`, `gray-` base color tokens.
- Cards: `bg-[#181828] border border-white/15`.
- Backgrounds: `bg-[#111122]` for the app shell; `bg-[#0a0a16]` for footer-level depth.

### Builder guardrails (required)

1. `npx next build` (not `npm run build`) — this is the green-light gate.
2. Do NOT run `prisma generate` in any builder script — Windows EPERM on the .dll file lock. Vercel handles it fine at deploy time.
3. Suspense-wrap **every** client component that calls `useSearchParams` — includes `copilot.tsx` (reads `?q=`), `popcorn.tsx` (reads `?preset=&subject=`), `fashion-factory.tsx` (reads `?prompt=`), `soul-cinema.tsx` (reads `?story=&genre=`). Next 15 bails the build on un-wrapped usage.
4. `Promise.allSettled` fan-out pattern — **not relevant for Copilot itself** (single POST), but preserve it in Popcorn/Fashion/Cinema when you add deep-link support. Do not accidentally change those files' generation logic.
5. `handleAuthRequired` from `@/lib/auth-redirect` — wire on the `POST /api/copilot/suggest` call in `copilot.tsx` even though the route currently doesn't 401. The hook is cheap and future-proofs the feature.
6. `test.skip(!process.env.FAL_KEY, ...)` **INSIDE each test body**, not at describe-block level. This is a repeated regression.
7. No Prisma migration. No Stripe. No billing code changes.
8. Playwright color-token check uses `page.evaluate` + word-boundary regex, NOT `[class*="slate-"]` which false-positive matches `translate-x-*` utilities.
9. Build order: `lib/copilot.ts` → unit tests → `app/api/copilot/suggest/route.ts` → components → `app/copilot/page.tsx` → sidebar rename + p2-tools entry → Suspense-wrap the 4 consumer pages → e2e.
10. Keep `/api/chat` and `app/chat/page.tsx` alive. Rename only navigation surfaces. Legacy URL must not 404.
11. Zero new `slate-`, `zinc-`, `gray-` tokens in any new file under `components/copilot/`, `app/copilot/`, `app/api/copilot/`, or `lib/copilot.ts`. Run a final `Grep -r "slate-\|zinc-\|gray-"` over the new directories before declaring done.

## Acceptance criteria

1. `npx next build` passes with no new errors or warnings. All 18 model slugs still prerender; `/tools/popcorn`, `/tools/soul-cinema`, `/tools/fashion-factory`, `/u/[username]`, `/apps`, `/models`, `/community` still compile.
2. `/copilot` returns 200 and renders a page with heading `Copilot` (case-sensitive) and `data-testid="copilot"` on the root client component.
3. The starter grid shows **exactly 6** starter cards, each with `data-testid="starter-card"` and a distinct `data-intent`. Hidden once `messages.length > 0`.
4. Typing a message and clicking Send produces a user bubble (`data-role="user"`) followed by an assistant bubble (`data-role="assistant"`) with at least one `action-chip` child.
5. `POST /api/copilot/suggest` returns `{ reply, actions, intent }`. Response passes the Zod schema on the client side (no `any`).
6. Every `CopilotAction.href` starts with `/` and is a valid relative URL parseable by `new URL(href, "http://x")`.
7. Clicking an action chip navigates to the correct deep link (`/create/video?model=...&prompt=...` or the appropriate tool route).
8. `/tools/popcorn?preset=cafe-gloom&subject=coffee+shop+mood` pre-selects the `cafe-gloom` preset (card `aria-pressed="true"`) and pre-fills the subject textarea.
9. `/tools/fashion-factory?prompt=y2k+streetwear` pre-fills the style prompt textarea.
10. `/tools/soul-cinema?story=samurai+in+rain&genre=noir` pre-fills the story textarea and selects the `noir` genre chip.
11. Sidebar QUICK_LINKS has exactly one entry with `label: "Copilot"` and `href: "/copilot"`. There is NO entry with `label: "AI Chat"`.
12. `/chat` still returns 200 (legacy URL not broken).
13. `/apps` grid renders a card for the `copilot` entry in `P2_TOOLS` and clicking it navigates to `/copilot`.
14. Design tokens are consistent: hero title uses `text-brand-gradient`, CTAs use `bg-brand-gradient` + `glow-btn`, cards use `bg-[#181828]` + `border-white/15`. **Zero** occurrences of `slate-`, `zinc-`, or `gray-` base tokens in any new file under `components/copilot/`, `app/copilot/`, `app/api/copilot/`, or `lib/copilot.ts`.
15. Unit tests (15/15) pass. E2E (11/12 non-opt-in; the 12th is FAL_KEY-gated inside the test body).

# P3 Batch Spec: Editing Tools (data-driven)

Batch: edit-image, edit-video, draw-to-edit, draw-to-video, upscale, image-bg-remover, video-bg-remover, color-grading, inpaint, lipsync-studio, talking-avatar, kling-avatars-2, motion-control, multi-reference, banana-placement, product-placement, clipcut, transitions, expand-image, skin-enhancer, relight, recast, angles-2, shots (24 tools).

Audit: `npm run build` green; P2 batch complete (38 unit / 12 e2e passing) as of 2026-04-09.

## Strategy
Reuse the P2 tool-page framework. Extend `ToolDef.category` to include `"editing"`. Add `lib/tools/p3-tools.ts` exporting `P3_TOOLS: ToolDef[]`. Wire `/tools/[slug]` and `/tools` to consider both `P2_TOOLS` and `P3_TOOLS`.

## Files
1. `lib/tools/p2-tools.ts` — widen `category` union to `"identity" | "editing"`. Make `getToolBySlug` look up both P2 and P3 arrays via a shared helper (or update the dynamic route directly).
2. `lib/tools/p3-tools.ts` — 24 entries, all `category: "editing"`.
3. `app/tools/[slug]/page.tsx` — look up slug in `P2_TOOLS.concat(P3_TOOLS)`.
4. `app/tools/page.tsx` — render Identity + Editing sections.
5. `tests/unit/p3-tools.test.ts`, `tests/e2e/p3-tools.spec.ts`.

## Acceptance
- 24 P3 tools reachable at `/tools/{slug}` with h1 and Generate button.
- `/tools` shows Identity (9) and Editing (24) sections with all 33 cards.
- Build/lint/unit/e2e all green.

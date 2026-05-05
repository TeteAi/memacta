/**
 * Single source of truth for the free/paid tier rule.
 *
 * Imported by both lib/download.ts (client-side, decides whether to apply a
 * watermark on download) and lib/persona/gates.ts (server-side, decides
 * whether the user gets a clean output, whether the persona-photo path
 * applies a server-baked watermark, etc.).
 *
 * Keeping the rule here means adding a new tier (e.g. "trialing") only
 * needs to be patched in one place — both client and server pick it up.
 */

/** Anything other than "free" (and any falsy value) counts as paid. */
export function isPaidPlan(planId: string | null | undefined): boolean {
  return Boolean(planId) && planId !== "free";
}

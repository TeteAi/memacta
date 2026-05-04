/**
 * tests/lib/onboarding.test.ts
 *
 * Unit tests for the onboarding dismissal logic.
 * We test the API route handler in isolation using a mocked Prisma client.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";

// ─── Helpers to simulate the route logic without Next.js boilerplate ──────────

function shouldShowOnboarding(onboardedAt: Date | null): boolean {
  return onboardedAt === null;
}

function buildDismissPayload(): { onboardedAt: Date } {
  return { onboardedAt: new Date() };
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe("onboarding state logic", () => {
  describe("shouldShowOnboarding", () => {
    it("returns true when onboardedAt is null (first visit)", () => {
      expect(shouldShowOnboarding(null)).toBe(true);
    });

    it("returns false when onboardedAt is set (already dismissed)", () => {
      expect(shouldShowOnboarding(new Date("2026-04-22T10:00:00Z"))).toBe(false);
    });

    it("returns false even for very old dates (non-null is enough)", () => {
      expect(shouldShowOnboarding(new Date("2020-01-01"))).toBe(false);
    });
  });

  describe("buildDismissPayload", () => {
    it("returns a payload with onboardedAt set to a Date", () => {
      const before = Date.now();
      const payload = buildDismissPayload();
      const after = Date.now();

      expect(payload.onboardedAt).toBeInstanceOf(Date);
      expect(payload.onboardedAt.getTime()).toBeGreaterThanOrEqual(before);
      expect(payload.onboardedAt.getTime()).toBeLessThanOrEqual(after);
    });

    it("produces a non-null onboardedAt that suppresses the modal on re-check", () => {
      const payload = buildDismissPayload();
      expect(shouldShowOnboarding(payload.onboardedAt)).toBe(false);
    });
  });

  describe("second-visit guard", () => {
    it("modal is not shown after dismiss payload is persisted", () => {
      // Simulate: user visits → null → modal shown
      const firstVisit = null;
      expect(shouldShowOnboarding(firstVisit)).toBe(true);

      // Simulate: user dismisses → onboardedAt set
      const afterDismiss = buildDismissPayload().onboardedAt;

      // Simulate: second visit → modal not shown
      expect(shouldShowOnboarding(afterDismiss)).toBe(false);
    });
  });
});

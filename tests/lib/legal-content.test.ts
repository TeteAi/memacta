/**
 * tests/components/legal-content.test.ts
 *
 * Smoke tests — verify each legal page module imports and exports a default
 * function component without throwing. Does NOT do a full React render
 * (no jsdom dependency needed here).
 */

import { describe, it, expect } from "vitest";

// Dynamic imports let vitest catch both import-time and export-time errors
// without requiring a browser/jsdom environment.

describe("legal page module smoke tests", () => {
  it("terms page exports a default function", async () => {
    const mod = await import("@/app/legal/terms/page");
    expect(typeof mod.default).toBe("function");
  });

  it("privacy page exports a default function", async () => {
    const mod = await import("@/app/legal/privacy/page");
    expect(typeof mod.default).toBe("function");
  });

  it("dmca page exports a default function", async () => {
    const mod = await import("@/app/legal/dmca/page");
    expect(typeof mod.default).toBe("function");
  });

  it("ai-likeness page exports a default function", async () => {
    const mod = await import("@/app/legal/ai-likeness/page");
    expect(typeof mod.default).toBe("function");
  });

  it("terms page has correct metadata title", async () => {
    const mod = await import("@/app/legal/terms/page");
    expect((mod as { metadata?: { title?: string } }).metadata?.title).toContain("Terms");
  });

  it("privacy page has correct metadata title", async () => {
    const mod = await import("@/app/legal/privacy/page");
    expect((mod as { metadata?: { title?: string } }).metadata?.title).toContain("Privacy");
  });

  it("dmca page has correct metadata title", async () => {
    const mod = await import("@/app/legal/dmca/page");
    expect((mod as { metadata?: { title?: string } }).metadata?.title).toContain("DMCA");
  });

  it("ai-likeness page has correct metadata title", async () => {
    const mod = await import("@/app/legal/ai-likeness/page");
    expect((mod as { metadata?: { title?: string } }).metadata?.title).toContain("AI Likeness");
  });
});

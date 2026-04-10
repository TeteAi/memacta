import { describe, it, expect } from "vitest";
import { P2_TOOLS } from "../../lib/tools/p2-tools";

describe("P2_TOOLS", () => {
  it("has exactly 9 tools", () => {
    expect(P2_TOOLS.length).toBe(9);
  });

  it("has unique slugs", () => {
    const slugs = P2_TOOLS.map((t) => t.slug);
    expect(new Set(slugs).size).toBe(9);
  });

  it("every tool has at least 1 input", () => {
    for (const t of P2_TOOLS) {
      expect(t.inputs.length).toBeGreaterThanOrEqual(1);
    }
  });

  it("contains all 9 expected ids", () => {
    const expected = [
      "soul-id",
      "soul-moodboard",
      "character-swap-2",
      "face-swap",
      "video-face-swap",
      "outfit-swap",
      "photodump",
      "soul-cast",
      "ai-influencer",
    ];
    const ids = P2_TOOLS.map((t) => t.id);
    for (const e of expected) {
      expect(ids).toContain(e);
    }
  });
});

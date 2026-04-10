import { describe, it, expect } from "vitest";
import { P3_TOOLS } from "../../lib/tools/p3-tools";

const EXPECTED = [
  "edit-image",
  "edit-video",
  "draw-to-edit",
  "draw-to-video",
  "upscale",
  "image-bg-remover",
  "video-bg-remover",
  "color-grading",
  "inpaint",
  "lipsync-studio",
  "talking-avatar",
  "kling-avatars-2",
  "motion-control",
  "multi-reference",
  "banana-placement",
  "product-placement",
  "clipcut",
  "transitions",
  "expand-image",
  "skin-enhancer",
  "relight",
  "recast",
  "angles-2",
  "shots",
];

describe("P3_TOOLS", () => {
  it("contains all expected P3 ids", () => {
    const ids = P3_TOOLS.map((t) => t.id);
    for (const e of EXPECTED) {
      expect(ids).toContain(e);
    }
  });

  it("has unique slugs", () => {
    const slugs = P3_TOOLS.map((t) => t.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it("every tool has at least 1 input and editing category", () => {
    for (const t of P3_TOOLS) {
      expect(t.inputs.length).toBeGreaterThanOrEqual(1);
      expect(t.category).toBe("editing");
      expect(t.slug).toBe(t.id);
    }
  });
});

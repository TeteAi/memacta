import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";
import {
  POPCORN_PRESETS,
  getPopcornPreset,
  composePopcornPrompt,
  buildPopcornBatch,
} from "../../lib/popcorn";
import { P2_TOOLS } from "../../lib/tools/p2-tools";

describe("POPCORN_PRESETS", () => {
  it("1. has exactly 12 presets", () => {
    expect(POPCORN_PRESETS).toHaveLength(12);
  });

  it("2. every preset has required non-empty fields, correct aspectRatio, valid durationSec and model", () => {
    for (const preset of POPCORN_PRESETS) {
      expect(preset.id).toBeTruthy();
      expect(preset.name).toBeTruthy();
      expect(preset.tagline).toBeTruthy();
      expect(preset.basePrompt).toBeTruthy();
      expect(preset.motion).toBeTruthy();
      expect(preset.tone).toBeTruthy();
      expect(preset.gradientClass).toBeTruthy();
      expect(preset.aspectRatio).toBe("9:16");
      expect([3, 5]).toContain(preset.durationSec);
      expect(["kling-25-turbo", "seedance-20"]).toContain(preset.model);
    }
  });

  it("3. preset ids are globally unique", () => {
    const ids = POPCORN_PRESETS.map((p) => p.id);
    expect(new Set(ids).size).toBe(12);
  });
});

describe("getPopcornPreset", () => {
  it("4. returns the matching preset for snack-hop", () => {
    const preset = getPopcornPreset("snack-hop");
    expect(preset).toBeDefined();
    expect(preset?.id).toBe("snack-hop");
  });

  it("5. returns undefined for unknown preset", () => {
    expect(getPopcornPreset("does-not-exist")).toBeUndefined();
  });
});

describe("composePopcornPrompt", () => {
  const preset = getPopcornPreset("snack-hop")!;

  it("6. includes subject verbatim, basePrompt, motion, and tone; does not include subjectImageUrl", () => {
    const prompt = composePopcornPrompt(preset, "a skateboarder");
    expect(prompt).toContain("a skateboarder");
    expect(prompt).toContain(preset.basePrompt);
    expect(prompt).toContain(preset.motion);
    expect(prompt).toContain(preset.tone);
    // No image URL should appear in the text prompt
    expect(prompt).not.toContain("https://");
  });
});

describe("buildPopcornBatch", () => {
  it("7. returns array of length 3 for valid inputs", () => {
    const batch = buildPopcornBatch("snack-hop", "a skater");
    expect(batch).toHaveLength(3);
  });

  it("8. every element has mediaType video, aspectRatio 9:16, correct duration", () => {
    const preset = getPopcornPreset("snack-hop")!;
    const batch = buildPopcornBatch("snack-hop", "a skater");
    for (const req of batch) {
      expect(req.mediaType).toBe("video");
      expect(req.aspectRatio).toBe("9:16");
      expect(req.duration).toBe(preset.durationSec);
    }
  });

  it("9. the 3 elements have 3 distinct seeds", () => {
    const batch = buildPopcornBatch("snack-hop", "a skater");
    const seeds = batch.map((b) => b.seed);
    expect(new Set(seeds).size).toBe(3);
  });

  it("10. passing subjectImageUrl sets imageUrl on every element; omitting means no imageUrl", () => {
    const withImage = buildPopcornBatch("snack-hop", "a skater", "https://x.com/a.jpg");
    for (const req of withImage) {
      expect(req.imageUrl).toBe("https://x.com/a.jpg");
    }

    const withoutImage = buildPopcornBatch("snack-hop", "a skater");
    for (const req of withoutImage) {
      expect(req.imageUrl).toBeUndefined();
    }
  });

  it("11. throws with /subject/i when subjectPrompt is empty", () => {
    expect(() => buildPopcornBatch("snack-hop", "")).toThrow(/subject/i);
  });

  it("12. throws with /preset/i for unknown preset id", () => {
    expect(() => buildPopcornBatch("unknown-preset", "anything")).toThrow(/preset/i);
  });

  it("13. explicit seeds override defaults", () => {
    const batch = buildPopcornBatch("snack-hop", "x", undefined, [1, 2, 3]);
    expect(batch.map((b) => b.seed)).toEqual([1, 2, 3]);
  });

  it("14. sidebar Effects & Templates section contains Popcorn as second item", () => {
    // Static source-file assertion
    const sidebarPath = path.join(__dirname, "../../components/sidebar.tsx");
    const content = fs.readFileSync(sidebarPath, "utf-8");
    // Verify the line exists in the file
    expect(content).toContain('{ label: "Popcorn", href: "/tools/popcorn" }');
    // Verify it appears after "All Effects" and before "On Fire"
    const allEffectsIndex = content.indexOf('"All Effects"');
    const popcornIndex = content.indexOf('"/tools/popcorn"');
    const onFireIndex = content.indexOf('"On Fire"');
    expect(allEffectsIndex).toBeGreaterThan(-1);
    expect(popcornIndex).toBeGreaterThan(allEffectsIndex);
    expect(onFireIndex).toBeGreaterThan(popcornIndex);
  });

  it("15. P2_TOOLS has exactly one popcorn entry with correct fields", () => {
    const popcornEntries = P2_TOOLS.filter((t: { slug: string }) => t.slug === "popcorn");
    expect(popcornEntries).toHaveLength(1);
    const tool = popcornEntries[0];
    expect(tool.category).toBe("editing");
    expect(tool.mediaOut).toBe("video");
    expect(tool.inputs.length).toBeGreaterThanOrEqual(2);
  });
});

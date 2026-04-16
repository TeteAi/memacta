import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";
import {
  MIXED_MEDIA_STYLES,
  composeMixedMediaPrompt,
  buildMixedMediaBlends,
  buildMixedMediaBatch,
  MixedMediaSelectionError,
  MixedMediaIncompatibleMediaError,
} from "../../lib/mixed-media";
import { P2_TOOLS } from "../../lib/tools/p2-tools";

describe("MIXED_MEDIA_STYLES", () => {
  it("1. has exactly 12 entries", () => {
    expect(MIXED_MEDIA_STYLES).toHaveLength(12);
  });

  it("2. every style has non-empty required fields", () => {
    for (const style of MIXED_MEDIA_STYLES) {
      expect(style.id).toBeTruthy();
      expect(style.name).toBeTruthy();
      expect(style.tagline).toBeTruthy();
      expect(style.gradientClass).toBeTruthy();
      expect(style.promptFragment).toBeTruthy();
      expect(style.compatibleMedia.length).toBeGreaterThan(0);
    }
  });

  it("3. every style id is unique", () => {
    const ids = MIXED_MEDIA_STYLES.map((s) => s.id);
    expect(new Set(ids).size).toBe(12);
  });
});

describe("composeMixedMediaPrompt", () => {
  it("4. with 2 styles includes both promptFragment strings verbatim", () => {
    const style1 = MIXED_MEDIA_STYLES.find((s) => s.id === "anime-realism")!;
    const style2 = MIXED_MEDIA_STYLES.find((s) => s.id === "cyberpunk-noir")!;
    const result = composeMixedMediaPrompt({
      selectedStyleIds: ["anime-realism", "cyberpunk-noir"],
      subjectPrompt: "a warrior",
      mediaType: "image",
    });
    expect(result).toContain(style1.promptFragment);
    expect(result).toContain(style2.promptFragment);
  });

  it("5. includes subject prompt verbatim", () => {
    const result = composeMixedMediaPrompt({
      selectedStyleIds: ["anime-realism", "pixel-dream"],
      subjectPrompt: "a lighthouse in the storm",
      mediaType: "image",
    });
    expect(result).toContain("a lighthouse in the storm");
  });

  it("6. does NOT include referenceUrl in output even when passed via input context", () => {
    // composeMixedMediaPrompt doesn't accept referenceUrl - it must never appear in prompt
    const result = composeMixedMediaPrompt({
      selectedStyleIds: ["anime-realism", "pixel-dream"],
      subjectPrompt: "a cat",
      mediaType: "image",
    });
    expect(result).not.toContain("http://");
    expect(result).not.toContain("https://");
    expect(result).not.toContain("blob:");
  });
});

describe("buildMixedMediaBlends", () => {
  it("7. throws MixedMediaSelectionError for single style", () => {
    expect(() => buildMixedMediaBlends(["anime-realism"])).toThrow(
      MixedMediaSelectionError,
    );
  });

  it("8. throws MixedMediaSelectionError for 4 styles", () => {
    expect(() =>
      buildMixedMediaBlends(["a", "b", "c", "d"]),
    ).toThrow(MixedMediaSelectionError);
  });

  it("9. returns array of length 1 with stable blendId and both styleIds in sorted order", () => {
    const blends = buildMixedMediaBlends(["anime-realism", "oil-painting"]);
    expect(blends).toHaveLength(1);
    expect(blends[0].blendId).toBeTruthy();
    // sorted
    const sorted = [...["anime-realism", "oil-painting"]].sort();
    expect(blends[0].styleIds).toEqual(sorted);
  });
});

describe("buildMixedMediaBatch", () => {
  it("10. returns array of length 2 for variationsPerBlend=2", () => {
    const batch = buildMixedMediaBatch({
      selectedStyleIds: ["anime-realism", "oil-painting"],
      subjectPrompt: "x",
      mediaType: "image",
      aspectRatio: "1:1",
      variationsPerBlend: 2,
    });
    expect(batch).toHaveLength(2);
  });

  it("11. variationsPerBlend=3 returns 3 requests with same blendId but different variationIndex", () => {
    const batch = buildMixedMediaBatch({
      selectedStyleIds: ["anime-realism", "pixel-dream"],
      subjectPrompt: "a cat",
      mediaType: "image",
      aspectRatio: "1:1",
      variationsPerBlend: 3,
    });
    expect(batch).toHaveLength(3);
    const blendIds = new Set(batch.map((r) => r.blendId));
    expect(blendIds.size).toBe(1);
    const varIndexes = batch.map((r) => r.variationIndex);
    expect(new Set(varIndexes).size).toBe(3);
  });

  it("12. throws MixedMediaIncompatibleMediaError when oil-painting selected with video mediaType", () => {
    expect(() =>
      buildMixedMediaBatch({
        selectedStyleIds: ["anime-realism", "oil-painting"],
        subjectPrompt: "warrior",
        mediaType: "video",
        aspectRatio: "9:16",
        variationsPerBlend: 1,
      }),
    ).toThrow(MixedMediaIncompatibleMediaError);
  });

  it("13. referenceUrl undefined => requests have no imageUrl property (not empty string)", () => {
    const batch = buildMixedMediaBatch({
      selectedStyleIds: ["anime-realism", "pixel-dream"],
      subjectPrompt: "cat",
      mediaType: "image",
      aspectRatio: "1:1",
      variationsPerBlend: 1,
    });
    for (const req of batch) {
      expect(req.imageUrl).toBeUndefined();
    }
  });

  it("14. default model is flux-kontext for image and kling-25-turbo for video", () => {
    const imgBatch = buildMixedMediaBatch({
      selectedStyleIds: ["anime-realism", "pixel-dream"],
      subjectPrompt: "cat",
      mediaType: "image",
      aspectRatio: "1:1",
      variationsPerBlend: 1,
    });
    expect(imgBatch[0].model).toBe("flux-kontext");

    const vidBatch = buildMixedMediaBatch({
      selectedStyleIds: ["anime-realism", "pixel-dream"],
      subjectPrompt: "cat",
      mediaType: "video",
      aspectRatio: "9:16",
      variationsPerBlend: 1,
    });
    expect(vidBatch[0].model).toBe("kling-25-turbo");
  });
});

describe("sidebar and p2-tools", () => {
  it("15. sidebar Effects & Templates items contain Mixed Media at index 2 (after All Effects, Popcorn)", () => {
    const sidebarPath = path.join(__dirname, "../../components/sidebar.tsx");
    const content = fs.readFileSync(sidebarPath, "utf-8");
    const allEffectsIndex = content.indexOf('"All Effects"');
    const popcornIndex = content.indexOf('"/tools/popcorn"');
    const mixedMediaIndex = content.indexOf('"/tools/mixed-media"');
    const onFireIndex = content.indexOf('"On Fire"');
    expect(allEffectsIndex).toBeGreaterThan(-1);
    expect(popcornIndex).toBeGreaterThan(allEffectsIndex);
    expect(mixedMediaIndex).toBeGreaterThan(popcornIndex);
    expect(onFireIndex).toBeGreaterThan(mixedMediaIndex);
  });

  it("16. P2_TOOLS contains a mixed-media entry with category:editing, mediaOut:image, and at least 2 inputs", () => {
    const entries = P2_TOOLS.filter((t) => t.slug === "mixed-media");
    expect(entries).toHaveLength(1);
    const tool = entries[0];
    expect(tool.category).toBe("editing");
    expect(tool.mediaOut).toBe("image");
    expect(tool.inputs.length).toBeGreaterThanOrEqual(2);
  });
});

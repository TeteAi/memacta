import { describe, it, expect } from "vitest";
import { readFileSync } from "fs";
import { join } from "path";

describe("sidebar Identity section", () => {
  it("contains a Fashion Factory link between Outfit Swap and AI Influencer", () => {
    const src = readFileSync(
      join(process.cwd(), "components", "sidebar.tsx"),
      "utf-8"
    );

    // The sidebar uses JS object syntax: href: "/tools/<slug>"
    const outfitPos = src.indexOf('"/tools/outfit-swap"');
    const fashionPos = src.indexOf('"/tools/fashion-factory"');
    const influencerPos = src.indexOf('"/tools/ai-influencer"');

    // All three entries must exist
    expect(outfitPos, "outfit-swap link missing").toBeGreaterThan(-1);
    expect(fashionPos, "fashion-factory link missing").toBeGreaterThan(-1);
    expect(influencerPos, "ai-influencer link missing").toBeGreaterThan(-1);

    // Fashion Factory must appear between Outfit Swap and AI Influencer
    expect(fashionPos, "fashion-factory must come after outfit-swap").toBeGreaterThan(outfitPos);
    expect(influencerPos, "ai-influencer must come after fashion-factory").toBeGreaterThan(fashionPos);

    // Label must include "Fashion Factory"
    expect(src).toContain("Fashion Factory");
  });
});

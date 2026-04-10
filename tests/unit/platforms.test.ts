import { describe, it, expect } from "vitest";
import { PLATFORMS, getPlatform } from "@/lib/social/platforms";

describe("Social Platforms", () => {
  it("has exactly 4 platforms", () => {
    expect(PLATFORMS).toHaveLength(4);
  });

  it("each platform has a unique id", () => {
    const ids = PLATFORMS.map((p) => p.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("getPlatform returns Instagram for 'instagram'", () => {
    const ig = getPlatform("instagram");
    expect(ig).toBeDefined();
    expect(ig?.name).toBe("Instagram");
  });

  it("getPlatform returns undefined for unknown platform", () => {
    expect(getPlatform("fake")).toBeUndefined();
  });

  it("TikTok does not support images", () => {
    const tiktok = getPlatform("tiktok");
    expect(tiktok?.supportsImage).toBe(false);
  });
});

import { describe, it, expect } from "vitest";
import { composeFashionPrompt, buildFashionBatch } from "@/lib/fashion";

describe("composeFashionPrompt", () => {
  it("contains the outfit URL but NOT the person URL", () => {
    const result = composeFashionPrompt("person.png", "outfit.png", "editorial light");
    expect(result).toContain("outfit.png");
    expect(result).toContain("editorial light");
    expect(result).not.toContain("person.png");
  });

  it("uses fallback when style-prompt is empty", () => {
    const result = composeFashionPrompt("p.png", "o.png", "");
    expect(result).toContain("Studio-quality, editorial lighting");
  });

  it("embeds outfit URL verbatim including querystring", () => {
    const outfitUrl = "https://cdn.x.com/o.jpg?token=abc&v=2";
    const result = composeFashionPrompt("p.png", outfitUrl, "noir");
    expect(result).toContain(outfitUrl);
  });

  it("handles newlines in style-prompt and remains JSON-encodable", () => {
    const result = composeFashionPrompt("p.png", "o.png", "style\nwith\nnewlines");
    const roundTripped = JSON.parse(JSON.stringify(result));
    expect(typeof roundTripped).toBe("string");
    expect(roundTripped.length).toBeGreaterThan(0);
  });
});

describe("buildFashionBatch", () => {
  it("returns array of length 2 with correct shape", () => {
    const batch = buildFashionBatch("p.png", ["o1.png", "o2.png"], "editorial");
    expect(batch).toHaveLength(2);
    batch.forEach((item) => {
      expect(item.model).toBe("flux-kontext");
      expect(item.mediaType).toBe("image");
      expect(item.imageUrl).toBe("p.png");
      expect(item.aspectRatio).toBe("1:1");
      expect(typeof item.prompt).toBe("string");
      expect(item.prompt.length).toBeGreaterThan(0);
    });
  });

  it("returns empty array for empty outfit list", () => {
    const batch = buildFashionBatch("p.png", [], "");
    expect(batch).toHaveLength(0);
  });

  it("throws 'too many outfits' for more than 6 outfits", () => {
    expect(() =>
      buildFashionBatch("p.png", new Array(7).fill("o.png"), "")
    ).toThrow("too many outfits");
  });

  it("returns empty array when personUrl is empty", () => {
    const batch = buildFashionBatch("", ["o.png"], "");
    expect(batch).toHaveLength(0);
  });

  it("filters out empty outfit URLs", () => {
    const batch = buildFashionBatch("p.png", [""], "");
    expect(batch).toHaveLength(0);
  });
});

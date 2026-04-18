import { describe, it, expect } from "vitest";
import { computeContentHash } from "@/lib/persona/consent";

describe("computeContentHash", () => {
  it("is deterministic for the same keys", () => {
    const keys = ["storage/abc.jpg", "storage/def.jpg"];
    expect(computeContentHash(keys)).toBe(computeContentHash(keys));
  });

  it("is order-insensitive", () => {
    const a = ["storage/abc.jpg", "storage/def.jpg"];
    const b = ["storage/def.jpg", "storage/abc.jpg"];
    expect(computeContentHash(a)).toBe(computeContentHash(b));
  });

  it("changes when any key is different", () => {
    const a = ["storage/abc.jpg", "storage/def.jpg"];
    const b = ["storage/abc.jpg", "storage/xyz.jpg"];
    expect(computeContentHash(a)).not.toBe(computeContentHash(b));
  });

  it("changes on even a single byte delta in a key", () => {
    const a = ["storage/abc.jpg"];
    const b = ["storage/abd.jpg"];
    expect(computeContentHash(a)).not.toBe(computeContentHash(b));
  });

  it("throws on empty array", () => {
    expect(() => computeContentHash([])).toThrow();
  });

  it("produces a 64-char hex string (SHA256)", () => {
    const hash = computeContentHash(["storage/test.jpg"]);
    expect(hash).toMatch(/^[0-9a-f]{64}$/);
  });
});

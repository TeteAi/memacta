import { describe, it, expect } from "vitest";
import { checkBlocklist, BLOCKLIST_V1 } from "@/lib/persona/blocklist";

describe("checkBlocklist", () => {
  it("has exactly 10 names in the V1 seed", () => {
    expect(BLOCKLIST_V1).toHaveLength(10);
  });

  it("blocks exact matches", () => {
    const result = checkBlocklist("Taylor Swift");
    expect(result.matched).toBe(true);
  });

  it("is case-insensitive", () => {
    const result = checkBlocklist("TAYLOR SWIFT");
    expect(result.matched).toBe(true);
  });

  it("is diacritic-normalized (Beyoncé → beyonce)", () => {
    const result = checkBlocklist("Beyoncé");
    expect(result.matched).toBe(true);
  });

  it("blocks edit-distance-1 near matches", () => {
    // "Taylorr Swift" has edit distance 1 from "taylor swift"
    const result = checkBlocklist("Taylorr Swift");
    expect(result.matched).toBe(true);
  });

  it("allows names not on the blocklist", () => {
    const result = checkBlocklist("Jane Smith");
    expect(result.matched).toBe(false);
  });

  it("returns the offending blocklist name on match", () => {
    const result = checkBlocklist("Taylor Swift");
    expect(result.matched).toBe(true);
    if (result.matched) {
      expect(result.offendingName).toBe("taylor swift");
    }
  });

  it("does not block common short names (no false positives)", () => {
    const result = checkBlocklist("Tom");
    expect(result.matched).toBe(false);
  });
});

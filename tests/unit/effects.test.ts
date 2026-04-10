import { describe, it, expect } from "vitest";
import { EFFECTS, getEffectById } from "@/lib/effects";

describe("EFFECTS", () => {
  it("has at least 20 entries", () => {
    expect(EFFECTS.length).toBeGreaterThanOrEqual(20);
  });

  it("has unique ids", () => {
    const ids = EFFECTS.map((e) => e.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("has at least 5 templates", () => {
    expect(EFFECTS.filter((e) => e.category === "template").length).toBeGreaterThanOrEqual(5);
  });

  it("has at least 15 effects", () => {
    expect(EFFECTS.filter((e) => e.category === "effect").length).toBeGreaterThanOrEqual(15);
  });

  it("getEffectById returns matching entry", () => {
    const first = EFFECTS[0];
    expect(getEffectById(first.id)?.name).toBe(first.name);
    expect(getEffectById("non-existent-xyz")).toBeUndefined();
  });
});

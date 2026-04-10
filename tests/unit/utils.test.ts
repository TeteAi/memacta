import { describe, it, expect } from "vitest";
import { cn } from "../../lib/utils";

describe("cn", () => {
  it("joins class names", () => {
    expect(cn("a", "b")).toBe("a b");
  });

  it("skips falsy values", () => {
    expect(cn("a", false && "b", "c")).toBe("a c");
  });
});

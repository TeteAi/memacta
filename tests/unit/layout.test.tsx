import { describe, it, expect } from "vitest";
import { metadata } from "../../app/layout";

describe("app/layout.tsx", () => {
  it("exports metadata with title memacta", () => {
    expect(metadata.title).toBe("memacta");
  });
});

import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { auth } from "../../auth";

describe("auth config", () => {
  it("exports auth as a function", () => {
    expect(typeof auth).toBe("function");
  });

  it("auth.ts source contains required tokens", () => {
    const src = readFileSync("auth.ts", "utf8");
    expect(src).toContain("Credentials");
    expect(src).toContain("PrismaAdapter");
    expect(src).toMatch(/strategy:\s*["']jwt["']/);
  });
});

import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";

describe("prisma schema auth models", () => {
  const schema = readFileSync("prisma/schema.prisma", "utf8");

  it("has Account model", () => {
    expect(schema).toContain("model Account");
  });
  it("has Session model", () => {
    expect(schema).toContain("model Session");
  });
  it("has VerificationToken model", () => {
    expect(schema).toContain("model VerificationToken");
  });
  it("User has emailVerified DateTime?", () => {
    expect(schema).toContain("emailVerified DateTime?");
  });
});

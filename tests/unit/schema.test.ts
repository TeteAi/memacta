import { describe, it, expect } from "vitest";
import { readFileSync } from "fs";
import path from "path";

describe("prisma schema", () => {
  const raw = readFileSync(
    path.join(process.cwd(), "prisma/schema.prisma"),
    "utf8"
  );
  const schema = raw.replace(/[ \t]+/g, " ");

  it("defines User model with required fields", () => {
    expect(schema).toContain("model User");
    expect(schema).toContain("email String @unique");
    expect(schema).toContain("credits Int @default(100)");
  });
});

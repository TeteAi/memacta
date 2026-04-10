import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

describe("project config", () => {
  it("package.json name is memacta", () => {
    const pkg = JSON.parse(
      readFileSync(resolve(__dirname, "../../package.json"), "utf8"),
    );
    expect(pkg.name).toBe("memacta");
  });

  it("tsconfig strict is true", () => {
    const raw = readFileSync(
      resolve(__dirname, "../../tsconfig.json"),
      "utf8",
    );
    const tsconfig = JSON.parse(raw);
    expect(tsconfig.compilerOptions.strict).toBe(true);
  });
});

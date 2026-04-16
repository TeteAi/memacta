import { describe, it, expect } from "vitest";
import { friendlyFalError } from "@/lib/ai/fal-provider";

describe("friendlyFalError", () => {
  it("rate limits → try again soon", () => {
    expect(friendlyFalError(429, "")).toMatch(/30 seconds/);
    expect(friendlyFalError(null, "Rate limit exceeded")).toMatch(/30 seconds/);
  });

  it("5xx → service down", () => {
    expect(friendlyFalError(500, "")).toMatch(/temporarily down/i);
    expect(friendlyFalError(503, "upstream bad gateway")).toMatch(/temporarily down/i);
  });

  it("403 with queue → plan / billing hint", () => {
    expect(friendlyFalError(403, "queue scope forbidden")).toMatch(/queue access/i);
  });

  it("403 without queue → model-unavailable on current plan", () => {
    expect(friendlyFalError(403, "forbidden")).toMatch(/current fal.ai plan/i);
  });

  it("exhausted balance → over capacity phrasing (not scary billing)", () => {
    expect(friendlyFalError(null, "Exhausted balance")).toMatch(/over capacity/i);
  });

  it("network failures → check connection", () => {
    expect(friendlyFalError(null, "fetch failed")).toMatch(/couldn't reach/i);
    expect(friendlyFalError(null, "ENOTFOUND fal.run")).toMatch(/couldn't reach/i);
  });

  it("400 / content policy → rephrase", () => {
    expect(friendlyFalError(400, "")).toMatch(/rephrasing|different model/i);
    expect(friendlyFalError(null, "content policy violation")).toMatch(/rephrasing|different model/i);
  });

  it("unknown falls back to generic retry copy", () => {
    const out = friendlyFalError(null, "weird unknown error");
    expect(out).toMatch(/try again/i);
    // Must not surface the raw upstream string
    expect(out.toLowerCase()).not.toContain("weird unknown error");
  });
});

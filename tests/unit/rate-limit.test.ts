import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import {
  rateLimit,
  rateLimitKey,
  __resetRateLimits,
} from "@/lib/rate-limit";

describe("rateLimit", () => {
  beforeEach(() => {
    __resetRateLimits();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("allows up to max hits within the window", () => {
    for (let i = 0; i < 5; i++) {
      const r = rateLimit("test-key", { windowMs: 60_000, max: 5 });
      expect(r.ok).toBe(true);
      expect(r.remaining).toBe(4 - i);
    }
  });

  it("blocks the (max+1)th hit", () => {
    for (let i = 0; i < 3; i++) {
      rateLimit("test-key", { windowMs: 60_000, max: 3 });
    }
    const blocked = rateLimit("test-key", { windowMs: 60_000, max: 3 });
    expect(blocked.ok).toBe(false);
    expect(blocked.remaining).toBe(0);
    expect(blocked.retryAfterMs).toBeGreaterThan(0);
  });

  it("keys are isolated from each other", () => {
    for (let i = 0; i < 3; i++) {
      rateLimit("key-a", { windowMs: 60_000, max: 3 });
    }
    expect(
      rateLimit("key-a", { windowMs: 60_000, max: 3 }).ok
    ).toBe(false);
    // key-b has never been hit — still at full allowance.
    expect(
      rateLimit("key-b", { windowMs: 60_000, max: 3 }).ok
    ).toBe(true);
  });

  it("drops timestamps after the window expires", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-01-01T00:00:00Z"));
    for (let i = 0; i < 3; i++) {
      rateLimit("test-key", { windowMs: 60_000, max: 3 });
    }
    expect(
      rateLimit("test-key", { windowMs: 60_000, max: 3 }).ok
    ).toBe(false);

    // Advance past the window.
    vi.setSystemTime(new Date("2026-01-01T00:01:01Z"));
    expect(
      rateLimit("test-key", { windowMs: 60_000, max: 3 }).ok
    ).toBe(true);
  });
});

describe("rateLimitKey", () => {
  it("prefers userId when provided", () => {
    const req = new Request("https://example.com", {
      headers: { "x-forwarded-for": "1.2.3.4" },
    });
    expect(rateLimitKey(req, "user-123")).toBe("u:user-123");
  });

  it("falls back to x-forwarded-for when anon", () => {
    const req = new Request("https://example.com", {
      headers: { "x-forwarded-for": "1.2.3.4" },
    });
    expect(rateLimitKey(req, null)).toBe("ip:1.2.3.4");
  });

  it("handles comma-separated x-forwarded-for", () => {
    const req = new Request("https://example.com", {
      headers: { "x-forwarded-for": "1.2.3.4, 10.0.0.1, 10.0.0.2" },
    });
    expect(rateLimitKey(req, null)).toBe("ip:1.2.3.4");
  });

  it("falls back to x-real-ip when no forwarded-for", () => {
    const req = new Request("https://example.com", {
      headers: { "x-real-ip": "5.6.7.8" },
    });
    expect(rateLimitKey(req, null)).toBe("ip:5.6.7.8");
  });

  it("returns unknown when no IP headers present", () => {
    const req = new Request("https://example.com");
    expect(rateLimitKey(req, null)).toBe("ip:unknown");
  });
});

import { describe, it, expect, beforeEach, afterEach } from "vitest";
import {
  isStripeConfigured,
  priceEnvKey,
  resolvePriceId,
  getAppUrl,
} from "@/lib/stripe";

// Snapshot the env we touch so we can restore between tests — vitest
// shares process.env across the suite and we don't want Stripe tests
// leaking into other suites' expectations.
const SAVED: Record<string, string | undefined> = {};
const KEYS = [
  "STRIPE_SECRET_KEY",
  "STRIPE_PRICE_STARTER",
  "STRIPE_PRICE_TOPUP_50",
  "APP_URL",
  "AUTH_URL",
];

describe("lib/stripe helpers", () => {
  beforeEach(() => {
    for (const k of KEYS) SAVED[k] = process.env[k];
  });
  afterEach(() => {
    for (const k of KEYS) {
      if (SAVED[k] === undefined) delete process.env[k];
      else process.env[k] = SAVED[k];
    }
  });

  describe("isStripeConfigured", () => {
    it("false when STRIPE_SECRET_KEY is missing", () => {
      delete process.env.STRIPE_SECRET_KEY;
      expect(isStripeConfigured()).toBe(false);
    });

    it("true when STRIPE_SECRET_KEY is set", () => {
      process.env.STRIPE_SECRET_KEY = "sk_test_123";
      expect(isStripeConfigured()).toBe(true);
    });

    it("false when STRIPE_SECRET_KEY is empty string", () => {
      process.env.STRIPE_SECRET_KEY = "";
      expect(isStripeConfigured()).toBe(false);
    });
  });

  describe("priceEnvKey", () => {
    it("upper-snake-cases a plan id", () => {
      expect(priceEnvKey("starter")).toBe("STRIPE_PRICE_STARTER");
      expect(priceEnvKey("creator")).toBe("STRIPE_PRICE_CREATOR");
    });

    it("converts hyphens to underscores", () => {
      expect(priceEnvKey("topup-50")).toBe("STRIPE_PRICE_TOPUP_50");
      expect(priceEnvKey("topup-1000")).toBe("STRIPE_PRICE_TOPUP_1000");
    });
  });

  describe("resolvePriceId", () => {
    it("returns null when env var isn't set", () => {
      delete process.env.STRIPE_PRICE_STARTER;
      expect(resolvePriceId("starter")).toBeNull();
    });

    it("returns null when env var is empty", () => {
      process.env.STRIPE_PRICE_STARTER = "";
      expect(resolvePriceId("starter")).toBeNull();
    });

    it("returns the price id when set", () => {
      process.env.STRIPE_PRICE_STARTER = "price_abc123";
      expect(resolvePriceId("starter")).toBe("price_abc123");
    });

    it("resolves topup ids with hyphens", () => {
      process.env.STRIPE_PRICE_TOPUP_50 = "price_xyz";
      expect(resolvePriceId("topup-50")).toBe("price_xyz");
    });
  });

  describe("getAppUrl", () => {
    it("prefers APP_URL", () => {
      process.env.APP_URL = "https://memacta.app";
      process.env.AUTH_URL = "https://wrong.example";
      expect(getAppUrl()).toBe("https://memacta.app");
    });

    it("falls back to AUTH_URL", () => {
      delete process.env.APP_URL;
      process.env.AUTH_URL = "https://memacta.vercel.app";
      expect(getAppUrl()).toBe("https://memacta.vercel.app");
    });

    it("defaults to the Vercel preview URL", () => {
      // After unifying with lib/app-url.ts the fallback is the production
      // preview URL (so emails / sitemap / Stripe return URLs land on a real
      // page even when APP_URL/AUTH_URL aren't set).
      delete process.env.APP_URL;
      delete process.env.AUTH_URL;
      expect(getAppUrl()).toBe("https://memacta.vercel.app");
    });
  });
});

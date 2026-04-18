import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { canCreatePersona, canStartPremiumTrain, canDownloadClean } from "@/lib/persona/gates";

const baseUser = {
  id: "user-1",
  emailVerified: new Date(),
  createdAt: new Date(Date.now() - 48 * 60 * 60 * 1000), // 48h ago
  premiumLoraTrainsUsed: 0,
  subscription: null,
};

describe("canCreatePersona", () => {
  it("returns allowed for verified user", () => {
    expect(canCreatePersona(baseUser).allowed).toBe(true);
  });

  it("returns email_unverified when emailVerified is null", () => {
    const user = { ...baseUser, emailVerified: null };
    const result = canCreatePersona(user);
    expect(result.allowed).toBe(false);
    expect(result.reason).toBe("email_unverified");
  });
});

describe("canStartPremiumTrain — free user", () => {
  const freeUser = { ...baseUser, subscription: null };

  it("allows free user past cooling period with no trains used", () => {
    const result = canStartPremiumTrain(freeUser);
    expect(result.allowed).toBe(true);
  });

  it("blocks free user within cooling period (no bypass)", () => {
    const user = { ...freeUser, createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000) }; // 12h ago
    const saved = process.env.TEST_SKIP_COOLING_PERIOD;
    delete process.env.TEST_SKIP_COOLING_PERIOD;
    const result = canStartPremiumTrain(user);
    if (saved !== undefined) process.env.TEST_SKIP_COOLING_PERIOD = saved;
    expect(result.allowed).toBe(false);
    expect(result.reason).toBe("cooling_period");
  });

  it("bypasses cooling period when TEST_SKIP_COOLING_PERIOD=true in non-prod", () => {
    const user = { ...freeUser, createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000) }; // 1h ago
    const savedSkip = process.env.TEST_SKIP_COOLING_PERIOD;
    const savedEnv = process.env.NODE_ENV;
    process.env.TEST_SKIP_COOLING_PERIOD = "true";
    // NODE_ENV is test in vitest, not production
    const result = canStartPremiumTrain(user);
    process.env.TEST_SKIP_COOLING_PERIOD = savedSkip ?? "";
    expect(result.allowed).toBe(true);
  });

  it("blocks when lifetime_limit reached (premiumLoraTrainsUsed >= 1)", () => {
    const user = { ...freeUser, premiumLoraTrainsUsed: 1 };
    const result = canStartPremiumTrain(user);
    expect(result.allowed).toBe(false);
    expect(result.reason).toBe("lifetime_limit");
  });
});

describe("canStartPremiumTrain — paid user (creator)", () => {
  const creatorUser = {
    ...baseUser,
    premiumLoraTrainsUsed: 0,
    subscription: { planId: "creator" },
  };

  it("allows creator user with no trains used", () => {
    expect(canStartPremiumTrain(creatorUser).allowed).toBe(true);
  });

  it("blocks creator at monthly cap (5)", () => {
    const user = { ...creatorUser, premiumLoraTrainsUsed: 5 };
    const result = canStartPremiumTrain(user);
    expect(result.allowed).toBe(false);
    expect(result.reason).toBe("monthly_limit");
  });
});

describe("canDownloadClean", () => {
  it("returns false for free user", () => {
    expect(canDownloadClean(baseUser)).toBe(false);
  });

  it("returns true for creator user", () => {
    const user = { ...baseUser, subscription: { planId: "creator" } };
    expect(canDownloadClean(user)).toBe(true);
  });
});

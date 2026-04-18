/**
 * Persona feature gates — enforce product policy from decisions.md.
 *
 * Free tier:
 *   - Email verification required before any Persona creation
 *   - 24h cooling period between signup and first premium LoRA train
 *   - 1 lifetime premium LoRA train (never resets)
 *
 * Paid tiers (Creator/Pro/Studio):
 *   - Per-month caps from decisions.md
 *   - No cooling period
 *
 * TEST_SKIP_COOLING_PERIOD=true (only in non-prod) bypasses the 24h gate.
 */

const COOLING_PERIOD_MS = 24 * 60 * 60 * 1000; // 24 hours

const MONTHLY_LORA_CAPS: Record<string, number> = {
  free: 1,       // lifetime, not monthly — enforced separately
  starter: 3,    // not in decisions.md, using conservative default
  creator: 5,
  pro: 20,
  studio: Infinity,
};

export interface GateUser {
  id: string;
  emailVerified: Date | null;
  createdAt: Date;
  premiumLoraTrainsUsed: number;
  subscription?: {
    planId: string;
  } | null;
}

export interface GateResult {
  allowed: boolean;
  reason?: string;
}

/**
 * Can the user create a new Persona (any tier)?
 * Requires email verification.
 */
export function canCreatePersona(user: GateUser): GateResult {
  if (!user.emailVerified) {
    return { allowed: false, reason: "email_unverified" };
  }
  return { allowed: true };
}

/**
 * Can the user start a premium LoRA training run?
 * Enforces cooling period + lifetime/monthly cap.
 */
export function canStartPremiumTrain(user: GateUser): GateResult {
  if (!user.emailVerified) {
    return { allowed: false, reason: "email_unverified" };
  }

  const planId = user.subscription?.planId ?? "free";
  const isFree = planId === "free";

  // Cooling period — only for free users, only bypass in non-prod with TEST flag
  if (isFree) {
    const shouldSkip =
      process.env.TEST_SKIP_COOLING_PERIOD === "true" &&
      process.env.NODE_ENV !== "production";

    if (!shouldSkip) {
      const elapsed = Date.now() - user.createdAt.getTime();
      if (elapsed < COOLING_PERIOD_MS) {
        const remainingMs = COOLING_PERIOD_MS - elapsed;
        const remainingHours = Math.ceil(remainingMs / (1000 * 60 * 60));
        return {
          allowed: false,
          reason: "cooling_period",
          // @ts-expect-error extra field for UI
          remainingHours,
        };
      }
    }

    // Lifetime cap for free users — 1 total, ever
    if (user.premiumLoraTrainsUsed >= 1) {
      return { allowed: false, reason: "lifetime_limit" };
    }
  } else {
    // Paid user — check per-month cap
    // Note: premiumLoraTrainsUsed is a lifetime counter on the user row.
    // For paid tiers we rely on the subscription cycle to gate rather than
    // the raw counter (which would need a reset mechanism). For v1 we apply
    // the monthly cap as a soft check against the raw counter for simplicity;
    // a proper reset mechanism is a follow-up.
    const cap = MONTHLY_LORA_CAPS[planId] ?? 5;
    if (isFinite(cap) && user.premiumLoraTrainsUsed >= cap) {
      return { allowed: false, reason: "monthly_limit" };
    }
  }

  return { allowed: true };
}

/**
 * Can the user download a clean (no watermark) output?
 * Free tier users always get watermarked; paid users get clean.
 */
export function canDownloadClean(user: GateUser): boolean {
  const planId = user.subscription?.planId ?? "free";
  return planId !== "free";
}

/**
 * Should a free-tier persona-attributed generation be watermarked at the
 * pixel level server-side?
 */
export function shouldApplyServerWatermark(user: GateUser): boolean {
  return !canDownloadClean(user);
}

import { prisma } from "@/lib/db";

/**
 * Per-user daily generation cap. Hard ceiling on how many credits a single
 * user can burn in any rolling 24-hour window — protects the fal.ai bill from
 * a single bad actor (or an overeager tester) draining the pool in minutes.
 *
 * Set to 100 so a freshly-signed-up user (100-credit welcome bonus) can
 * actually use their welcome credits in one session — including one
 * standard-tier video (Seedance 2.0 / Kling 3 / Kling o1 = 50 credits) plus
 * a few images. Once paid tiers actually gate themselves through Stripe,
 * this function should branch on the user's plan and return a higher
 * ceiling for paid users.
 */
export const DEFAULT_DAILY_CAP = 100;

export interface DailyCapStatus {
  cap: number;
  usedToday: number;
  remaining: number;
  windowStart: Date;
  resetAt: Date;
}

/**
 * Sum credits spent (net of refunds) inside the last 24h for a given user.
 *
 * Uses CreditTransaction as the source of truth so we don't need any extra
 * schema columns or a background reset job — the rolling window is derived
 * purely from `createdAt`. Refunds (positive amounts, type="refund") cancel
 * out the matching "generation" debits so a failed run doesn't eat into the
 * cap.
 */
export async function getDailyCapStatus(userId: string, cap: number = DEFAULT_DAILY_CAP): Promise<DailyCapStatus> {
  const now = new Date();
  const windowStart = new Date(now.getTime() - 24 * 60 * 60 * 1000);

  const txns = await prisma.creditTransaction.findMany({
    where: {
      userId,
      createdAt: { gte: windowStart },
      type: { in: ["generation", "refund"] },
    },
    select: { amount: true, type: true, createdAt: true },
  });

  // "generation" rows are negative amounts (debits). "refund" rows are
  // positive. Net usage is `-sum(amount)` across both — if a refund fully
  // matches its generation the pair contributes 0, exactly what we want.
  let net = 0;
  let oldestMatchingCreatedAt: Date | null = null;
  for (const t of txns) {
    net -= t.amount;
    if (t.type === "generation" && (!oldestMatchingCreatedAt || t.createdAt < oldestMatchingCreatedAt)) {
      oldestMatchingCreatedAt = t.createdAt;
    }
  }
  const usedToday = Math.max(0, net);

  // Reset happens 24h after the OLDEST generation still in the window expires
  // out of it. If no generations yet, just project 24h forward.
  const resetAt = oldestMatchingCreatedAt
    ? new Date(oldestMatchingCreatedAt.getTime() + 24 * 60 * 60 * 1000)
    : new Date(now.getTime() + 24 * 60 * 60 * 1000);

  return {
    cap,
    usedToday,
    remaining: Math.max(0, cap - usedToday),
    windowStart,
    resetAt,
  };
}

/**
 * Pre-flight check before running a generation. Returns `{ ok: false, ... }`
 * if this request would push the user past their daily cap — callers should
 * 429 the response with the status object so the client can show a clear
 * "comes back at HH:MM" message.
 */
export async function checkDailyCap(
  userId: string,
  costCredits: number,
  cap: number = DEFAULT_DAILY_CAP
): Promise<{ ok: true; status: DailyCapStatus } | { ok: false; status: DailyCapStatus }> {
  const status = await getDailyCapStatus(userId, cap);
  if (status.usedToday + costCredits > status.cap) {
    return { ok: false, status };
  }
  return { ok: true, status };
}

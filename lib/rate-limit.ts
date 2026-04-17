// Lightweight in-memory sliding-window rate limiter. Keyed by IP (or any
// string — callers pass whatever identity makes sense: userId for
// authenticated, IP for anon). Not distributed — each Vercel serverless
// instance has its own map — so a determined attacker could fan out
// across cold starts. Good enough for beta to blunt accidental abuse
// and obvious scripted loops; upgrade to Upstash / Vercel KV when real
// traffic arrives.
//
// Usage:
//   const check = rateLimit(key, { windowMs: 60_000, max: 5 });
//   if (!check.ok) return 429 with retryAfter seconds.

type Bucket = number[]; // timestamps (ms) of recent hits

const BUCKETS = new Map<string, Bucket>();
// Keep total map bounded so a bot spinning thousands of keys can't leak
// memory forever. Sweep old keys at this threshold.
const MAX_KEYS = 5000;

export type RateLimitResult = {
  ok: boolean;
  limit: number;
  remaining: number;
  retryAfterMs: number;
};

export function rateLimit(
  key: string,
  opts: { windowMs: number; max: number }
): RateLimitResult {
  const now = Date.now();
  const windowStart = now - opts.windowMs;

  let bucket = BUCKETS.get(key);
  if (!bucket) {
    bucket = [];
    BUCKETS.set(key, bucket);
  }

  // Drop timestamps outside the window.
  while (bucket.length > 0 && bucket[0] < windowStart) {
    bucket.shift();
  }

  // Sweep: if the map has grown huge, clear buckets that are entirely
  // empty (no recent hits). Cheap O(n) on the offending request, but
  // only triggers at the threshold so typical requests stay O(1).
  if (BUCKETS.size > MAX_KEYS) {
    for (const [k, v] of BUCKETS) {
      if (v.length === 0 || v[v.length - 1] < windowStart) {
        BUCKETS.delete(k);
      }
    }
  }

  if (bucket.length >= opts.max) {
    const retryAfterMs = Math.max(0, bucket[0] + opts.windowMs - now);
    return {
      ok: false,
      limit: opts.max,
      remaining: 0,
      retryAfterMs,
    };
  }

  bucket.push(now);
  return {
    ok: true,
    limit: opts.max,
    remaining: opts.max - bucket.length,
    retryAfterMs: 0,
  };
}

// Pull a caller identity out of a Request — prefer userId when
// available so a single user doesn't pool with all anons behind NAT.
export function rateLimitKey(
  req: Request,
  userId: string | null | undefined
): string {
  if (userId) return `u:${userId}`;
  const hdr =
    req.headers.get("x-forwarded-for") ??
    req.headers.get("x-real-ip") ??
    "";
  const ip = hdr.split(",")[0]?.trim() || "unknown";
  return `ip:${ip}`;
}

// Test-only helper — clears all buckets between cases.
export function __resetRateLimits(): void {
  BUCKETS.clear();
}

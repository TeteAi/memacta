// Rate limiter — Upstash Redis (prod) / in-memory Map (dev fallback).
//
// Public API is unchanged from the previous in-memory implementation so
// all existing callers (/api/generate, /api/upload, /api/copilot/suggest,
// /api/persona/*) continue to work with zero changes.
//
// Graceful degradation:
//  - UPSTASH_REDIS_REST_URL unset + NODE_ENV !== 'production' → in-memory
//    Map (single-instance, good enough for local dev / Vitest).
//  - UPSTASH_REDIS_REST_URL unset + NODE_ENV === 'production' → throw at
//    first call so Vercel logs a loud error instead of silently rate-limiting
//    from a fresh in-memory store on every cold start.
//
// Usage:
//   const check = rateLimit(key, { windowMs: 60_000, max: 10 });
//   if (!check.ok) return 429 with retryAfter seconds.

// No top-level imports from @upstash/ratelimit — we import lazily in upstashRateLimit()
// to avoid breaking dev environments that don't have the env vars set.

export type RateLimitResult = {
  ok: boolean;
  limit: number;
  remaining: number;
  retryAfterMs: number;
};

// ─── Configuration helpers ───────────────────────────────────────────────────

/** Returns true when Upstash env vars are present. */
export function isConfigured(): boolean {
  return Boolean(
    process.env.UPSTASH_REDIS_REST_URL &&
      process.env.UPSTASH_REDIS_REST_TOKEN
  );
}

// ─── In-memory fallback (dev / test only) ────────────────────────────────────

type Bucket = number[]; // timestamps (ms) of recent hits
const BUCKETS = new Map<string, Bucket>();
const MAX_KEYS = 5000;

function inMemoryRateLimit(
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

  while (bucket.length > 0 && bucket[0] < windowStart) {
    bucket.shift();
  }

  if (BUCKETS.size > MAX_KEYS) {
    for (const [k, v] of BUCKETS) {
      if (v.length === 0 || v[v.length - 1] < windowStart) {
        BUCKETS.delete(k);
      }
    }
  }

  if (bucket.length >= opts.max) {
    const retryAfterMs = Math.max(0, bucket[0] + opts.windowMs - now);
    return { ok: false, limit: opts.max, remaining: 0, retryAfterMs };
  }

  bucket.push(now);
  return {
    ok: true,
    limit: opts.max,
    remaining: opts.max - bucket.length,
    retryAfterMs: 0,
  };
}

// ─── Upstash Redis path ───────────────────────────────────────────────────────

// Lazy singletons — only created when first needed so build/import of this
// module doesn't throw when env vars aren't set.
let _upstashLimiters: Map<string, import("@upstash/ratelimit").Ratelimit> | null = null;

function getLimiterKey(windowMs: number, max: number): string {
  return `${windowMs}:${max}`;
}

async function upstashRateLimit(
  key: string,
  opts: { windowMs: number; max: number }
): Promise<RateLimitResult> {
  const { Redis } = await import("@upstash/redis");
  const { Ratelimit } = await import("@upstash/ratelimit");

  if (!_upstashLimiters) {
    _upstashLimiters = new Map();
  }

  const limiterKey = getLimiterKey(opts.windowMs, opts.max);
  let limiter = _upstashLimiters.get(limiterKey);

  if (!limiter) {
    const redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL!,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    });

    limiter = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(opts.max, `${opts.windowMs} ms`),
      analytics: false,
      prefix: "rl:memacta",
    });
    _upstashLimiters.set(limiterKey, limiter);
  }

  const result = await limiter.limit(key);

  const retryAfterMs =
    result.success ? 0 : Math.max(0, result.reset - Date.now());

  return {
    ok: result.success,
    limit: result.limit,
    remaining: result.remaining,
    retryAfterMs,
  };
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Check and record a rate-limit hit for `key`.
 * Always returns a Promise so callers can uniformly `await` the result.
 */
export async function rateLimit(
  key: string,
  opts: { windowMs: number; max: number }
): Promise<RateLimitResult> {
  if (!isConfigured()) {
    if (process.env.NODE_ENV === "production") {
      throw new Error(
        "[rate-limit] UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN are required in production."
      );
    }
    // Dev / test: use in-memory fallback.
    return inMemoryRateLimit(key, opts);
  }

  return upstashRateLimit(key, opts);
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

// Test-only helper — clears all in-memory buckets between cases.
export function __resetRateLimits(): void {
  BUCKETS.clear();
  _upstashLimiters = null;
}

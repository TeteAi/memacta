/**
 * Cloudflare Turnstile token verifier.
 *
 * Used at the abuse-prone front-door endpoints — currently /api/auth/register,
 * extendable to forgot-password and contact when needed. Free, cookieless,
 * and unlike reCAPTCHA doesn't fingerprint visitors.
 *
 * Behaviour matrix:
 *   • TURNSTILE_SECRET_KEY unset (any env)  → verification skipped + warn
 *     once. Lets local dev / preview branches without keys keep working.
 *   • TURNSTILE_SECRET_KEY set + token absent → fail closed (treated as
 *     bot). Front-end must always include a token when keys are configured.
 *   • TURNSTILE_SECRET_KEY set + token present → POST to siteverify and
 *     return whatever Cloudflare says.
 *
 * Always returns within ~3s — the siteverify call is fetched with a hard
 * AbortController timeout so a hung Cloudflare endpoint can't stall the
 * register route past Vercel's function ceiling.
 */

const SITEVERIFY_URL =
  "https://challenges.cloudflare.com/turnstile/v0/siteverify";
const VERIFY_TIMEOUT_MS = 3000;

let warnedMissingSecret = false;

export type TurnstileResult =
  | { ok: true; skipped: false }
  | { ok: true; skipped: true; reason: string }
  | { ok: false; reason: string };

export function isTurnstileConfigured(): boolean {
  return Boolean(process.env.TURNSTILE_SECRET_KEY);
}

/**
 * Verify a Turnstile response token submitted from the browser.
 * `remoteIp` should be the request IP (from `x-forwarded-for`); Cloudflare
 * uses it for additional risk signals, but it's optional.
 */
export async function verifyTurnstile(
  token: string | null | undefined,
  remoteIp?: string | null
): Promise<TurnstileResult> {
  const secret = process.env.TURNSTILE_SECRET_KEY;

  if (!secret) {
    // Allowed in dev / preview without keys — but a missing key in
    // production is a real configuration error worth surfacing in logs.
    if (process.env.NODE_ENV === "production" && !warnedMissingSecret) {
      // eslint-disable-next-line no-console
      console.warn(
        "[turnstile] TURNSTILE_SECRET_KEY is not set in production — bot challenges are disabled."
      );
      warnedMissingSecret = true;
    }
    return { ok: true, skipped: true, reason: "secret_not_configured" };
  }

  if (!token || token.length < 10) {
    return { ok: false, reason: "missing_token" };
  }

  const body = new URLSearchParams();
  body.set("secret", secret);
  body.set("response", token);
  if (remoteIp) body.set("remoteip", remoteIp);

  const ctrl = new AbortController();
  const timeoutId = setTimeout(() => ctrl.abort(), VERIFY_TIMEOUT_MS);

  let json: { success?: boolean; "error-codes"?: string[] } | null = null;
  try {
    const res = await fetch(SITEVERIFY_URL, {
      method: "POST",
      body,
      headers: { "content-type": "application/x-www-form-urlencoded" },
      signal: ctrl.signal,
    });
    if (!res.ok) {
      return { ok: false, reason: `siteverify_${res.status}` };
    }
    json = (await res.json()) as { success?: boolean; "error-codes"?: string[] };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return { ok: false, reason: msg.includes("abort") ? "siteverify_timeout" : "siteverify_network" };
  } finally {
    clearTimeout(timeoutId);
  }

  if (json?.success) {
    return { ok: true, skipped: false };
  }
  return {
    ok: false,
    reason: json?.["error-codes"]?.[0] ?? "siteverify_rejected",
  };
}

/** Pull the request IP for the `remoteip` field. */
export function turnstileRemoteIp(req: Request): string | null {
  const hdr =
    req.headers.get("cf-connecting-ip") ??
    req.headers.get("x-forwarded-for") ??
    req.headers.get("x-real-ip");
  if (!hdr) return null;
  return hdr.split(",")[0]?.trim() || null;
}

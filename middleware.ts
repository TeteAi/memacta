import { NextResponse } from "next/server";

// Lightweight middleware layer whose only job right now is to stamp
// security headers on every response. No auth, no logic, no matching —
// so it's safe to run on every request.
//
// Why here and not next.config.js?
//   Next's headers() config works fine for static headers too, but doing
//   it in middleware keeps it visible with the rest of the runtime code
//   and makes it easier to add per-request nuance (e.g. nonce-based CSP)
//   when we need it.

export function middleware() {
  const res = NextResponse.next();

  // X-Content-Type-Options: nosniff
  //   Browsers obey the Content-Type header instead of guessing.
  res.headers.set("x-content-type-options", "nosniff");

  // Referrer-Policy: strict-origin-when-cross-origin
  //   Send the full URL to same-origin requests, only the origin to
  //   cross-origin, and nothing on HTTPS → HTTP downgrades.
  res.headers.set("referrer-policy", "strict-origin-when-cross-origin");

  // X-Frame-Options: SAMEORIGIN
  //   Clickjacking defense. We don't embed the app in an iframe ourselves
  //   anywhere, so SAMEORIGIN is safe; upgrade to DENY if we never want
  //   any framing at all.
  res.headers.set("x-frame-options", "SAMEORIGIN");

  // Permissions-Policy
  //   Explicitly deny capabilities the app doesn't use. Prevents third
  //   party iframes / scripts from sneaking access to the user's mic /
  //   geolocation etc. if an XSS ever landed.
  res.headers.set(
    "permissions-policy",
    "camera=(), microphone=(), geolocation=(), payment=()"
  );

  // Strict-Transport-Security (HSTS) — force HTTPS for a year on this
  // and all subdomains, opt into preload. Vercel already serves HTTPS
  // but HSTS protects against first-time downgrade on a hostile network.
  res.headers.set(
    "strict-transport-security",
    "max-age=31536000; includeSubDomains; preload"
  );

  // NOTE: no Content-Security-Policy yet. Adding a strict CSP needs an
  // audit of every inline script / style the app serves (Next's preload
  // hints, Tailwind JIT, next/image blurDataURL, etc.). Left as a
  // dedicated follow-up so we don't ship a broken one in a hurry.

  return res;
}

export const config = {
  // Run on every path EXCEPT static assets and Next internals. _next and
  // favicon are served at edge without headers, but other URLs hit this.
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};

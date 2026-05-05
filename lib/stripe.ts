import Stripe from "stripe";

// Lazy Stripe client. We want the app to boot fine without keys (dev /
// CI), but any route that calls `getStripe()` will throw a clear error
// telling the caller to set STRIPE_SECRET_KEY. `isStripeConfigured()` is
// the polite gate — routes use it to return a 503 "coming soon" when the
// env isn't wired, instead of crashing with a cryptic init error.

let _stripe: Stripe | null = null;

export function isStripeConfigured(): boolean {
  return Boolean(process.env.STRIPE_SECRET_KEY);
}

export function getStripe(): Stripe {
  if (_stripe) return _stripe;
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    throw new Error(
      "STRIPE_SECRET_KEY is not set — call isStripeConfigured() first"
    );
  }
  _stripe = new Stripe(key, {
    // Pin to a known API version so the SDK doesn't pick up breaking
    // changes silently when we upgrade the `stripe` package.
    apiVersion: "2026-03-25.dahlia",
    typescript: true,
    appInfo: {
      name: "memacta",
      version: "0.1.0",
    },
  });
  return _stripe;
}

// Resolve the Stripe price id for a given plan or topup package. We keep
// a single source of truth here so the checkout routes and the webhook
// both reach for the same map.
//
// Plan / topup ids live in `lib/credits.ts`; the env-var name convention
// is `STRIPE_PRICE_<ID_UPPER_SNAKE>` (e.g. STRIPE_PRICE_STARTER,
// STRIPE_PRICE_TOPUP_50). We accept hyphens in plan ids by replacing
// them with underscores.

export function priceEnvKey(id: string): string {
  return `STRIPE_PRICE_${id.toUpperCase().replace(/-/g, "_")}`;
}

export function resolvePriceId(id: string): string | null {
  const key = priceEnvKey(id);
  const val = process.env[key];
  return val && val.length > 0 ? val : null;
}

// Return URL helper — Stripe redirects the user back here after checkout.
// Re-exported from lib/app-url.ts so there's a single source of truth across
// Stripe, NextAuth, sitemap, email-link builders, etc. Setting APP_URL once
// in Vercel updates every downstream URL.
export { getAppUrl } from "@/lib/app-url";

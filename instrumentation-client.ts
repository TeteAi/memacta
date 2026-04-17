import * as Sentry from "@sentry/nextjs";

// Browser-side Sentry init. Runs on every page load once the client
// hydrates. DSN-gated like the server configs — no DSN, no-op.
// Replay / session tracking is intentionally OFF for now (privacy-
// sensitive and expensive in quota); we can opt in later per-page.

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN ?? "",
  tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 0,
  environment: process.env.NODE_ENV,
});

// Next.js ≥15 uses this hook to forward router-transition errors to
// Sentry. Registering it is a no-op when the SDK has no DSN.
export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;

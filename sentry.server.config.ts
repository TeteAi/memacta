import * as Sentry from "@sentry/nextjs";

// DSN-gated. When NEXT_PUBLIC_SENTRY_DSN isn't set, Sentry.init is still
// called with an empty DSN which makes the SDK a no-op — captureException
// calls turn into harmless noise instead of crashing. That way we can
// commit the integration without forcing anyone to sign up for Sentry.

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN ?? "",
  // Low sample rate by default — generation traffic can be spiky and we
  // don't want to chew Sentry quota before we even know what's useful.
  tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 0,
  // Leave `enabled` unset; SDK disables itself automatically when DSN is empty.
  environment: process.env.VERCEL_ENV ?? process.env.NODE_ENV,
});

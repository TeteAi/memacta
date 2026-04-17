import * as Sentry from "@sentry/nextjs";

// Edge runtime config — middleware + edge API routes. Keeps the same
// DSN-gating behaviour as sentry.server.config.ts.

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN ?? "",
  tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 0,
  environment: process.env.VERCEL_ENV ?? process.env.NODE_ENV,
});

// Next.js instrumentation entry. Fires once per runtime (server vs
// edge) at boot. We just re-export the matching Sentry config so the
// SDK initialises correctly in both environments.

export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    await import("./sentry.server.config");
  }
  if (process.env.NEXT_RUNTIME === "edge") {
    await import("./sentry.edge.config");
  }
}

// Next ≥15 uses this hook for request-level error capture on server
// and edge runtimes. Safe to export even when the DSN is unset — the
// no-op Sentry client discards the events.
export { captureRequestError as onRequestError } from "@sentry/nextjs";

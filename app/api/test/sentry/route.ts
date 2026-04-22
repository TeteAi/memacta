/**
 * GET /api/test/sentry
 *
 * Dev + staging only (not available in production). Deliberately throws
 * so we can confirm Sentry captures the event within ~60 seconds.
 *
 * Used by the prod smoke-test script: operator hits this route from a
 * logged-in browser, then checks Sentry Issues dashboard.
 */

import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "not_available" }, { status: 404 });
  }

  // This error should appear in Sentry (or in the server console in dev).
  throw new Error("[memacta smoke test] Sentry test error — this is intentional.");
}

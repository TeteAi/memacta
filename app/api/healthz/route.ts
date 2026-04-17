import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// Health-check endpoint for uptime monitors (Vercel, UptimeRobot,
// Better Stack, etc.). Returns 200 when the app can reach the DB;
// 503 otherwise so a monitor can page on real outages instead of
// just "HTTP 200 on /".
//
// Intentionally cheap: a single SELECT 1 against Postgres. No auth
// required, no secrets exposed. The response body only contains a
// status string + timestamp so probe output stays greppable.

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  const startedAt = Date.now();
  try {
    // SELECT 1 is the cheapest "is the pool alive?" probe; Prisma's
    // $queryRaw avoids any model-level overhead.
    await prisma.$queryRaw`SELECT 1`;
    return NextResponse.json(
      {
        status: "ok",
        checks: { db: "ok" },
        elapsedMs: Date.now() - startedAt,
      },
      {
        // No caching — monitors always want a fresh probe.
        headers: { "cache-control": "no-store" },
      }
    );
  } catch (err) {
    return NextResponse.json(
      {
        status: "degraded",
        checks: {
          db: err instanceof Error ? `error: ${err.message}` : "error",
        },
        elapsedMs: Date.now() - startedAt,
      },
      {
        status: 503,
        headers: { "cache-control": "no-store" },
      }
    );
  }
}

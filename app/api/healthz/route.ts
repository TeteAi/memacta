import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { isConfigured as isEmailConfigured } from "@/lib/email/client";
import { isConfigured as isRedisConfigured } from "@/lib/rate-limit";
import { isConfigured as isStorageConfigured } from "@/lib/storage/client";

// Health-check endpoint for uptime monitors (Vercel, UptimeRobot,
// Better Stack, etc.). Returns 200 when all enabled integrations are healthy;
// 503 otherwise so a monitor can page on real outages.
//
// Probes: DB (SELECT 1), Redis (ping), Resend (key present), Supabase Storage (bucket exists)
// Not all integrations must be configured — only misconfiguration or unreachability fails the probe.

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type CheckResult = "ok" | "not_configured" | string;

async function checkDb(): Promise<CheckResult> {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return "ok";
  } catch (e) {
    return e instanceof Error ? `error: ${e.message}` : "error";
  }
}

async function checkRedis(): Promise<CheckResult> {
  if (!isRedisConfigured()) return "not_configured";
  try {
    const { Redis } = await import("@upstash/redis");
    const redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL!,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    });
    await redis.ping();
    return "ok";
  } catch (e) {
    return e instanceof Error ? `error: ${e.message}` : "error";
  }
}

async function checkResend(): Promise<CheckResult> {
  if (!isEmailConfigured()) return "not_configured";
  // Just check API key presence — a real send check would spam / cost money.
  return "ok";
}

async function checkStorage(): Promise<CheckResult> {
  if (!isStorageConfigured()) return "not_configured";
  try {
    const { getStorageClient, PERSONA_PHOTOS_BUCKET, GENERATIONS_BUCKET } = await import(
      "@/lib/storage/client"
    );
    const client = getStorageClient();
    if (!client) return "not_configured";

    // List buckets — will error if credentials are wrong.
    const { data, error } = await client.storage.listBuckets();
    if (error) return `error: ${error.message}`;

    const bucketIds = (data ?? []).map((b: { id: string }) => b.id);
    const missingBuckets = [PERSONA_PHOTOS_BUCKET, GENERATIONS_BUCKET].filter(
      (b) => !bucketIds.includes(b)
    );
    if (missingBuckets.length > 0) {
      return `buckets_missing: ${missingBuckets.join(", ")}`;
    }
    return "ok";
  } catch (e) {
    return e instanceof Error ? `error: ${e.message}` : "error";
  }
}

export async function GET() {
  const startedAt = Date.now();

  const [db, redis, resend, storage] = await Promise.all([
    checkDb(),
    checkRedis(),
    checkResend(),
    checkStorage(),
  ]);

  const checks = { db, redis, resend, storage };

  // Degraded if any configured integration is not "ok"
  const degraded = Object.values(checks).some(
    (v) => v !== "ok" && v !== "not_configured"
  );

  if (degraded) {
    return NextResponse.json(
      { status: "degraded", checks, elapsedMs: Date.now() - startedAt },
      { status: 503, headers: { "cache-control": "no-store" } }
    );
  }

  return NextResponse.json(
    { status: "ok", checks, elapsedMs: Date.now() - startedAt },
    { headers: { "cache-control": "no-store" } }
  );
}

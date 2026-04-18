import { NextResponse } from "next/server";
import { sign } from "@/lib/persona/webhook-token";

/**
 * POST /api/test/persona-webhook-token
 *
 * Test-only helper that mints a valid HS256 webhook token for the given
 * personaId + jobId. Used by E2E tests to exercise the TRAINING → PREMIUM_READY
 * webhook flow without needing a real fal.ai training job.
 *
 * Blocked in production (returns 404).
 */
export async function POST(req: Request) {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  let body: { personaId?: string; jobId?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const { personaId, jobId } = body;
  if (!personaId || !jobId) {
    return NextResponse.json({ error: "missing_params" }, { status: 400 });
  }

  const token = sign({ personaId, jobId });
  return NextResponse.json({ token });
}

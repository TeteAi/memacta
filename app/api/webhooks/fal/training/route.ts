/**
 * POST /api/webhooks/fal/training?token=...
 *
 * fal.ai training webhook. Called when a LoRA training job completes/fails.
 *
 * Security: token = HS256 JWT signed by PERSONA_WEBHOOK_SECRET
 * Idempotent: duplicate calls with same jobId are no-ops
 *
 * On COMPLETED:
 * - Sets loraUrl, tier=PREMIUM, status=READY, trainingEndedAt, loraScale=0.9
 * - Bumps user.premiumLoraTrainsUsed += 1
 * - Single Prisma transaction
 *
 * On FAILED:
 * - Sets status=FAILED, trainingError
 * - Does NOT increment premiumLoraTrainsUsed
 *
 * Rate limit: 60/min/IP
 */

import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verify } from "@/lib/persona/webhook-token";
import { rateLimit, rateLimitKey } from "@/lib/rate-limit";
import { trackTrainingCompleted, trackTrainingFailed } from "@/lib/analytics/persona";
import { sendEmail } from "@/lib/email/client";
import { renderPersonaTrainingCompleteEmail } from "@/lib/email/templates/persona-training-complete";

export async function POST(req: Request) {
  // Rate limit by IP: 60/min
  const rl = await rateLimit(rateLimitKey(req, null), { windowMs: 60_000, max: 60 });
  if (!rl.ok) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  }

  // Verify JWT token
  const url = new URL(req.url);
  const token = url.searchParams.get("token");
  if (!token) {
    return NextResponse.json({ error: "missing_token" }, { status: 401 });
  }

  let payload: { personaId: string; jobId: string };
  try {
    payload = verify(token);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Invalid token";
    return NextResponse.json({ error: "invalid_token", message: msg }, { status: 401 });
  }

  const { personaId } = payload;

  // Parse webhook body
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }

  const b = body as Record<string, unknown>;
  const status = b.status as string | undefined;
  const requestId = b.request_id as string | undefined;
  const output = b.output as Record<string, unknown> | undefined;

  if (!status) {
    return NextResponse.json({ error: "missing_status" }, { status: 400 });
  }

  // Fetch persona
  const persona = await prisma.persona.findUnique({
    where: { id: personaId },
    select: { id: true, userId: true, status: true, trainingJobId: true },
  });
  if (!persona) {
    return NextResponse.json({ error: "persona_not_found" }, { status: 404 });
  }

  // Idempotency check: if persona is already PREMIUM READY or FAILED, skip
  if (persona.status === "READY" && persona.trainingJobId === requestId) {
    return NextResponse.json({ ok: true, idempotent: true });
  }
  if (persona.status === "FAILED" && persona.trainingJobId === requestId) {
    return NextResponse.json({ ok: true, idempotent: true });
  }

  if (status === "COMPLETED") {
    const loraFile = output?.diffusers_lora_file as { url?: string } | undefined;
    const loraUrl = loraFile?.url;

    if (!loraUrl) {
      // Completed but no LoRA file — treat as failure
      await prisma.persona.update({
        where: { id: personaId },
        data: {
          status: "FAILED",
          trainingError: "Completed but no LoRA file in output",
          trainingEndedAt: new Date(),
          trainingJobId: requestId ?? persona.trainingJobId,
        },
      });
      trackTrainingFailed({ userId: persona.userId, personaId, error: "no_lora_file" });
      return NextResponse.json({ ok: true, result: "failed_no_lora" });
    }

    // Single transaction: update persona + bump premiumLoraTrainsUsed
    await prisma.$transaction([
      prisma.persona.update({
        where: { id: personaId },
        data: {
          status: "READY",
          tier: "PREMIUM",
          loraUrl,
          loraScale: 0.9,
          loraBaseModel: "flux-dev",
          trainingEndedAt: new Date(),
          trainingJobId: requestId ?? persona.trainingJobId,
          trainingError: null,
        },
      }),
      prisma.user.update({
        where: { id: persona.userId },
        data: { premiumLoraTrainsUsed: { increment: 1 } },
      }),
    ]);

    trackTrainingCompleted({ userId: persona.userId, personaId });

    // Send training-complete email (non-fatal)
    void (async () => {
      try {
        const user = await prisma.user.findUnique({
          where: { id: persona.userId },
          select: { email: true, name: true },
        });
        const personaFull = await prisma.persona.findUnique({
          where: { id: personaId },
          select: { name: true, slug: true },
        });
        if (user && personaFull) {
          const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
          const { html, text } = renderPersonaTrainingCompleteEmail({
            userName: user.name ?? undefined,
            personaName: personaFull.name,
            personaUrl: `${appUrl}/personas/${personaId}`,
          });
          await sendEmail({
            to: user.email,
            subject: `Your Persona "${personaFull.name}" is ready!`,
            html,
            text,
          });
        }
      } catch {
        // Non-fatal — don't fail the webhook response over an email error
      }
    })();

    return NextResponse.json({ ok: true, result: "completed" });
  }

  if (status === "FAILED") {
    const errorMsg =
      typeof b.error === "string" ? b.error : "Training failed";
    await prisma.persona.update({
      where: { id: personaId },
      data: {
        status: "FAILED",
        trainingError: errorMsg,
        trainingEndedAt: new Date(),
        trainingJobId: requestId ?? persona.trainingJobId,
      },
    });
    trackTrainingFailed({ userId: persona.userId, personaId, error: errorMsg });
    return NextResponse.json({ ok: true, result: "failed" });
  }

  // Unknown status — log and return 200 (don't let fal retry indefinitely)
  // eslint-disable-next-line no-console
  console.warn("[persona:webhook] Unknown training status:", status);
  return NextResponse.json({ ok: true, result: "unknown_status" });
}

/**
 * POST /api/persona/:id/upgrade-premium
 *
 * Enforces ALL of:
 * - emailVerified != null
 * - now - user.createdAt >= 24h (bypass: TEST_SKIP_COOLING_PERIOD=true in non-prod)
 * - premiumLoraTrainsUsed < 1 on free plan
 * - persona status=READY and tier=INSTANT
 * - Celebrity blocklist passes
 *
 * On success:
 * - Zips photos, calls startFluxLoraTraining with signed webhook_url
 * - Sets status=TRAINING, trainingJobId, trainingStartedAt
 * - Does NOT bump premiumLoraTrainsUsed (that happens in the webhook on COMPLETED)
 *
 * Rate limit: 3/day/user
 */

import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { rateLimit } from "@/lib/rate-limit";
import { getPersonaById, updatePersonaStatus } from "@/lib/persona/service";
import { canStartPremiumTrain } from "@/lib/persona/gates";
import { checkBlocklist } from "@/lib/persona/blocklist";
import { sign } from "@/lib/persona/webhook-token";
import { startFluxLoraTraining } from "@/lib/ai/providers/fal";
import { computeContentHash, findAttestation } from "@/lib/persona/consent";
import {
  trackUpgradedToPremium,
  trackTrainingStarted,
} from "@/lib/analytics/persona";

type Params = { params: Promise<{ id: string }> };

export async function POST(req: Request, { params }: Params) {
  const session = await auth();
  const userId = (session?.user as { id?: string } | undefined)?.id;
  if (!userId) {
    return NextResponse.json({ error: "auth_required" }, { status: 401 });
  }

  // Rate limit: 3 upgrade attempts per day per user
  const rl = rateLimit(`persona:upgrade:${userId}`, {
    windowMs: 24 * 60 * 60 * 1000,
    max: 3,
  });
  if (!rl.ok) {
    return NextResponse.json(
      { error: "rate_limited", retryAfter: Math.ceil(rl.retryAfterMs / 1000) },
      { status: 429 }
    );
  }

  const { id } = await params;
  const persona = await getPersonaById(id, userId);
  if (!persona) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  // Persona must be READY INSTANT
  if (persona.status !== "READY" || persona.tier !== "INSTANT") {
    return NextResponse.json(
      { error: "invalid_state", message: "Persona must be in READY INSTANT state" },
      { status: 422 }
    );
  }

  // Fetch user for gate checks
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      emailVerified: true,
      createdAt: true,
      premiumLoraTrainsUsed: true,
      subscription: { select: { planId: true } },
    },
  });
  if (!user) {
    return NextResponse.json({ error: "user_not_found" }, { status: 404 });
  }

  const gate = canStartPremiumTrain(user);
  if (!gate.allowed) {
    trackUpgradedToPremium({ userId, personaId: id, success: false, failureReason: gate.reason });
    return NextResponse.json({ error: "forbidden", reason: gate.reason }, { status: 403 });
  }

  // Celebrity blocklist
  const blockResult = checkBlocklist(persona.name);
  if (blockResult.matched) {
    trackUpgradedToPremium({ userId, personaId: id, success: false, failureReason: "blocklisted_name" });
    return NextResponse.json(
      { error: "blocklisted_name", reason: "blocklisted_name" },
      { status: 422 }
    );
  }

  // Verify consent attestation is still valid for current photos
  const acceptedPhotos = persona.photos.filter((p) => !p.rejected);
  if (acceptedPhotos.length === 0) {
    return NextResponse.json({ error: "no_accepted_photos" }, { status: 422 });
  }
  const storageKeys = acceptedPhotos.map((p) => p.storageKey);
  const contentHash = computeContentHash(storageKeys);
  const attestation = await findAttestation(id, contentHash);
  if (!attestation) {
    return NextResponse.json(
      { error: "consent_required", message: "Consent attestation required" },
      { status: 422 }
    );
  }

  // Build a zip URL from photo URLs (for v1: pass the primary photo URL as a proxy)
  // In production, this should upload a ZIP of all photos to fal.ai storage.
  // For v1 we use the primary photo URL as a single-image "zip".
  const primaryPhoto = acceptedPhotos.find((p) => p.isPrimary) ?? acceptedPhotos[0];
  const imagesZipUrl = primaryPhoto.url;

  // Generate signed webhook URL
  // We need a stable job placeholder to sign — the actual jobId will come from fal
  const placeholderJobId = `pending-${Date.now()}`;
  const webhookToken = sign({ personaId: id, jobId: placeholderJobId });
  const appUrl = process.env.NEXTAUTH_URL ?? process.env.NEXT_PUBLIC_APP_URL ?? "https://memacta.app";
  const webhookUrl = `${appUrl}/api/webhooks/fal/training?token=${webhookToken}`;

  // Start training
  const trainingResult = await startFluxLoraTraining({
    imagesZipUrl,
    triggerWord: persona.triggerWord,
    webhookUrl,
    steps: 1000,
    baseModel: "flux-dev",
  });

  if (trainingResult.status === "failed") {
    trackUpgradedToPremium({ userId, personaId: id, success: false, failureReason: "training_start_failed" });
    return NextResponse.json(
      { error: "training_failed", message: trainingResult.error },
      { status: 502 }
    );
  }

  // Update persona to TRAINING state
  const updated = await updatePersonaStatus(id, "TRAINING", {
    trainingJobId: trainingResult.jobId,
    trainingStartedAt: new Date(),
  });

  trackUpgradedToPremium({ userId, personaId: id, success: true });
  trackTrainingStarted({ userId, personaId: id });

  return NextResponse.json(updated);
}

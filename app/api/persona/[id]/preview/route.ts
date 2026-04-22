/**
 * POST /api/persona/:id/preview
 *
 * Generates up to 4 PuLID samples using the primary photo.
 * Debits 1 credit per image (4 total).
 * Fails closed on insufficient credits.
 *
 * Rate limit: 10/hr/user
 */

import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { rateLimit } from "@/lib/rate-limit";
import { getPersonaById } from "@/lib/persona/service";
import { createFluxPulidGeneration } from "@/lib/ai/providers/fal";
import { trackInstantPreviewGenerated } from "@/lib/analytics/persona";
import {
  PERSONA_PREVIEW_COUNT,
  PERSONA_INSTANT_CREDIT,
  PERSONA_PREVIEW_TOTAL,
} from "@/lib/credits";

type Params = { params: Promise<{ id: string }> };

const PREVIEW_COUNT = PERSONA_PREVIEW_COUNT;
const CREDIT_PER_IMAGE = PERSONA_INSTANT_CREDIT;
const TOTAL_COST = PERSONA_PREVIEW_TOTAL;

const PREVIEW_PROMPTS = [
  "professional portrait, sharp focus, studio lighting, photorealistic",
  "cinematic portrait, dramatic lighting, film grain, high detail",
  "outdoor portrait, natural light, bokeh background, vibrant",
  "artistic portrait, editorial style, creative composition, fashion",
];

export async function POST(_req: Request, { params }: Params) {
  const session = await auth();
  const userId = (session?.user as { id?: string } | undefined)?.id;
  if (!userId) {
    return NextResponse.json({ error: "auth_required" }, { status: 401 });
  }

  const rl = await rateLimit(`persona:preview:${userId}`, { windowMs: 60 * 60 * 1000, max: 10 });
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

  if (!persona.primaryPhotoUrl) {
    return NextResponse.json(
      { error: "no_primary_photo", message: "Finalize the persona first" },
      { status: 422 }
    );
  }

  // Check and deduct credits (fail closed)
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { credits: true },
  });
  if (!user) {
    return NextResponse.json({ error: "user_not_found" }, { status: 404 });
  }
  if (user.credits < TOTAL_COST) {
    return NextResponse.json(
      { error: "insufficient_credits", required: TOTAL_COST, balance: user.credits },
      { status: 402 }
    );
  }

  // Deduct credits before generation
  await prisma.user.update({
    where: { id: userId },
    data: { credits: { decrement: TOTAL_COST } },
  });

  // Generate previews in parallel
  const results = await Promise.all(
    PREVIEW_PROMPTS.map((prompt) =>
      createFluxPulidGeneration({
        referenceImageUrl: persona.primaryPhotoUrl!,
        prompt,
        width: 1024,
        height: 1024,
      })
    )
  );

  const succeeded = results.filter((r) => r.status === "succeeded");
  const failed = results.length - succeeded.length;

  // Refund credits for failed generations
  if (failed > 0) {
    await prisma.user.update({
      where: { id: userId },
      data: { credits: { increment: failed * CREDIT_PER_IMAGE } },
    });
  }

  trackInstantPreviewGenerated({ userId, personaId: id });

  return NextResponse.json({
    previews: succeeded.map((r) => ({ url: r.url })),
    failed,
  });
}

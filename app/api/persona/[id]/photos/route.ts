/**
 * POST /api/persona/:id/photos
 *
 * Accepts a photo URL (already uploaded to storage), runs createFaceDetect,
 * validates age/NSFW/face-count, and persists a PersonaPhoto record.
 *
 * Constraints:
 * - Max 5 photos per persona
 * - Exactly 1 face per photo (faceCount != 1 -> 422)
 * - Age >= 18 (ageEstimate < 18 -> 422 with reason:'minor')
 * - NSFW score <= 0.6 (nsfwScore > 0.6 -> 422)
 * - Rejected photos stored with rejected=true for audit
 *
 * Rate limit: 30/hr/user
 */

import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { rateLimit } from "@/lib/rate-limit";
import { createFaceDetect } from "@/lib/ai/providers/fal";
import { getPersonaById } from "@/lib/persona/service";

type Params = { params: Promise<{ id: string }> };

const Body = z.object({
  url: z.string().url(),
  storageKey: z.string().min(1),
});

const MAX_PHOTOS = 5;
const MAX_NSFW_SCORE = 0.6;
const MIN_AGE = 18;

export async function POST(req: Request, { params }: Params) {
  const session = await auth();
  const userId = (session?.user as { id?: string } | undefined)?.id;
  if (!userId) {
    return NextResponse.json({ error: "auth_required" }, { status: 401 });
  }

  const rl = rateLimit(`persona:photos:${userId}`, { windowMs: 60 * 60 * 1000, max: 30 });
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

  // Check photo count
  const existingCount = persona.photos.filter((p) => !p.rejected).length;
  if (existingCount >= MAX_PHOTOS) {
    return NextResponse.json(
      { error: "too_many_photos", message: `Maximum ${MAX_PHOTOS} photos allowed` },
      { status: 422 }
    );
  }

  let body: z.infer<typeof Body>;
  try {
    const json = await req.json();
    const parsed = Body.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json({ error: "invalid", details: parsed.error.flatten() }, { status: 400 });
    }
    body = parsed.data;
  } catch {
    return NextResponse.json({ error: "invalid" }, { status: 400 });
  }

  // Run face detection
  const faceResult = await createFaceDetect({ imageUrl: body.url });

  // Determine rejection reason
  let rejected = false;
  let rejectReason: string | null = null;

  if (faceResult.faceCount !== 1) {
    rejected = true;
    rejectReason = faceResult.faceCount === 0 ? "no_face_detected" : "multiple_faces";
  } else if (
    typeof faceResult.ageEstimate === "number" &&
    faceResult.ageEstimate < MIN_AGE
  ) {
    rejected = true;
    rejectReason = "minor";
  } else if (
    typeof faceResult.nsfwScore === "number" &&
    faceResult.nsfwScore > MAX_NSFW_SCORE
  ) {
    rejected = true;
    rejectReason = "nsfw";
  }

  // Determine if this is the primary photo
  const isPrimary = !rejected && existingCount === 0;

  // Persist the photo (even rejected ones for audit)
  const photo = await prisma.personaPhoto.create({
    data: {
      personaId: id,
      url: body.url,
      storageKey: body.storageKey,
      isPrimary,
      faceBbox: faceResult.primaryBbox ? JSON.parse(JSON.stringify(faceResult.primaryBbox)) : undefined,
      faceScore: faceResult.primaryScore ?? null,
      ageEstimate: faceResult.ageEstimate ?? null,
      nsfwScore: faceResult.nsfwScore ?? null,
      rejected,
      rejectReason,
    },
  });

  if (rejected) {
    return NextResponse.json(
      { error: "photo_rejected", reason: rejectReason, photo },
      { status: 422 }
    );
  }

  return NextResponse.json({ photo, isPrimary }, { status: 201 });
}

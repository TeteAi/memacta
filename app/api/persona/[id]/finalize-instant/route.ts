/**
 * POST /api/persona/:id/finalize-instant
 *
 * Requirements (from spec):
 * (a) A primary non-rejected photo exists
 * (b) A valid ConsentAttestation exists matching current contentHash
 * (c) emailVerified != null
 * (d) Celebrity blocklist passes
 *
 * On success: sets status=READY, primaryPhotoUrl, coverImageUrl
 */

import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { getPersonaById, updatePersonaStatus } from "@/lib/persona/service";
import { computeContentHash, findAttestation } from "@/lib/persona/consent";
import { checkBlocklist } from "@/lib/persona/blocklist";

type Params = { params: Promise<{ id: string }> };

export async function POST(_req: Request, { params }: Params) {
  const session = await auth();
  const userId = (session?.user as { id?: string } | undefined)?.id;
  if (!userId) {
    return NextResponse.json({ error: "auth_required" }, { status: 401 });
  }

  const { id } = await params;
  const persona = await getPersonaById(id, userId);
  if (!persona) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  // (c) Email verified
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { emailVerified: true },
  });
  if (!user?.emailVerified) {
    return NextResponse.json({ error: "forbidden", reason: "email_unverified" }, { status: 403 });
  }

  // (a) Primary non-rejected photo
  const primaryPhoto = persona.photos.find((p) => p.isPrimary && !p.rejected);
  if (!primaryPhoto) {
    return NextResponse.json(
      { error: "no_primary_photo", message: "Upload at least one accepted photo" },
      { status: 422 }
    );
  }

  // (b) Valid consent attestation
  const acceptedPhotos = persona.photos.filter((p) => !p.rejected);
  const storageKeys = acceptedPhotos.map((p) => p.storageKey);

  if (storageKeys.length === 0) {
    return NextResponse.json({ error: "no_accepted_photos" }, { status: 422 });
  }

  const contentHash = computeContentHash(storageKeys);
  const attestation = await findAttestation(id, contentHash);
  if (!attestation) {
    return NextResponse.json(
      { error: "consent_required", message: "A valid consent attestation is required" },
      { status: 422 }
    );
  }

  // (d) Celebrity blocklist
  const blockResult = checkBlocklist(persona.name);
  if (blockResult.matched) {
    await updatePersonaStatus(id, "DRAFT", { celebrityFlag: true });
    return NextResponse.json(
      { error: "blocklisted_name", reason: "blocklisted_name", offendingName: blockResult.offendingName },
      { status: 422 }
    );
  }

  // Set status READY
  const updated = await updatePersonaStatus(id, "READY", {
    primaryPhotoUrl: primaryPhoto.url,
    coverImageUrl: primaryPhoto.url,
  });

  return NextResponse.json(updated);
}

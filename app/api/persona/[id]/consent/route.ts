/**
 * POST /api/persona/:id/consent
 *
 * Persists a consent attestation for the persona's current set of photos.
 * Must be called BEFORE finalize-instant or upgrade-premium.
 */

import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { getPersonaById } from "@/lib/persona/service";
import { persistAttestation, CONSENT_STATEMENT_VERSION } from "@/lib/persona/consent";

type Params = { params: Promise<{ id: string }> };

export async function POST(req: Request, { params }: Params) {
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

  const acceptedPhotos = persona.photos.filter((p) => !p.rejected);
  if (acceptedPhotos.length === 0) {
    return NextResponse.json({ error: "no_accepted_photos" }, { status: 422 });
  }

  const storageKeys = acceptedPhotos.map((p) => p.storageKey);

  const ipAddress =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    req.headers.get("x-real-ip") ??
    "unknown";
  const userAgent = req.headers.get("user-agent") ?? "unknown";

  const { attestation, contentHash } = await persistAttestation({
    userId,
    personaId: id,
    storageKeys,
    statementVersion: CONSENT_STATEMENT_VERSION,
    ipAddress,
    userAgent,
  });

  return NextResponse.json({ attestation, contentHash }, { status: 201 });
}

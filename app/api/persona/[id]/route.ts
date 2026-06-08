/**
 * GET    /api/persona/:id  — Get a single Persona
 * DELETE /api/persona/:id  — Delete a Persona (cascade photos, SetNull generations)
 */

import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getPersonaById, deletePersona } from "@/lib/persona/service";
import { deletePersonaPhotos } from "@/lib/storage/upload";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: Params) {
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

  return NextResponse.json(persona);
}

export async function DELETE(_req: Request, { params }: Params) {
  const session = await auth();
  const userId = (session?.user as { id?: string } | undefined)?.id;
  if (!userId) {
    return NextResponse.json({ error: "auth_required" }, { status: 401 });
  }

  const { id } = await params;

  // Verify ownership
  const persona = await getPersonaById(id, userId);
  if (!persona) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  const { deletedStorageKeys } = await deletePersona(id, userId);

  // Best-effort storage cleanup. We delete the DB rows first (above), so even
  // if storage deletion errors we still honor the user's request to delete
  // the persona. Orphan files are reconciled by a periodic sweeper (TODO),
  // not blocked on here — refusing to delete the persona because of an S3
  // hiccup would be the wrong tradeoff.
  const removed = await deletePersonaPhotos(deletedStorageKeys);

  return NextResponse.json({
    success: true,
    deletedStorageKeys,
    storageObjectsRemoved: removed,
  });
}

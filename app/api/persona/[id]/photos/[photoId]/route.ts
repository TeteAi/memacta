/**
 * DELETE /api/persona/:id/photos/:photoId
 */

import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";

type Params = { params: Promise<{ id: string; photoId: string }> };

export async function DELETE(_req: Request, { params }: Params) {
  const session = await auth();
  const userId = (session?.user as { id?: string } | undefined)?.id;
  if (!userId) {
    return NextResponse.json({ error: "auth_required" }, { status: 401 });
  }

  const { id, photoId } = await params;

  // Verify persona ownership
  const persona = await prisma.persona.findFirst({
    where: { id, userId },
    select: { id: true },
  });
  if (!persona) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  // Verify photo belongs to this persona
  const photo = await prisma.personaPhoto.findFirst({
    where: { id: photoId, personaId: id },
    select: { id: true, storageKey: true, isPrimary: true },
  });
  if (!photo) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  await prisma.personaPhoto.delete({ where: { id: photoId } });

  // If the deleted photo was primary, promote the next accepted photo
  if (photo.isPrimary) {
    const next = await prisma.personaPhoto.findFirst({
      where: { personaId: id, rejected: false },
      orderBy: { createdAt: "asc" },
    });
    if (next) {
      await prisma.personaPhoto.update({ where: { id: next.id }, data: { isPrimary: true } });
    }
  }

  // TODO: queue storageKey for deletion at the storage provider
  return NextResponse.json({ success: true, storageKey: photo.storageKey });
}

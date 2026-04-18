/**
 * POST /api/persona/:id/takedown
 *
 * Archives a Persona (soft delete) for content removal requests.
 * Sets archivedAt timestamp.
 */

import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";

type Params = { params: Promise<{ id: string }> };

export async function POST(_req: Request, { params }: Params) {
  const session = await auth();
  const userId = (session?.user as { id?: string } | undefined)?.id;
  if (!userId) {
    return NextResponse.json({ error: "auth_required" }, { status: 401 });
  }

  const { id } = await params;

  const persona = await prisma.persona.findFirst({
    where: { id, userId },
    select: { id: true, archivedAt: true },
  });
  if (!persona) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  const updated = await prisma.persona.update({
    where: { id },
    data: { archivedAt: new Date() },
  });

  // eslint-disable-next-line no-console
  console.log(JSON.stringify({ event: "persona.takedown", personaId: id, userId }));

  return NextResponse.json({ success: true, archivedAt: updated.archivedAt });
}

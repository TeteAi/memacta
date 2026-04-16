import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { isAdminEmail } from "@/lib/admin";

// Admin-only message status update. Gated by ADMIN_EMAILS; returns 404
// for everyone else so we don't advertise that the route exists.

const Body = z.object({
  status: z.enum(["new", "read", "handled", "spam"]),
});

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  const email = session?.user?.email ?? null;
  if (!isAdminEmail(email)) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid" }, { status: 400 });
  }
  const parsed = Body.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid" }, { status: 400 });
  }

  const { id } = await params;

  try {
    await prisma.contactMessage.update({
      where: { id },
      data: { status: parsed.data.status },
    });
  } catch {
    // Unknown id / already deleted — 404 so the UI falls back cleanly.
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}

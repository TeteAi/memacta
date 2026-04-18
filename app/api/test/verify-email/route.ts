/**
 * POST /api/test/verify-email
 *
 * Test-only route to mark a user's email as verified.
 * ONLY available when NODE_ENV !== 'production'.
 * Used by E2E tests (Playwright) to unblock Persona creation gates.
 */

import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(req: Request) {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid" }, { status: 400 });
  }

  const { email } = body as Record<string, unknown>;
  if (typeof email !== "string" || !email) {
    return NextResponse.json({ error: "email_required" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { email }, select: { id: true } });
  if (!user) {
    return NextResponse.json({ error: "user_not_found" }, { status: 404 });
  }

  await prisma.user.update({
    where: { email },
    data: { emailVerified: new Date() },
  });

  return NextResponse.json({ ok: true, email });
}

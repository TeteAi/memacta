/**
 * POST /api/auth/reset-password
 *
 * Accepts { token, password } — validates the PasswordResetToken,
 * updates the user's password hash (bcrypt, matching existing convention),
 * marks the token used.
 */

import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";

export const dynamic = "force-dynamic";

const Body = z.object({
  token: z.string().min(1),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_request" }, { status: 400 });
  }

  const parsed = Body.safeParse(body);
  if (!parsed.success) {
    const msg = parsed.error.issues[0]?.message ?? "invalid_request";
    return NextResponse.json({ error: msg }, { status: 400 });
  }

  const { token, password } = parsed.data;

  const record = await prisma.passwordResetToken.findUnique({ where: { token } });

  if (!record) {
    return NextResponse.json({ error: "invalid_token" }, { status: 400 });
  }

  if (record.usedAt) {
    return NextResponse.json({ error: "token_already_used" }, { status: 400 });
  }

  if (record.expiresAt < new Date()) {
    return NextResponse.json({ error: "token_expired" }, { status: 400 });
  }

  const hashedPassword = await bcrypt.hash(password, 12);

  await prisma.$transaction([
    prisma.passwordResetToken.update({
      where: { id: record.id },
      data: { usedAt: new Date() },
    }),
    prisma.user.update({
      where: { id: record.userId },
      data: { password: hashedPassword },
    }),
  ]);

  return NextResponse.json({ ok: true });
}

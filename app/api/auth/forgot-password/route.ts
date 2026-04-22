/**
 * POST /api/auth/forgot-password
 *
 * Accepts { email } and always returns 200 (don't leak whether email exists).
 * When the user exists, creates a PasswordResetToken and sends the reset email.
 */

import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { sendEmail } from "@/lib/email/client";
import { renderPasswordResetEmail } from "@/lib/email/templates/password-reset";
import crypto from "crypto";

export const dynamic = "force-dynamic";

const Body = z.object({
  email: z.string().email(),
});

const TOKEN_EXPIRY_HOURS = 2;

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: true }); // Don't reveal validation errors
  }

  const parsed = Body.safeParse(body);
  if (!parsed.success) {
    // Always 200 to prevent email enumeration
    return NextResponse.json({ ok: true });
  }

  const { email } = parsed.data;

  // Fire and forget — don't await so timing attacks can't probe existence
  void (async () => {
    try {
      const user = await prisma.user.findUnique({
        where: { email },
        select: { id: true, name: true, email: true },
      });

      if (!user) return; // Silently drop — no such user

      // Invalidate any existing unused tokens for this user
      await prisma.passwordResetToken.updateMany({
        where: { userId: user.id, usedAt: null },
        data: { usedAt: new Date() },
      });

      const token = crypto.randomBytes(32).toString("hex");
      const expiresAt = new Date(Date.now() + TOKEN_EXPIRY_HOURS * 60 * 60 * 1000);

      await prisma.passwordResetToken.create({
        data: { userId: user.id, token, expiresAt },
      });

      const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
      const resetUrl = `${appUrl}/auth/reset?token=${token}`;

      const { html, text } = renderPasswordResetEmail({
        userName: user.name ?? undefined,
        resetUrl,
        expiresInHours: TOKEN_EXPIRY_HOURS,
      });

      await sendEmail({
        to: user.email,
        subject: "Reset your memacta password",
        html,
        text,
      });
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error("[forgot-password] error:", e instanceof Error ? e.message : String(e));
    }
  })();

  return NextResponse.json({ ok: true });
}

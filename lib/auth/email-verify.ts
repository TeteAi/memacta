/**
 * Helpers for the email-verification flow.
 *
 * generateVerificationToken  — creates an EmailVerificationToken in the DB
 * sendVerificationEmail      — sends the verification email (wraps email client)
 */

import crypto from "crypto";
import { prisma } from "@/lib/db";
import { sendEmail } from "@/lib/email/client";
import { renderVerificationEmail } from "@/lib/email/templates/verification";

const TOKEN_EXPIRY_HOURS = 24;

export async function generateVerificationToken(userId: string): Promise<string> {
  // Invalidate any existing unused tokens
  await prisma.emailVerificationToken.updateMany({
    where: { userId, usedAt: null },
    data: { usedAt: new Date() },
  });

  const token = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + TOKEN_EXPIRY_HOURS * 60 * 60 * 1000);

  await prisma.emailVerificationToken.create({
    data: { userId, token, expiresAt },
  });

  return token;
}

export async function sendVerificationEmail(opts: {
  userId: string;
  email: string;
  name?: string | null;
}): Promise<void> {
  const token = await generateVerificationToken(opts.userId);
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const verifyUrl = `${appUrl}/api/auth/verify-email?token=${token}`;

  const { html, text } = renderVerificationEmail({
    userName: opts.name ?? undefined,
    verifyUrl,
    expiresInHours: TOKEN_EXPIRY_HOURS,
  });

  await sendEmail({
    to: opts.email,
    subject: "Verify your memacta email",
    html,
    text,
  });
}

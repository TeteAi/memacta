/**
 * GET /api/auth/verify-email?token=...
 *
 * Consumes an EmailVerificationToken, sets User.emailVerified, sends
 * a welcome email, and redirects to the dashboard.
 */

import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { sendEmail } from "@/lib/email/client";
import { renderWelcomeEmail } from "@/lib/email/templates/welcome";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const token = url.searchParams.get("token");
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  if (!token) {
    return NextResponse.redirect(`${appUrl}/auth/signin?error=invalid_token`);
  }

  const record = await prisma.emailVerificationToken.findUnique({
    where: { token },
    include: { user: { select: { id: true, name: true, email: true, emailVerified: true } } },
  });

  if (!record) {
    return NextResponse.redirect(`${appUrl}/auth/signin?error=invalid_token`);
  }

  if (record.usedAt) {
    return NextResponse.redirect(`${appUrl}/auth/signin?error=token_already_used`);
  }

  if (record.expiresAt < new Date()) {
    return NextResponse.redirect(`${appUrl}/auth/signin?error=token_expired`);
  }

  // Mark token used + set emailVerified atomically
  await prisma.$transaction([
    prisma.emailVerificationToken.update({
      where: { id: record.id },
      data: { usedAt: new Date() },
    }),
    prisma.user.update({
      where: { id: record.userId },
      data: { emailVerified: new Date() },
    }),
  ]);

  // Send welcome email (non-fatal)
  if (!record.user.emailVerified) {
    const { html, text } = renderWelcomeEmail({
      userName: record.user.name ?? undefined,
      dashboardUrl: `${appUrl}/persona`,
    });
    await sendEmail({
      to: record.user.email,
      subject: "Welcome to memacta!",
      html,
      text,
    }).catch(() => {/* non-fatal */});
  }

  return NextResponse.redirect(`${appUrl}/persona?verified=1`);
}

/**
 * POST /api/test/seed-credits
 *
 * Test-only route to grant credits to the currently authenticated user.
 * ONLY available when NODE_ENV !== 'production'.
 * Used by E2E tests (Playwright) to prevent 402 insufficient_credits during T4–T8.
 */

import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "unauth" }, { status: 401 });
  }

  let body: Record<string, unknown> = {};
  try {
    body = await req.json();
  } catch {
    // empty body is fine — default amount used below
  }

  const amount = Number(body.amount ?? 100);
  if (!Number.isFinite(amount) || amount < 0 || amount > 100000) {
    return NextResponse.json({ error: "bad_amount" }, { status: 400 });
  }

  await prisma.user.update({
    where: { id: session.user.id },
    data: { credits: { increment: amount } },
  });

  return NextResponse.json({ ok: true, granted: amount });
}

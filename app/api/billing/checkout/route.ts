import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";

const Body = z.object({
  packageId: z.string().min(1),
});

export async function POST(req: Request) {
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

  const session = await auth();
  const userId = (session?.user as { id?: string } | undefined)?.id;
  if (!userId) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const pkg = await prisma.creditPackage.findUnique({
    where: { id: parsed.data.packageId },
  });

  if (!pkg) {
    return NextResponse.json({ error: "package not found" }, { status: 404 });
  }

  // Real Stripe integration not yet wired. When STRIPE_SECRET_KEY is set we'd
  // create a Checkout Session here.
  if (process.env.STRIPE_SECRET_KEY) {
    return NextResponse.json(
      {
        error: "billing_not_configured",
        message: "Billing is launching soon. Check back in a few days.",
      },
      { status: 501 }
    );
  }

  // Outside of production / the free-credits stub used to live here and would
  // credit the caller without any payment. That's a farming vector on a
  // public beta, so we only allow it in non-production and only for admins
  // listed in ADMIN_EMAILS. Everyone else sees the same "coming soon"
  // message the Stripe branch returns above — keeps behaviour predictable
  // for testers without leaking the free-credits path.
  const isProd = process.env.NODE_ENV === "production";
  const { isAdminEmail } = await import("@/lib/admin");
  const allowedToStub = !isProd || isAdminEmail(session?.user?.email ?? null);

  if (!allowedToStub) {
    return NextResponse.json(
      {
        error: "billing_coming_soon",
        message: "Credit purchases are launching soon. You still get daily free credits in the meantime.",
      },
      { status: 503 }
    );
  }

  // Stub: directly add credits and record purchase (admin/dev only).
  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: { credits: { increment: pkg.credits } },
  });

  await prisma.purchase.create({
    data: {
      userId,
      packageId: pkg.id,
      credits: pkg.credits,
      amountUsd: pkg.priceUsd,
      status: "completed",
    },
  });

  return NextResponse.json({
    success: true,
    credits: updatedUser.credits,
  });
}

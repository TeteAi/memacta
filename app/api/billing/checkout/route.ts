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

  // Stub mode: no real Stripe integration
  // When STRIPE_SECRET_KEY is set, create a Stripe Checkout Session instead
  if (process.env.STRIPE_SECRET_KEY) {
    // Future: create Stripe checkout session and return URL
    return NextResponse.json({ error: "Stripe integration not yet configured" }, { status: 501 });
  }

  // Stub: directly add credits and record purchase
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

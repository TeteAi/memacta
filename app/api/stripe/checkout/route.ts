import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getPlanById } from "@/lib/credits";

// TODO: import Stripe from "stripe";
// TODO: const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: "2024-06-20" });

export async function POST(req: Request) {
  const session = await auth();
  const userId = (session?.user as { id?: string } | undefined)?.id;

  if (!userId) {
    return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
  }

  let body: { planId?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid" }, { status: 400 });
  }

  const { planId } = body;
  if (!planId) {
    return NextResponse.json({ error: "planId required" }, { status: 400 });
  }

  const plan = getPlanById(planId);
  if (!plan) {
    return NextResponse.json({ error: "unknown plan" }, { status: 400 });
  }

  // TODO: Stripe checkout session creation
  // const checkoutSession = await stripe.checkout.sessions.create({
  //   mode: "subscription",
  //   customer_email: session.user.email ?? undefined,
  //   line_items: [{ price: plan.stripePriceId, quantity: 1 }],
  //   success_url: `${process.env.NEXTAUTH_URL}/pricing?success=true`,
  //   cancel_url: `${process.env.NEXTAUTH_URL}/pricing?canceled=true`,
  //   metadata: { userId, planId },
  // });
  // return NextResponse.json({ url: checkoutSession.url });

  // Stub — return mock URL
  return NextResponse.json({
    url: `/pricing?mock_checkout=true&plan=${planId}`,
    sessionId: `mock_session_${Date.now()}`,
  });
}

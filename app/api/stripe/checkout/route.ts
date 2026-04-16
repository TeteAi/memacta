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

  // TODO: Stripe checkout session creation (subscriptions + topup)
  // const checkoutSession = await stripe.checkout.sessions.create({ ... });
  // return NextResponse.json({ url: checkoutSession.url });

  // Real Stripe isn't wired yet. We intentionally do NOT return a mock URL
  // here — the old stub redirected users to `/pricing?mock_checkout=true`,
  // which looked like a broken checkout and set the wrong expectation. A
  // clean 503 with friendly copy lets the UI show "coming soon" instead.
  return NextResponse.json(
    {
      error: "billing_coming_soon",
      message: "Subscriptions and top-ups are launching soon. You still get daily free credits in the meantime.",
      planId,
    },
    { status: 503 }
  );
}

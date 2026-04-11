import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";

// TODO: import Stripe from "stripe";
// TODO: const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: "2024-06-20" });

export async function POST() {
  const session = await auth();
  const userId = (session?.user as { id?: string } | undefined)?.id;

  if (!userId) {
    return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
  }

  const subscription = await prisma.subscription.findUnique({
    where: { userId },
  });

  if (!subscription?.stripeCustomerId) {
    return NextResponse.json({ error: "no_subscription" }, { status: 400 });
  }

  // TODO: Create Stripe billing portal session
  // const portalSession = await stripe.billingPortal.sessions.create({
  //   customer: subscription.stripeCustomerId,
  //   return_url: `${process.env.NEXTAUTH_URL}/account`,
  // });
  // return NextResponse.json({ url: portalSession.url });

  // Stub
  return NextResponse.json({ url: "/account?mock_portal=true" });
}

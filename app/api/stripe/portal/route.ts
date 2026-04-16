import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { getAppUrl, getStripe, isStripeConfigured } from "@/lib/stripe";

// Billing portal. Gives a subscribed user a one-click link into Stripe's
// hosted portal so they can update their card, cancel, or see invoices —
// without us having to build any of that UI. Requires a stripeCustomerId
// already on their Subscription row (set during checkout).

export async function POST() {
  const session = await auth();
  const userId = (session?.user as { id?: string } | undefined)?.id;

  if (!userId) {
    return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
  }

  if (!isStripeConfigured()) {
    return NextResponse.json(
      {
        error: "billing_coming_soon",
        message: "The billing portal is launching soon.",
      },
      { status: 503 }
    );
  }

  const subscription = await prisma.subscription.findUnique({
    where: { userId },
  });

  if (!subscription?.stripeCustomerId) {
    return NextResponse.json(
      {
        error: "no_subscription",
        message: "You don't have an active subscription to manage.",
      },
      { status: 400 }
    );
  }

  try {
    const stripe = getStripe();
    const portalSession = await stripe.billingPortal.sessions.create({
      customer: subscription.stripeCustomerId,
      return_url: `${getAppUrl()}/account`,
    });
    return NextResponse.json({ url: portalSession.url });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error(
      JSON.stringify({
        event: "stripe.portal_failed",
        userId,
        error: err instanceof Error ? err.message : String(err),
      })
    );
    return NextResponse.json(
      {
        error: "portal_failed",
        message: "Couldn't open the billing portal. Please try again.",
      },
      { status: 502 }
    );
  }
}

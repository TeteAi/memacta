import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { getPlanById } from "@/lib/credits";
import {
  getAppUrl,
  getStripe,
  isStripeConfigured,
  resolvePriceId,
} from "@/lib/stripe";

// Plan (subscription) checkout. Creates a Stripe Checkout Session in
// `mode: subscription` for the requested plan and returns the URL the
// client should redirect to. Credit grants happen asynchronously via
// /api/billing/webhook once Stripe confirms the payment — this route
// never touches credits itself.
//
// When STRIPE_SECRET_KEY isn't configured (local dev without billing
// wired, or production before keys are added) we return a 503 with
// friendly copy so the pricing UI can show a "coming soon" banner
// instead of a broken button.

export async function POST(req: Request) {
  const session = await auth();
  const userId = (session?.user as { id?: string } | undefined)?.id;
  const userEmail = session?.user?.email ?? null;

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
  if (!plan || plan.price === 0) {
    return NextResponse.json({ error: "unknown plan" }, { status: 400 });
  }

  if (!isStripeConfigured()) {
    return NextResponse.json(
      {
        error: "billing_coming_soon",
        message:
          "Subscriptions are launching soon. You still get daily free credits in the meantime.",
        planId,
      },
      { status: 503 }
    );
  }

  const priceId = resolvePriceId(planId);
  if (!priceId) {
    // eslint-disable-next-line no-console
    console.error(
      JSON.stringify({
        event: "stripe.price_missing",
        planId,
        hint: `Set STRIPE_PRICE_${planId.toUpperCase()} in your env`,
      })
    );
    return NextResponse.json(
      {
        error: "plan_not_configured",
        message: "This plan isn't available yet. Please try another.",
      },
      { status: 503 }
    );
  }

  // Reuse the Stripe customer id if we've already created one for this
  // user. Keeps billing consolidated in the dashboard and lets Stripe
  // auto-fill saved payment methods on the Checkout page.
  const existingSub = await prisma.subscription.findUnique({
    where: { userId },
    select: { stripeCustomerId: true },
  });

  try {
    const stripe = getStripe();
    const appUrl = getAppUrl();

    const checkoutSession = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer: existingSub?.stripeCustomerId ?? undefined,
      customer_email: existingSub?.stripeCustomerId
        ? undefined
        : userEmail ?? undefined,
      line_items: [{ price: priceId, quantity: 1 }],
      // client_reference_id + metadata together so the webhook can find
      // the user even if we miss one — belt-and-braces because Stripe
      // doesn't guarantee every field survives every event shape.
      client_reference_id: userId,
      metadata: { userId, planId, kind: "subscription" },
      subscription_data: {
        metadata: { userId, planId },
      },
      allow_promotion_codes: true,
      success_url: `${appUrl}/account?checkout=success`,
      cancel_url: `${appUrl}/pricing?checkout=cancelled`,
    });

    if (!checkoutSession.url) {
      throw new Error("Stripe returned no checkout URL");
    }

    return NextResponse.json({ url: checkoutSession.url });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error(
      JSON.stringify({
        event: "stripe.checkout_failed",
        kind: "subscription",
        planId,
        userId,
        error: err instanceof Error ? err.message : String(err),
      })
    );
    return NextResponse.json(
      {
        error: "checkout_failed",
        message:
          "We couldn't start checkout. Please try again in a moment.",
      },
      { status: 502 }
    );
  }
}

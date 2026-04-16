import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import {
  getAppUrl,
  getStripe,
  isStripeConfigured,
  resolvePriceId,
} from "@/lib/stripe";

const Body = z.object({
  packageId: z.string().min(1),
});

// One-shot credit-pack checkout. Creates a Stripe Checkout Session in
// `mode: payment` (non-recurring) for the requested credit package. The
// actual credit grant + Purchase row is written by the billing webhook
// once Stripe confirms the payment — this route only kicks off checkout.
//
// Before Stripe keys are wired, admin accounts (ADMIN_EMAILS) still get
// the free-credit stub so we can smoke-test the UX end-to-end. Everyone
// else sees a 503 "coming soon" until the env is configured.

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
  const userEmail = session?.user?.email ?? null;
  if (!userId) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const pkg = await prisma.creditPackage.findUnique({
    where: { id: parsed.data.packageId },
  });

  if (!pkg) {
    return NextResponse.json({ error: "package not found" }, { status: 404 });
  }

  // ── Real Stripe path ─────────────────────────────────────────────────
  if (isStripeConfigured()) {
    const priceId =
      pkg.stripePriceId && pkg.stripePriceId.length > 0
        ? pkg.stripePriceId
        : resolvePriceId(pkg.id);

    if (!priceId) {
      // eslint-disable-next-line no-console
      console.error(
        JSON.stringify({
          event: "stripe.price_missing",
          packageId: pkg.id,
          hint: `Set CreditPackage.stripePriceId or env STRIPE_PRICE_${pkg.id.toUpperCase()}`,
        })
      );
      return NextResponse.json(
        {
          error: "package_not_configured",
          message: "This pack isn't available yet. Please try another.",
        },
        { status: 503 }
      );
    }

    const existingSub = await prisma.subscription.findUnique({
      where: { userId },
      select: { stripeCustomerId: true },
    });

    try {
      const stripe = getStripe();
      const appUrl = getAppUrl();

      const checkoutSession = await stripe.checkout.sessions.create({
        mode: "payment",
        customer: existingSub?.stripeCustomerId ?? undefined,
        customer_email: existingSub?.stripeCustomerId
          ? undefined
          : userEmail ?? undefined,
        line_items: [{ price: priceId, quantity: 1 }],
        client_reference_id: userId,
        // packageId lets the webhook find the right CreditPackage row and
        // kind distinguishes topups from subscription renewals (both
        // fire checkout.session.completed).
        metadata: {
          userId,
          packageId: pkg.id,
          credits: String(pkg.credits),
          kind: "topup",
        },
        payment_intent_data: {
          metadata: { userId, packageId: pkg.id, credits: String(pkg.credits) },
        },
        allow_promotion_codes: true,
        success_url: `${appUrl}/account?checkout=success`,
        cancel_url: `${appUrl}/pricing/topup?checkout=cancelled`,
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
          kind: "topup",
          packageId: pkg.id,
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

  // ── Admin / dev stub ─────────────────────────────────────────────────
  // Free-credit grant for smoke tests. Gated in prod to admins only so
  // random visitors can't farm credits by clicking topup over and over.
  const isProd = process.env.NODE_ENV === "production";
  const { isAdminEmail } = await import("@/lib/admin");
  const allowedToStub = !isProd || isAdminEmail(userEmail);

  if (!allowedToStub) {
    return NextResponse.json(
      {
        error: "billing_coming_soon",
        message:
          "Credit purchases are launching soon. You still get daily free credits in the meantime.",
      },
      { status: 503 }
    );
  }

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

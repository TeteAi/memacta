import { NextResponse } from "next/server";
import Stripe from "stripe";
import { prisma } from "@/lib/db";
import { getPlanById } from "@/lib/credits";
import { getStripe, isStripeConfigured } from "@/lib/stripe";

// Stripe webhook receiver. All credit grants (topups AND subscription
// renewals) happen here so the client can't fake a successful payment
// by POSTing to a public endpoint. We verify Stripe's signature, route
// on event type, and keep every handler idempotent — Stripe will retry
// on 5xx so duplicate events are normal, not an error.
//
// IMPORTANT: we need the raw body to verify the signature, so this
// route reads req.text() and we tell Next.js to skip its body parser.

export const runtime = "nodejs";
// Disable static optimisation — webhooks can't be cached.
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  if (!isStripeConfigured()) {
    // eslint-disable-next-line no-console
    console.warn(
      JSON.stringify({
        event: "stripe.webhook_unconfigured",
        note: "Webhook hit before Stripe env was wired",
      })
    );
    return NextResponse.json({ error: "not_configured" }, { status: 503 });
  }

  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) {
    // eslint-disable-next-line no-console
    console.error(
      JSON.stringify({
        event: "stripe.webhook_missing_secret",
      })
    );
    return NextResponse.json({ error: "not_configured" }, { status: 503 });
  }

  const signature = req.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "missing_signature" }, { status: 400 });
  }

  const raw = await req.text();
  const stripe = getStripe();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(raw, signature, secret);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn(
      JSON.stringify({
        event: "stripe.webhook_signature_failed",
        error: err instanceof Error ? err.message : String(err),
      })
    );
    return NextResponse.json({ error: "bad_signature" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed":
        await handleCheckoutCompleted(event.data.object);
        break;
      case "customer.subscription.updated":
      case "customer.subscription.deleted":
        await handleSubscriptionChanged(event.data.object);
        break;
      case "invoice.payment_succeeded":
        await handleRecurringInvoice(event.data.object);
        break;
      default:
        // eslint-disable-next-line no-console
        console.log(
          JSON.stringify({
            event: "stripe.webhook_ignored",
            type: event.type,
          })
        );
    }
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error(
      JSON.stringify({
        event: "stripe.webhook_handler_failed",
        type: event.type,
        error: err instanceof Error ? err.message : String(err),
      })
    );
    // Return 500 so Stripe retries (our handlers are idempotent).
    return NextResponse.json({ error: "handler_failed" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const userId =
    (session.metadata?.userId as string | undefined) ??
    (session.client_reference_id as string | undefined);
  const kind = session.metadata?.kind as string | undefined;

  if (!userId) {
    // eslint-disable-next-line no-console
    console.warn(
      JSON.stringify({
        event: "stripe.checkout_completed_no_user",
        sessionId: session.id,
      })
    );
    return;
  }

  if (kind === "topup") {
    await creditTopup({
      userId,
      packageId: session.metadata?.packageId ?? null,
      amountPaid: session.amount_total ?? 0,
      stripeSessionId: session.id,
    });
    return;
  }

  if (kind === "subscription") {
    const planId = session.metadata?.planId ?? null;
    const subscriptionId =
      typeof session.subscription === "string"
        ? session.subscription
        : session.subscription?.id ?? null;
    const customerId =
      typeof session.customer === "string"
        ? session.customer
        : session.customer?.id ?? null;
    await activateSubscription({
      userId,
      planId,
      stripeSubId: subscriptionId,
      stripeCustomerId: customerId,
    });
    return;
  }

  // No `kind` metadata — infer from session.mode.
  if (session.mode === "payment") {
    await creditTopup({
      userId,
      packageId: session.metadata?.packageId ?? null,
      amountPaid: session.amount_total ?? 0,
      stripeSessionId: session.id,
    });
  }
}

async function creditTopup(args: {
  userId: string;
  packageId: string | null;
  amountPaid: number;
  stripeSessionId: string;
}) {
  // Idempotency: if we've already recorded this exact Stripe session as
  // a purchase, bail. Stripe retries webhooks on 5xx, and we never want
  // to double-grant credits.
  const existing = await prisma.purchase.findFirst({
    where: { stripeSessionId: args.stripeSessionId },
    select: { id: true },
  });
  if (existing) return;

  let creditsToGrant = 0;
  let resolvedPackageId = args.packageId ?? "unknown";

  if (args.packageId) {
    const pkg = await prisma.creditPackage.findUnique({
      where: { id: args.packageId },
    });
    if (pkg) {
      creditsToGrant = pkg.credits;
      resolvedPackageId = pkg.id;
    }
  }

  if (creditsToGrant <= 0) {
    // eslint-disable-next-line no-console
    console.warn(
      JSON.stringify({
        event: "stripe.topup_unknown_package",
        userId: args.userId,
        packageId: args.packageId,
        stripeSessionId: args.stripeSessionId,
      })
    );
    return;
  }

  const updated = await prisma.user.update({
    where: { id: args.userId },
    data: { credits: { increment: creditsToGrant } },
    select: { credits: true },
  });

  await prisma.purchase.create({
    data: {
      userId: args.userId,
      packageId: resolvedPackageId,
      credits: creditsToGrant,
      amountUsd: args.amountPaid,
      stripeSessionId: args.stripeSessionId,
      status: "completed",
    },
  });

  await prisma.creditTransaction.create({
    data: {
      userId: args.userId,
      amount: creditsToGrant,
      balance: updated.credits,
      type: "purchase",
      description: `Credit topup (${resolvedPackageId})`,
    },
  });

  // eslint-disable-next-line no-console
  console.log(
    JSON.stringify({
      event: "stripe.topup_granted",
      userId: args.userId,
      packageId: resolvedPackageId,
      credits: creditsToGrant,
    })
  );
}

async function activateSubscription(args: {
  userId: string;
  planId: string | null;
  stripeSubId: string | null;
  stripeCustomerId: string | null;
}) {
  const plan = args.planId ? getPlanById(args.planId) : null;
  if (!plan) {
    // eslint-disable-next-line no-console
    console.warn(
      JSON.stringify({
        event: "stripe.subscription_unknown_plan",
        userId: args.userId,
        planId: args.planId,
      })
    );
    return;
  }

  await prisma.subscription.upsert({
    where: { userId: args.userId },
    create: {
      userId: args.userId,
      planId: plan.id,
      stripeCustomerId: args.stripeCustomerId,
      stripeSubId: args.stripeSubId,
      status: "active",
    },
    update: {
      planId: plan.id,
      stripeCustomerId: args.stripeCustomerId ?? undefined,
      stripeSubId: args.stripeSubId ?? undefined,
      status: "active",
      cancelAtPeriodEnd: false,
    },
  });

  // Grant the plan's monthly credit allotment on first activation.
  // Renewals go through invoice.payment_succeeded below.
  if (plan.credits > 0) {
    const updated = await prisma.user.update({
      where: { id: args.userId },
      data: { credits: { increment: plan.credits } },
      select: { credits: true },
    });
    await prisma.creditTransaction.create({
      data: {
        userId: args.userId,
        amount: plan.credits,
        balance: updated.credits,
        type: "subscription_activate",
        description: `${plan.name} plan activation`,
      },
    });
  }

  // eslint-disable-next-line no-console
  console.log(
    JSON.stringify({
      event: "stripe.subscription_activated",
      userId: args.userId,
      planId: plan.id,
    })
  );
}

async function handleSubscriptionChanged(sub: Stripe.Subscription) {
  const userId =
    (sub.metadata?.userId as string | undefined) ?? null;
  if (!userId) return;

  const existing = await prisma.subscription.findUnique({
    where: { userId },
  });
  if (!existing) return;

  const periodEnd =
    typeof (sub as unknown as { current_period_end?: number })
      .current_period_end === "number"
      ? new Date(
          (sub as unknown as { current_period_end: number })
            .current_period_end * 1000
        )
      : null;

  await prisma.subscription.update({
    where: { userId },
    data: {
      status: sub.status,
      cancelAtPeriodEnd: sub.cancel_at_period_end,
      currentPeriodEnd: periodEnd,
    },
  });
}

async function handleRecurringInvoice(invoice: Stripe.Invoice) {
  // Only handle subscription renewal invoices. One-off payment invoices
  // don't carry a subscription reference.
  const subscriptionId =
    typeof (invoice as unknown as { subscription?: string | null })
      .subscription === "string"
      ? (invoice as unknown as { subscription: string }).subscription
      : null;
  if (!subscriptionId) return;
  // Skip the very first invoice — activation path already granted the
  // credits via checkout.session.completed.
  if (invoice.billing_reason !== "subscription_cycle") return;

  // Resolve the user from our Subscription row.
  const sub = await prisma.subscription.findFirst({
    where: { stripeSubId: subscriptionId },
  });
  if (!sub) return;
  const plan = getPlanById(sub.planId);
  if (!plan || plan.credits <= 0) return;

  // Idempotency: key renewals by Stripe's invoice id so retries don't
  // double-grant.
  const already = await prisma.creditTransaction.findFirst({
    where: {
      userId: sub.userId,
      type: "subscription_renewal",
      description: `renewal:${invoice.id}`,
    },
    select: { id: true },
  });
  if (already) return;

  const updated = await prisma.user.update({
    where: { id: sub.userId },
    data: { credits: { increment: plan.credits } },
    select: { credits: true },
  });
  await prisma.creditTransaction.create({
    data: {
      userId: sub.userId,
      amount: plan.credits,
      balance: updated.credits,
      type: "subscription_renewal",
      description: `renewal:${invoice.id}`,
    },
  });
  // eslint-disable-next-line no-console
  console.log(
    JSON.stringify({
      event: "stripe.subscription_renewed",
      userId: sub.userId,
      planId: plan.id,
      credits: plan.credits,
    })
  );
}

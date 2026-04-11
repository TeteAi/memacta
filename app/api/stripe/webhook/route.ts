import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getPlanById } from "@/lib/credits";

// TODO: import Stripe from "stripe";
// TODO: const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: "2024-06-20" });

export async function POST(req: Request) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature");

  // TODO: Verify Stripe webhook signature
  // let event: Stripe.Event;
  // try {
  //   event = stripe.webhooks.constructEvent(body, sig!, process.env.STRIPE_WEBHOOK_SECRET!);
  // } catch (err) {
  //   return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  // }

  console.log("[stripe/webhook] received body length:", body.length, "sig:", sig);

  // TODO: Handle Stripe events
  // switch (event.type) {
  //   case "checkout.session.completed": {
  //     const checkoutSession = event.data.object as Stripe.Checkout.Session;
  //     const { userId, planId } = checkoutSession.metadata ?? {};
  //     if (!userId || !planId) break;
  //     const plan = getPlanById(planId);
  //     if (!plan) break;
  //     // Upsert subscription
  //     await prisma.subscription.upsert({
  //       where: { userId },
  //       create: {
  //         userId,
  //         planId,
  //         stripeCustomerId: checkoutSession.customer as string,
  //         stripeSubId: checkoutSession.subscription as string,
  //         status: "active",
  //       },
  //       update: {
  //         planId,
  //         stripeCustomerId: checkoutSession.customer as string,
  //         stripeSubId: checkoutSession.subscription as string,
  //         status: "active",
  //       },
  //     });
  //     // Add credits
  //     await prisma.user.update({
  //       where: { id: userId },
  //       data: { credits: { increment: plan.credits } },
  //     });
  //     await prisma.creditTransaction.create({
  //       data: {
  //         userId,
  //         amount: plan.credits,
  //         balance: 0, // would need to fetch actual balance
  //         type: "subscription",
  //         description: `${plan.name} plan subscription`,
  //       },
  //     });
  //     break;
  //   }
  //   case "customer.subscription.deleted": { ... break; }
  //   case "invoice.payment_failed": { ... break; }
  // }

  // Silence unused import warning in stub
  void getPlanById;
  void prisma;

  return NextResponse.json({ received: true });
}

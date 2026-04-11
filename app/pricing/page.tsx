import Link from "next/link";
import { PLANS, formatPrice } from "@/lib/credits";

export const metadata = { title: "memacta - Pricing" };

const faq = [
  {
    q: "What are credits?",
    a: "Credits are the currency used on memacta to generate images and videos. Each generation costs a set number of credits depending on the model and output type.",
  },
  {
    q: "Do credits roll over each month?",
    a: "Monthly subscription credits reset each billing cycle and do not roll over. Top-up credits you purchase separately never expire.",
  },
  {
    q: "Can I cancel anytime?",
    a: "Yes. You can cancel your subscription at any time from your account. You will retain access until the end of your current billing period.",
  },
  {
    q: "What happens to my credits if I downgrade?",
    a: "Any remaining credits will be usable until they are exhausted. On downgrade your monthly allowance will reflect the new plan at the next billing cycle.",
  },
  {
    q: "Can I get a refund?",
    a: "We offer refunds within 7 days of purchase if you have not used any of the purchased credits. Contact our support team for assistance.",
  },
  {
    q: "Need a custom enterprise plan?",
    a: "We offer custom plans with volume discounts, dedicated support, and priority processing. Contact our sales team to learn more.",
  },
];

export default function PricingPage() {
  return (
    <main className="mx-auto max-w-7xl px-6 py-16">
      {/* Header */}
      <div className="text-center mb-16">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/20 mb-6">
          <span className="w-2 h-2 rounded-full bg-fuchsia-500 animate-pulse" />
          <span className="text-sm text-white/80">Simple, transparent pricing</span>
        </div>
        <h1 className="text-4xl md:text-6xl font-bold mb-4 text-brand-gradient">
          Choose Your Plan
        </h1>
        <p className="text-white/60 text-lg max-w-2xl mx-auto">
          From hobbyist to studio — every plan unlocks the full memacta AI suite. Upgrade or cancel anytime.
        </p>
      </div>

      {/* Plan Cards */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-5 mb-12">
        {PLANS.map((plan) => (
          <div
            key={plan.id}
            className={`relative flex flex-col rounded-2xl p-6 transition-all ${
              plan.popular
                ? "gradient-border shadow-2xl shadow-fuchsia-500/20"
                : "bg-[#181828] border border-white/10 hover:border-white/20"
            }`}
          >
            {plan.popular && (
              <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full bg-brand-gradient px-4 py-1 text-xs font-bold text-white whitespace-nowrap shadow-lg">
                Most Popular
              </span>
            )}

            <div className="mb-4 mt-2">
              <h2 className="text-lg font-bold text-white">{plan.name}</h2>
              <div className="mt-3 flex items-end gap-1">
                <span className={`text-3xl font-black ${plan.popular ? "text-brand-gradient" : "text-white"}`}>
                  {plan.price === 0 ? "Free" : `$${(plan.price / 100).toFixed(2)}`}
                </span>
                {plan.price > 0 && (
                  <span className="text-white/40 text-sm mb-1">/mo</span>
                )}
              </div>
              <p className="text-white/50 text-xs mt-1">
                {plan.dailyCredits > 0
                  ? `${plan.dailyCredits} credits / day`
                  : `${plan.credits.toLocaleString()} credits / month`}
              </p>
              <p className="text-white/40 text-xs mt-0.5">{plan.approxGenerations}</p>
            </div>

            <ul className="space-y-2.5 flex-1 mb-6">
              {plan.features.map((f) => (
                <li key={f} className="flex items-start gap-2 text-sm text-white/70">
                  <svg
                    className="w-4 h-4 text-fuchsia-400 flex-shrink-0 mt-0.5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2.5}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                  {f}
                </li>
              ))}
            </ul>

            <PlanCTA planId={plan.id} price={plan.price} popular={!!plan.popular} />
          </div>
        ))}
      </div>

      {/* Top-up link */}
      <div className="text-center mb-20">
        <p className="text-white/50 text-sm">
          Need extra credits without a subscription?{" "}
          <Link href="/pricing/topup" className="text-fuchsia-400 hover:text-fuchsia-300 underline">
            Buy a credit top-up
          </Link>
        </p>
      </div>

      {/* FAQ */}
      <section className="max-w-3xl mx-auto">
        <h2 className="text-2xl font-bold mb-8 text-center text-white">Frequently Asked Questions</h2>
        <div className="space-y-3">
          {faq.map((item) => (
            <details
              key={item.q}
              className="group rounded-xl border border-white/15 bg-[#181828] overflow-hidden"
            >
              <summary className="cursor-pointer font-medium text-white p-5 hover:bg-white/5 transition-colors flex items-center justify-between">
                {item.q}
                <svg
                  className="w-5 h-5 text-white/40 group-open:rotate-180 transition-transform flex-shrink-0"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                </svg>
              </summary>
              <p className="px-5 pb-5 text-white/60 text-sm leading-relaxed">{item.a}</p>
            </details>
          ))}
        </div>
      </section>
    </main>
  );
}

function PlanCTA({ planId, price, popular }: { planId: string; price: number; popular: boolean }) {
  if (planId === "free") {
    return (
      <Link
        href="/api/auth/signin"
        className="w-full py-3 rounded-xl text-center font-semibold text-sm bg-white/10 text-white hover:bg-white/20 transition-all block"
      >
        Get Started Free
      </Link>
    );
  }
  if (planId === "studio") {
    return (
      <Link
        href="/pricing/enterprise"
        className="w-full py-3 rounded-xl text-center font-semibold text-sm bg-white/10 text-white hover:bg-white/20 transition-all block"
      >
        Contact Sales
      </Link>
    );
  }
  return (
    <SubscribeButton planId={planId} popular={popular} />
  );
}

// Client component for subscribe button — kept inline to avoid extra file
import SubscribeButton from "./subscribe-button";

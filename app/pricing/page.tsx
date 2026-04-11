import { prisma } from "@/lib/db";
import PricingCards from "./pricing-cards";

export const metadata = { title: "memacta - Pricing" };

export default async function PricingPage() {
  const packages = await prisma.creditPackage.findMany({
    orderBy: { priceUsd: "asc" },
  });

  const faq = [
    {
      q: "What are credits?",
      a: "Credits are the currency used on memacta to generate images, videos, and use AI tools. Each generation costs a certain number of credits depending on the model and output type.",
    },
    {
      q: "Do credits expire?",
      a: "No, your credits never expire. Once purchased, they remain in your account until you use them.",
    },
    {
      q: "Can I get a refund?",
      a: "We offer refunds within 7 days of purchase if you have not used any of the purchased credits. Contact our support team for assistance.",
    },
    {
      q: "Enterprise custom plans?",
      a: "We offer custom enterprise plans with volume discounts, dedicated support, and priority processing. Contact our sales team to learn more.",
    },
  ];

  return (
    <main className="mx-auto max-w-6xl px-6 py-16">
      <div className="text-center mb-14">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/15 border border-white/25 mb-6">
          <span className="text-sm text-white/80">Simple, transparent pricing</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-bold mb-4 text-brand-gradient">
          Choose Your Plan
        </h1>
        <p className="text-white/70 text-lg max-w-2xl mx-auto">
          Choose the credit package that fits your creative workflow. All packages include access to every AI model and tool.
        </p>
      </div>

      <PricingCards packages={packages} />

      <section className="mt-24 max-w-3xl mx-auto">
        <h2 className="text-2xl font-bold mb-8 text-center">Frequently Asked Questions</h2>
        <div className="space-y-3">
          {faq.map((item) => (
            <details
              key={item.q}
              className="group rounded-xl border border-white/15 bg-[#181828] overflow-hidden"
            >
              <summary className="cursor-pointer font-medium text-white p-5 hover:bg-white/10 transition-colors flex items-center justify-between">
                {item.q}
                <svg className="w-5 h-5 text-white/60 group-open:rotate-180 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                </svg>
              </summary>
              <p className="px-5 pb-5 text-white/70 text-sm leading-relaxed">
                {item.a}
              </p>
            </details>
          ))}
        </div>
      </section>
    </main>
  );
}

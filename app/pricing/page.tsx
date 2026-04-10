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
    <main className="mx-auto max-w-6xl px-6 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4 bg-brand-gradient bg-clip-text text-transparent">
          Pricing
        </h1>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          Choose the credit package that fits your creative workflow. All packages include access to every AI model and tool.
        </p>
      </div>

      <PricingCards packages={packages} />

      <section className="mt-20 max-w-3xl mx-auto">
        <h2 className="text-2xl font-bold mb-6 text-center">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {faq.map((item) => (
            <details
              key={item.q}
              className="group rounded-lg border border-border bg-card p-4"
            >
              <summary className="cursor-pointer font-medium text-foreground group-open:text-brand-cyan transition-colors">
                {item.q}
              </summary>
              <p className="mt-3 text-muted-foreground text-sm leading-relaxed">
                {item.a}
              </p>
            </details>
          ))}
        </div>
      </section>
    </main>
  );
}

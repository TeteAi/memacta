"use client";

import { useState } from "react";

interface CreditPackage {
  id: string;
  name: string;
  credits: number;
  priceUsd: number;
  popular: boolean;
}

function formatUsd(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

const PLAN_FEATURES: Record<string, string[]> = {
  Starter: ["100 credits", "All AI models", "HD exports", "Community access"],
  Pro: ["500 credits", "All AI models", "4K exports", "Priority queue", "Social posting"],
  Team: ["2000 credits", "All AI models", "4K exports", "Priority queue", "Social posting", "Team workspace"],
  Enterprise: ["10000 credits", "All AI models", "4K exports", "Dedicated support", "Custom models", "API access"],
};

export default function PricingCards({ packages }: { packages: CreditPackage[] }) {
  const [buying, setBuying] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  async function handleBuy(packageId: string) {
    setBuying(packageId);
    setMessage(null);
    try {
      const res = await fetch("/api/billing/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ packageId }),
      });
      const data = await res.json();
      if (data.success) {
        setMessage(`Purchase successful! You now have ${data.credits} credits.`);
      } else if (data.url) {
        window.location.href = data.url;
      } else {
        setMessage(data.error || "Something went wrong");
      }
    } catch {
      setMessage("Network error. Please try again.");
    } finally {
      setBuying(null);
    }
  }

  return (
    <>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4" data-testid="pricing-grid">
        {packages.map((pkg) => {
          const features = PLAN_FEATURES[pkg.name] || [`${pkg.credits} credits`, "All AI models"];
          return (
            <div
              key={pkg.id}
              data-testid="pricing-card"
              className={`relative rounded-xl p-6 flex flex-col transition-all ${
                pkg.popular
                  ? "gradient-border shadow-lg shadow-purple-500/10 scale-105"
                  : "bg-[#181828] border border-white/15 hover:border-white/25"
              }`}
            >
              {pkg.popular && (
                <span
                  data-testid="popular-badge"
                  className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-brand-gradient px-4 py-1 text-xs font-bold text-white"
                >
                  Most Popular
                </span>
              )}
              <h3 className="text-xl font-bold mt-2 text-white">{pkg.name}</h3>
              <p className="text-3xl font-black mt-4 bg-brand-gradient bg-clip-text text-transparent">
                {formatUsd(pkg.priceUsd)}
              </p>
              <p className="text-white/60 text-sm mt-1">{pkg.credits} credits</p>

              <ul className="mt-6 space-y-2.5 flex-1">
                {features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-white/70">
                    <svg className="w-4 h-4 text-green-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                    {f}
                  </li>
                ))}
              </ul>

              <button
                onClick={() => handleBuy(pkg.id)}
                disabled={buying === pkg.id}
                className={`mt-6 w-full py-3 rounded-lg font-semibold text-sm transition-all ${
                  pkg.popular
                    ? "bg-brand-gradient text-white glow-btn"
                    : "bg-white/15 text-white hover:bg-white/25"
                } disabled:opacity-50`}
              >
                {buying === pkg.id ? "Processing..." : "Get Started"}
              </button>
            </div>
          );
        })}
      </div>
      {message && (
        <p className="mt-6 text-center text-sm font-medium text-green-400" data-testid="purchase-message">
          {message}
        </p>
      )}
    </>
  );
}

"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

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
        {packages.map((pkg) => (
          <div
            key={pkg.id}
            data-testid="pricing-card"
            className={`relative rounded-xl border p-6 flex flex-col items-center text-center transition-shadow ${
              pkg.popular
                ? "border-brand-cyan shadow-lg shadow-brand-cyan/10"
                : "border-border"
            } bg-card`}
          >
            {pkg.popular && (
              <span
                data-testid="popular-badge"
                className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-brand-gradient px-3 py-0.5 text-xs font-semibold text-white"
              >
                Popular
              </span>
            )}
            <h3 className="text-xl font-bold mt-2">{pkg.name}</h3>
            <p className="text-3xl font-black mt-4 bg-brand-gradient bg-clip-text text-transparent">
              {formatUsd(pkg.priceUsd)}
            </p>
            <p className="text-muted-foreground mt-2">{pkg.credits} credits</p>
            <Button
              className="mt-6 w-full"
              onClick={() => handleBuy(pkg.id)}
              disabled={buying === pkg.id}
            >
              {buying === pkg.id ? "Processing..." : "Buy Now"}
            </Button>
          </div>
        ))}
      </div>
      {message && (
        <p className="mt-6 text-center text-sm font-medium text-brand-cyan" data-testid="purchase-message">
          {message}
        </p>
      )}
    </>
  );
}

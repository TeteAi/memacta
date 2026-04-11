"use client";

import { useState } from "react";

interface TopupPackage {
  id: string;
  credits: number;
  price: number;
  label: string;
  savings?: string;
}

export default function TopupCards({ packages }: { packages: TopupPackage[] }) {
  const [loading, setLoading] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  async function handleBuy(pkg: TopupPackage) {
    setLoading(pkg.id);
    setMessage(null);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId: pkg.id, credits: pkg.credits, price: pkg.price }),
      });
      const data = await res.json();
      if (res.status === 401) {
        window.location.href = "/auth/signin";
        return;
      }
      if (data.url) {
        window.location.href = data.url;
      } else {
        setMessage(data.error ?? "Something went wrong");
      }
    } catch {
      setMessage("Network error. Please try again.");
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
      {packages.map((pkg) => {
        const pricePerCredit = (pkg.price / pkg.credits / 100).toFixed(3);
        return (
          <div
            key={pkg.id}
            className="relative rounded-2xl bg-[#181828] border border-white/10 hover:border-white/20 p-6 flex flex-col transition-all"
          >
            {pkg.savings && (
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-fuchsia-600/80 px-3 py-0.5 text-xs font-bold text-white whitespace-nowrap">
                {pkg.savings}
              </span>
            )}

            <div className="flex items-center gap-2 mb-4 mt-2">
              <svg className="w-5 h-5 text-fuchsia-400" viewBox="0 0 24 24" fill="currentColor">
                <path d="M6.5 2h11l4.5 7-10 13L2 9l4.5-7z" opacity="0.85" />
              </svg>
              <span className="text-2xl font-black text-white">{pkg.credits.toLocaleString()}</span>
              <span className="text-white/50 text-sm font-medium">credits</span>
            </div>

            <div className="mb-1">
              <span className="text-3xl font-black text-brand-gradient">
                ${(pkg.price / 100).toFixed(2)}
              </span>
            </div>
            <p className="text-white/40 text-xs mb-6">${pricePerCredit} per credit</p>

            <ul className="space-y-2 flex-1 mb-6 text-sm text-white/60">
              <li className="flex items-center gap-2">
                <svg className="w-3.5 h-3.5 text-fuchsia-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
                Never expire
              </li>
              <li className="flex items-center gap-2">
                <svg className="w-3.5 h-3.5 text-fuchsia-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
                All AI models
              </li>
              <li className="flex items-center gap-2">
                <svg className="w-3.5 h-3.5 text-fuchsia-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
                Instant delivery
              </li>
            </ul>

            <button
              onClick={() => handleBuy(pkg)}
              disabled={loading === pkg.id}
              className="w-full py-3 rounded-xl bg-brand-gradient text-white font-semibold text-sm glow-btn hover:opacity-90 transition-all disabled:opacity-50"
            >
              {loading === pkg.id ? "Loading..." : "Buy Now"}
            </button>
          </div>
        );
      })}
      {message && (
        <p className="col-span-full text-center text-sm text-red-400 mt-4">{message}</p>
      )}
    </div>
  );
}

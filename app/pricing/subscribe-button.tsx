"use client";

import { useState } from "react";

export default function SubscribeButton({ planId, popular }: { planId: string; popular: boolean }) {
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    setLoading(true);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId }),
      });
      const data = await res.json();
      if (res.status === 401) {
        window.location.href = "/api/auth/signin";
        return;
      }
      if (data.url) {
        window.location.href = data.url;
      }
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className={`w-full py-3 rounded-xl font-semibold text-sm transition-all disabled:opacity-50 ${
        popular
          ? "bg-brand-gradient text-white glow-btn hover:opacity-90"
          : "bg-white/10 text-white hover:bg-white/20"
      }`}
    >
      {loading ? "Loading..." : "Get Started"}
    </button>
  );
}

"use client";

import { useState } from "react";

export default function SubscribeButton({ planId, popular }: { planId: string; popular: boolean }) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function handleClick() {
    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId }),
      });
      const data = await res.json();
      if (res.status === 401) {
        window.location.href = "/auth/signin";
        return;
      }
      if (data.url) {
        window.location.href = data.url;
      } else if (data.message || data.error) {
        // "Coming soon" 503 — show the friendly copy inline instead of
        // silently doing nothing.
        setMessage(data.message || data.error);
      }
    } catch {
      setMessage("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-2">
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
      {message && (
        <p className="text-xs text-white/60 text-center">{message}</p>
      )}
    </div>
  );
}

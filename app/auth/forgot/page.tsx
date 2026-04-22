"use client";

import { useState } from "react";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) throw new Error("Request failed");
      setSubmitted(true);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-[#12121a] rounded-xl border border-[#2a2a3a] overflow-hidden">
          {/* Top gradient bar */}
          <div className="h-1 bg-gradient-to-r from-[#e01070] to-[#ff9f40]" />

          <div className="p-8">
            <h1 className="text-2xl font-bold text-white mb-2">Reset your password</h1>
            <p className="text-[#a0a0b0] text-sm mb-6">
              Enter your email and we&apos;ll send you a reset link.
            </p>

            {submitted ? (
              <div className="rounded-lg bg-[#0f2a1a] border border-green-800 p-4 text-sm text-green-300">
                If an account with that email exists, a reset link has been sent.
                Check your inbox (and spam folder).
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[#a0a0b0] mb-1">
                    Email address
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full px-3 py-2.5 bg-[#0a0a0f] border border-[#2a2a3a] rounded-lg text-white placeholder-[#505060] focus:outline-none focus:border-[#e01070] transition-colors"
                    placeholder="you@example.com"
                  />
                </div>

                {error && (
                  <p className="text-sm text-red-400">{error}</p>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 bg-gradient-to-r from-[#e01070] to-[#ff9f40] text-white font-semibold rounded-lg hover:opacity-90 disabled:opacity-50 transition-opacity"
                >
                  {loading ? "Sending..." : "Send reset link"}
                </button>
              </form>
            )}
          </div>

          <div className="px-8 pb-6">
            <p className="text-sm text-[#606070]">
              Remember your password?{" "}
              <Link href="/auth/signin" className="text-[#e01070] hover:underline">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

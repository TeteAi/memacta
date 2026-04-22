"use client";

import { useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";

export default function ResetPasswordPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token") ?? "";

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        const errMap: Record<string, string> = {
          invalid_token: "This reset link is invalid.",
          token_already_used: "This reset link has already been used.",
          token_expired: "This reset link has expired. Please request a new one.",
        };
        setError(errMap[data.error] ?? data.error ?? "Something went wrong.");
        return;
      }
      setSuccess(true);
      setTimeout(() => router.push("/auth/signin"), 2500);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (!token) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-[#a0a0b0]">Invalid reset link.</p>
          <Link href="/auth/forgot" className="text-[#e01070] hover:underline mt-2 block">
            Request a new one
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-[#12121a] rounded-xl border border-[#2a2a3a] overflow-hidden">
          <div className="h-1 bg-gradient-to-r from-[#e01070] to-[#ff9f40]" />
          <div className="p-8">
            <h1 className="text-2xl font-bold text-white mb-2">Set a new password</h1>
            <p className="text-[#a0a0b0] text-sm mb-6">
              Choose a strong password for your memacta account.
            </p>

            {success ? (
              <div className="rounded-lg bg-[#0f2a1a] border border-green-800 p-4 text-sm text-green-300">
                Password updated! Redirecting to sign in...
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[#a0a0b0] mb-1">
                    New password
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={8}
                    className="w-full px-3 py-2.5 bg-[#0a0a0f] border border-[#2a2a3a] rounded-lg text-white placeholder-[#505060] focus:outline-none focus:border-[#e01070] transition-colors"
                    placeholder="Min. 8 characters"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#a0a0b0] mb-1">
                    Confirm new password
                  </label>
                  <input
                    type="password"
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    required
                    className="w-full px-3 py-2.5 bg-[#0a0a0f] border border-[#2a2a3a] rounded-lg text-white placeholder-[#505060] focus:outline-none focus:border-[#e01070] transition-colors"
                    placeholder="Repeat your password"
                  />
                </div>

                {error && <p className="text-sm text-red-400">{error}</p>}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 bg-gradient-to-r from-[#e01070] to-[#ff9f40] text-white font-semibold rounded-lg hover:opacity-90 disabled:opacity-50 transition-opacity"
                >
                  {loading ? "Saving..." : "Reset password"}
                </button>
              </form>
            )}
          </div>
          <div className="px-8 pb-6">
            <p className="text-sm text-[#606070]">
              <Link href="/auth/forgot" className="text-[#e01070] hover:underline">
                Request a new link
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

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
  const [showPassword, setShowPassword] = useState(false);
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
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      minLength={8}
                      className="w-full px-3 py-2.5 pr-11 bg-[#0a0a0f] border border-[#2a2a3a] rounded-lg text-white placeholder-[#505060] focus:outline-none focus:border-[#e01070] transition-colors"
                      placeholder="Min. 8 characters"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                      aria-pressed={showPassword}
                      className="absolute right-1.5 top-1/2 -translate-y-1/2 flex items-center justify-center w-8 h-8 rounded-md text-[#606070] hover:text-white hover:bg-white/5 transition-colors"
                    >
                      {showPassword ? (
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.7}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                        </svg>
                      ) : (
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.7}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#a0a0b0] mb-1">
                    Confirm new password
                  </label>
                  <input
                    type={showPassword ? "text" : "password"}
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

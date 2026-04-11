"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

const SHOWCASE_IMAGES = [
  { src: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&q=80", label: "Aria Nova · 2.4M followers" },
  { src: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=500&q=80", label: "Luna Kai · 1.8M followers" },
  { src: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=500&q=80", label: "Maya Sol · 3.1M followers" },
  { src: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=500&q=80", label: "Elena Voss · 1.5M followers" },
  { src: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&q=80", label: "Kai Atlas · 1.2M followers" },
  { src: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=500&q=80", label: "Zara Neon · 890K followers" },
];

const STATS = [
  { value: "50K+", label: "Creators" },
  { value: "1M+", label: "Generations" },
  { value: "18+", label: "AI Models" },
];

export default function SignInPage() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/create";
  const error = searchParams.get("error");

  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  async function handleOAuth(provider: string) {
    setLoading(true);
    await signIn(provider, { callbackUrl });
  }

  async function handleEmailSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setFormError(null);

    if (mode === "signup") {
      // Create account first
      try {
        const res = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ email, name, password }),
        });
        const data = await res.json();
        if (!res.ok) {
          setFormError(data.error || "Failed to create account");
          setLoading(false);
          return;
        }
      } catch {
        setFormError("Something went wrong. Please try again.");
        setLoading(false);
        return;
      }
    }

    // Sign in
    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
      callbackUrl,
    });

    if (result?.error) {
      setFormError("Invalid email or password. Please try again.");
      setLoading(false);
    } else if (result?.url) {
      window.location.href = result.url;
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* ─── LEFT: Showcase Panel ─── */}
      <div className="hidden lg:flex lg:w-[55%] relative overflow-hidden bg-[#080814]">
        {/* Background effects */}
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-fuchsia-600/15 rounded-full blur-[120px]" />
          <div className="absolute bottom-1/4 right-1/4 w-[300px] h-[300px] bg-purple-600/15 rounded-full blur-[120px]" />
          <div className="absolute top-1/2 left-1/2 w-[250px] h-[250px] bg-cyan-500/10 rounded-full blur-[100px]" />
        </div>

        <div className="relative z-10 flex flex-col justify-between p-10 w-full">
          {/* Logo */}
          <div>
            <Link href="/" className="text-2xl font-black text-brand-gradient">
              memacta
            </Link>
          </div>

          {/* Center: Value prop + showcase */}
          <div className="flex-1 flex flex-col justify-center max-w-lg mx-auto">
            <h2 className="text-3xl xl:text-4xl font-bold text-white leading-tight mb-4">
              Create Your Own
              <br />
              <span className="text-brand-gradient">AI Influencer</span>
            </h2>
            <p className="text-white/50 text-base mb-8 leading-relaxed">
              Join thousands of creators building the next generation of digital personalities with 18+ AI models.
            </p>

            {/* Showcase grid */}
            <div className="grid grid-cols-3 gap-2.5 mb-8">
              {SHOWCASE_IMAGES.map((img) => (
                <div key={img.label} className="group relative rounded-xl overflow-hidden aspect-[3/4] border border-white/10">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={img.src}
                    alt={img.label}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-2">
                    <p className="text-[10px] text-white/80 font-medium truncate">{img.label}</p>
                  </div>
                  <div className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-fuchsia-500 flex items-center justify-center">
                    <span className="text-[7px] font-black text-white">AI</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Stats */}
            <div className="flex items-center gap-8">
              {STATS.map((stat) => (
                <div key={stat.label}>
                  <p className="text-xl font-black text-white">{stat.value}</p>
                  <p className="text-xs text-white/40">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom: Testimonial */}
          <div className="mt-auto pt-6 border-t border-white/5">
            <p className="text-sm text-white/40 italic leading-relaxed">
              &quot;memacta helped me launch my AI influencer brand in a single weekend. The quality is insane.&quot;
            </p>
            <div className="flex items-center gap-2 mt-2">
              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-fuchsia-500 to-purple-600" />
              <span className="text-xs text-white/50">Sarah K. — Digital Creator</span>
            </div>
          </div>
        </div>
      </div>

      {/* ─── RIGHT: Auth Form ─── */}
      <div className="w-full lg:w-[45%] flex items-center justify-center px-6 py-12 bg-[#0e0e1a]">
        <div className="w-full max-w-[420px]">
          {/* Mobile logo */}
          <div className="lg:hidden text-center mb-8">
            <Link href="/" className="text-3xl font-black text-brand-gradient">
              memacta
            </Link>
          </div>

          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-white mb-2">
              {mode === "signin" ? "Welcome back" : "Create your account"}
            </h1>
            <p className="text-sm text-white/50">
              {mode === "signin"
                ? "Sign in to continue creating"
                : "Start creating AI content for free"}
            </p>
          </div>

          {/* Error */}
          {(error || formError) && (
            <div className="mb-6 rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-3">
              <p className="text-red-400 text-sm">
                {formError || (error === "CredentialsSignin" ? "Invalid email or password" : "Something went wrong. Please try again.")}
              </p>
            </div>
          )}

          {/* OAuth Buttons */}
          <div className="space-y-3 mb-6">
            <button
              type="button"
              onClick={() => handleOAuth("google")}
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl bg-white text-gray-900 font-medium text-sm hover:bg-gray-100 transition-all disabled:opacity-50"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
              Continue with Google
            </button>

            <button
              type="button"
              onClick={() => handleOAuth("apple")}
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl bg-white/10 text-white font-medium text-sm hover:bg-white/15 transition-all border border-white/10 disabled:opacity-50"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
              </svg>
              Continue with Apple
            </button>

            <button
              type="button"
              onClick={() => handleOAuth("discord")}
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl bg-[#5865F2]/10 text-[#5865F2] font-medium text-sm hover:bg-[#5865F2]/20 transition-all border border-[#5865F2]/20 disabled:opacity-50"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20.317 4.37a19.791 19.791 0 00-4.885-1.515.074.074 0 00-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 00-5.487 0 12.64 12.64 0 00-.617-1.25.077.077 0 00-.079-.037A19.736 19.736 0 003.677 4.37a.07.07 0 00-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 00.031.057 19.9 19.9 0 005.993 3.03.078.078 0 00.084-.028 14.09 14.09 0 001.226-1.994.076.076 0 00-.041-.106 13.107 13.107 0 01-1.872-.892.077.077 0 01-.008-.128 10.2 10.2 0 00.372-.292.074.074 0 01.077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 01.078.01c.12.098.246.198.373.292a.077.077 0 01-.006.127 12.299 12.299 0 01-1.873.892.077.077 0 00-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 00.084.028 19.839 19.839 0 006.002-3.03.077.077 0 00.032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 00-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
              </svg>
              Continue with Discord
            </button>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-3 mb-6">
            <div className="flex-1 h-px bg-white/10" />
            <span className="text-xs text-white/30 font-medium uppercase">or</span>
            <div className="flex-1 h-px bg-white/10" />
          </div>

          {/* Email Form */}
          <form onSubmit={handleEmailSubmit} className="space-y-4">
            {mode === "signup" && (
              <div>
                <label className="block text-sm text-white/60 font-medium mb-1.5">Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                  required={mode === "signup"}
                  className="w-full rounded-xl border border-white/15 bg-[#1e1e32] px-4 py-3 text-sm text-white placeholder:text-white/30 focus:border-fuchsia-500/50 focus:ring-1 focus:ring-fuchsia-500/30 outline-none"
                />
              </div>
            )}

            <div>
              <label className="block text-sm text-white/60 font-medium mb-1.5">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="w-full rounded-xl border border-white/15 bg-[#1e1e32] px-4 py-3 text-sm text-white placeholder:text-white/30 focus:border-fuchsia-500/50 focus:ring-1 focus:ring-fuchsia-500/30 outline-none"
              />
            </div>

            <div>
              <label className="block text-sm text-white/60 font-medium mb-1.5">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={mode === "signup" ? "Create a password (min 8 chars)" : "Your password"}
                required
                minLength={mode === "signup" ? 8 : undefined}
                className="w-full rounded-xl border border-white/15 bg-[#1e1e32] px-4 py-3 text-sm text-white placeholder:text-white/30 focus:border-fuchsia-500/50 focus:ring-1 focus:ring-fuchsia-500/30 outline-none"
              />
            </div>

            {mode === "signin" && (
              <div className="flex justify-end">
                <button type="button" className="text-xs text-fuchsia-400 hover:text-fuchsia-300 transition-colors">
                  Forgot password?
                </button>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl bg-brand-gradient text-white font-bold text-sm hover:opacity-90 transition-all glow-btn disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading
                ? "Please wait..."
                : mode === "signin"
                ? "Sign In"
                : "Create Account"}
            </button>
          </form>

          {/* Signup bonus */}
          {mode === "signup" && (
            <div className="mt-4 rounded-xl bg-fuchsia-500/5 border border-fuchsia-500/15 px-4 py-3 text-center">
              <p className="text-xs text-fuchsia-300">
                <span className="font-bold">Welcome bonus:</span> Get 3 free credits when you sign up
              </p>
            </div>
          )}

          {/* Toggle mode */}
          <p className="text-center text-sm text-white/40 mt-6">
            {mode === "signin" ? (
              <>
                Don&apos;t have an account?{" "}
                <button
                  type="button"
                  onClick={() => { setMode("signup"); setFormError(null); }}
                  className="text-fuchsia-400 hover:text-fuchsia-300 font-medium transition-colors"
                >
                  Sign up free
                </button>
              </>
            ) : (
              <>
                Already have an account?{" "}
                <button
                  type="button"
                  onClick={() => { setMode("signin"); setFormError(null); }}
                  className="text-fuchsia-400 hover:text-fuchsia-300 font-medium transition-colors"
                >
                  Sign in
                </button>
              </>
            )}
          </p>

          {/* Terms */}
          <p className="text-center text-[11px] text-white/25 mt-6 leading-relaxed">
            By continuing, you agree to memacta&apos;s{" "}
            <Link href="/terms" className="underline hover:text-white/40">Terms of Service</Link>
            {" "}and{" "}
            <Link href="/privacy" className="underline hover:text-white/40">Privacy Policy</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

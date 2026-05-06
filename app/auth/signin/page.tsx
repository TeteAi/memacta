"use client";

import { useCallback, useState } from "react";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import TurnstileWidget from "@/components/auth/turnstile-widget";

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
  const reason = searchParams.get("reason");
  // Users bounced from the anon-gen limit land here — prefer the signup form
  // so they can convert in one step.
  const initialMode =
    searchParams.get("mode") === "signup" || reason === "anon-limit"
      ? "signup"
      : "signin";

  const [mode, setMode] = useState<"signin" | "signup">(initialMode);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Turnstile state — only required for the signup branch. The widget
  // returns null when (a) the env var isn't configured (dev) or (b) the
  // token expired. The server still gates final acceptance, so the worst
  // a missing/expired token does is show a "please complete verification"
  // message before the user retries.
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const turnstileSiteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
  const handleTurnstile = useCallback((token: string | null) => {
    setTurnstileToken(token);
  }, []);
  const turnstileReady = !turnstileSiteKey || Boolean(turnstileToken);

  async function handleOAuth(provider: string) {
    setLoading(true);
    await signIn(provider, { callbackUrl });
  }

  async function handleEmailSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setFormError(null);

    if (mode === "signup") {
      // Belt-and-suspenders: server still verifies the token, but block the
      // request here too so users get an immediate, clear message if they
      // submit before solving the challenge.
      if (turnstileSiteKey && !turnstileToken) {
        setFormError("Please complete the verification challenge before continuing.");
        setLoading(false);
        return;
      }

      // Create account first
      try {
        const res = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            email,
            name,
            password,
            turnstileToken: turnstileToken ?? undefined,
          }),
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

          {/* Anon-limit callout — shown when the freemium gate redirected here */}
          {reason === "anon-limit" && !formError && (
            <div className="mb-6 rounded-xl bg-gradient-to-r from-fuchsia-500/10 to-purple-500/10 border border-fuchsia-500/30 px-4 py-3.5">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-fuchsia-500/20 flex items-center justify-center shrink-0">
                  <svg className="w-4 h-4 text-fuchsia-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div>
                  <p className="text-white text-sm font-semibold mb-0.5">You&apos;ve used your free generation</p>
                  <p className="text-white/60 text-xs leading-relaxed">
                    Sign up now to get <span className="text-fuchsia-300 font-semibold">100 free credits</span> and keep creating.
                  </p>
                </div>
              </div>
            </div>
          )}

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

            {/* Apple + Discord buttons removed — those providers aren't
                wired in auth.ts and clicking them 500s with "Provider not
                found". Re-enable once their env vars land. */}
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
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={mode === "signup" ? "Create a password (min 8 chars)" : "Your password"}
                  required
                  minLength={mode === "signup" ? 8 : undefined}
                  className="w-full rounded-xl border border-white/15 bg-[#1e1e32] px-4 py-3 pr-12 text-sm text-white placeholder:text-white/30 focus:border-fuchsia-500/50 focus:ring-1 focus:ring-fuchsia-500/30 outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  aria-pressed={showPassword}
                  className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center justify-center w-9 h-9 rounded-lg text-white/40 hover:text-white/80 hover:bg-white/5 transition-colors"
                >
                  {showPassword ? (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.7}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.7}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {mode === "signin" && (
              <div className="flex justify-end">
                <Link
                  href="/auth/forgot"
                  className="text-xs text-fuchsia-400 hover:text-fuchsia-300 transition-colors"
                >
                  Forgot password?
                </Link>
              </div>
            )}

            {/* Bot challenge — only on signup, only when configured.
                Renders nothing in dev / preview deploys without keys. */}
            {mode === "signup" && (
              <TurnstileWidget onToken={handleTurnstile} showStatus />
            )}

            <button
              type="submit"
              disabled={loading || (mode === "signup" && !turnstileReady)}
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
                <span className="font-bold">Welcome bonus:</span> Get 100 free credits when you sign up
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
            <Link href="/legal/terms" className="underline hover:text-white/40">Terms of Service</Link>
            {" "}and{" "}
            <Link href="/legal/privacy" className="underline hover:text-white/40">Privacy Policy</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

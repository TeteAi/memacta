import { TOPUP_PACKAGES } from "@/lib/credits";
import TopupCards from "./topup-cards";

export const metadata = { title: "memacta - Buy Credits" };

export default function TopupPage() {
  return (
    <main className="mx-auto max-w-4xl px-6 py-16">
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/20 mb-6">
          <svg className="w-4 h-4 text-fuchsia-400" viewBox="0 0 24 24" fill="currentColor">
            <path d="M6.5 2h11l4.5 7-10 13L2 9l4.5-7z" opacity="0.85" />
          </svg>
          <span className="text-sm text-white/80">One-time credit top-ups</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-bold mb-4 text-brand-gradient">Buy Credits</h1>
        <p className="text-white/60 text-lg max-w-xl mx-auto">
          Credits never expire. Stack them on top of your subscription or use them standalone.
        </p>
      </div>

      <TopupCards packages={TOPUP_PACKAGES} />

      <div className="mt-12 rounded-2xl bg-[#181828] border border-white/10 p-6 text-center">
        <p className="text-white/50 text-sm">
          Looking for a monthly subscription?{" "}
          <a href="/pricing" className="text-fuchsia-400 hover:text-fuchsia-300 underline">
            View subscription plans
          </a>
        </p>
      </div>
    </main>
  );
}

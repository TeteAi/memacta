"use client";

type Tier = "INSTANT" | "PREMIUM";

export default function PersonaTierBadge({ tier }: { tier: Tier }) {
  if (tier === "PREMIUM") {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-gradient-to-r from-[#fe2c55] to-[#ff9f40] text-white tracking-wide shadow">
        PREMIUM
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 tracking-wide">
      INSTANT
    </span>
  );
}

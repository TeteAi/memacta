"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";

export default function CreditsDisplay() {
  const { data: session, status } = useSession();

  if (status === "loading" || !session?.user) return null;

  const credits = (session.user as { credits?: number }).credits ?? 0;

  return (
    <Link
      href="/pricing"
      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 border border-white/15 hover:bg-white/15 hover:border-white/25 transition-all group"
      title="View pricing & top up credits"
    >
      {/* Gem icon */}
      <svg
        className="w-4 h-4 text-fuchsia-400 group-hover:text-fuchsia-300 transition-colors"
        viewBox="0 0 24 24"
        fill="currentColor"
      >
        <path d="M6.5 2h11l4.5 7-10 13L2 9l4.5-7z" opacity="0.85" />
        <path d="M2 9h20M6.5 2l3 7m5 0l3-7M9.5 9l2.5 13 2.5-13" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      </svg>
      <span className="text-sm font-semibold text-white tabular-nums">{credits.toLocaleString()}</span>
      {credits === 0 && (
        <span className="text-xs text-fuchsia-400 font-medium">Free</span>
      )}
    </Link>
  );
}

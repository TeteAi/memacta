"use client";

import Link from "next/link";
import { useState } from "react";

/**
 * Dismissible per-session banner shown on /create to nudge new users
 * to create a Persona. Dismissed state is kept in component state
 * (lives for the tab session — no cookie needed).
 */
export default function PersonaNudgeBanner() {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <div className="mb-8 flex items-center justify-between gap-4 rounded-xl bg-gradient-to-r from-fuchsia-500/10 via-pink-500/10 to-orange-500/10 border border-fuchsia-500/25 px-5 py-4">
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-fuchsia-500 to-pink-500 flex items-center justify-center flex-shrink-0">
          <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
          </svg>
        </div>
        <p className="text-sm text-white/80 leading-snug">
          <span className="text-fuchsia-300 font-semibold">Tip:</span>{" "}
          Create a Persona for consistent identity across all your generations.{" "}
          <Link href="/personas/new" className="underline text-white/90 hover:text-white transition-colors font-medium">
            Create one now (free)
          </Link>
        </p>
      </div>
      <button
        type="button"
        onClick={() => setDismissed(true)}
        aria-label="Dismiss"
        className="flex-shrink-0 w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/50 hover:text-white transition-all min-h-[44px] min-w-[44px]"
      >
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}

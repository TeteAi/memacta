"use client";

import Link from "next/link";
import { useEffect } from "react";
import { trackDownloadPaywallHit } from "@/lib/analytics/persona";

interface DownloadPaywallModalProps {
  personaId: string;
  userId: string;
  onClose: () => void;
}

export default function DownloadPaywallModal({ personaId, userId, onClose }: DownloadPaywallModalProps) {
  useEffect(() => {
    // Fire analytics on mount
    trackDownloadPaywallHit({ userId, personaId });
  }, [personaId, userId]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-md rounded-2xl bg-[#181828] border border-white/10 p-6 shadow-2xl space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-white font-bold text-lg">Download Clean Output</h2>
            <p className="text-white/50 text-sm mt-1">Unlock watermark-free downloads</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-white/40 hover:text-white transition-colors p-1"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="rounded-xl border border-white/10 bg-white/5 p-4 space-y-2">
          <div className="flex items-center gap-2 text-white/60 text-sm">
            <svg className="w-4 h-4 text-red-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
            Free plan: watermark on all persona outputs
          </div>
          <div className="flex items-center gap-2 text-white/60 text-sm">
            <svg className="w-4 h-4 text-emerald-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
            Creator+: download clean PNG/MP4, no watermark
          </div>
          <div className="flex items-center gap-2 text-white/60 text-sm">
            <svg className="w-4 h-4 text-emerald-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
            Creator+: unlimited personas, 500 credits/month
          </div>
        </div>

        {/* CTA */}
        <Link
          href="/pricing"
          onClick={onClose}
          className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-gradient-to-r from-[#fe2c55] to-[#ff9f40] text-white font-bold text-sm hover:opacity-90 transition-all"
        >
          Upgrade to Creator — $15/mo
        </Link>

        <p className="text-white/30 text-xs text-center">
          Free plan exports include memacta watermark (visible in bottom-right corner).
        </p>
      </div>
    </div>
  );
}

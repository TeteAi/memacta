"use client";

import { useState } from "react";

interface ConsentBlockProps {
  onConsent: (agreed: boolean) => void;
  agreed: boolean;
}

export default function ConsentBlock({ onConsent, agreed }: ConsentBlockProps) {
  return (
    <div className="rounded-xl border border-white/10 bg-[#1e1e32] p-4 space-y-3">
      <h3 className="text-white font-semibold text-sm">Consent & Attestation</h3>
      <label className="flex items-start gap-3 cursor-pointer group">
        <div className="relative mt-0.5 flex-shrink-0">
          <input
            type="checkbox"
            className="sr-only"
            checked={agreed}
            onChange={(e) => onConsent(e.target.checked)}
          />
          <div
            className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
              agreed
                ? "bg-gradient-to-r from-pink-500 to-orange-500 border-transparent"
                : "border-white/20 bg-white/5 group-hover:border-white/40"
            }`}
          >
            {agreed && (
              <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
            )}
          </div>
        </div>
        <span className="text-white/70 text-sm leading-relaxed">
          <span className="text-white font-medium">I confirm</span> this is me, or I have explicit
          permission from the person shown. I understand memacta will use these photos to create
          an AI persona and I accept the{" "}
          <a href="/terms" target="_blank" className="text-pink-400 hover:text-pink-300 underline underline-offset-2">
            Terms of Service
          </a>{" "}
          and{" "}
          <a href="/trust" target="_blank" className="text-pink-400 hover:text-pink-300 underline underline-offset-2">
            consent policy
          </a>
          .
        </span>
      </label>
      <p className="text-white/40 text-xs">
        Learn more about{" "}
        <a href="/trust" target="_blank" className="text-white/60 hover:text-white underline underline-offset-2">
          memacta&apos;s consent & takedown policy
        </a>
        .
      </p>
    </div>
  );
}

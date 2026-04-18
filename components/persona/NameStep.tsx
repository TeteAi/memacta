"use client";

import ConsentBlock from "./ConsentBlock";

interface NameStepProps {
  name: string;
  onNameChange: (name: string) => void;
  triggerWord: string;
  consentAgreed: boolean;
  onConsentChange: (agreed: boolean) => void;
}

export default function NameStep({
  name,
  onNameChange,
  triggerWord,
  consentAgreed,
  onConsentChange,
}: NameStepProps) {
  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-white font-semibold text-lg mb-1">Name Your Persona</h2>
        <p className="text-white/50 text-sm">Give your persona a name. This is what you&apos;ll see in the generate panel.</p>
      </div>

      <div className="space-y-1.5">
        <label className="text-white/70 text-sm font-medium block">Persona Name</label>
        <input
          type="text"
          value={name}
          onChange={(e) => onNameChange(e.target.value)}
          maxLength={60}
          placeholder="e.g. Alex Rae, Nova, Kiro..."
          className="w-full rounded-xl border border-white/15 bg-[#1e1e32] px-4 py-3 text-sm text-white placeholder:text-white/40 focus:border-pink-500/50 focus:ring-1 focus:ring-pink-500/30 outline-none"
        />
      </div>

      {triggerWord && (
        <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 flex items-center gap-3">
          <div className="flex-shrink-0">
            <svg className="w-4 h-4 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 6h.008v.008H6V6z" />
            </svg>
          </div>
          <div>
            <p className="text-white/40 text-xs">Auto-generated trigger word</p>
            <p className="text-cyan-300 text-sm font-mono font-medium">{triggerWord}</p>
          </div>
        </div>
      )}

      <ConsentBlock agreed={consentAgreed} onConsent={onConsentChange} />
    </div>
  );
}

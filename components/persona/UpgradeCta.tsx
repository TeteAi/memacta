"use client";

import { useState } from "react";
import PersonaStatusBadge from "./PersonaStatusBadge";

interface UpgradeCtaProps {
  personaId: string;
  status: "DRAFT" | "READY" | "TRAINING" | "FAILED";
  tier: "INSTANT" | "PREMIUM";
  canUpgrade: boolean;
  blockReason?: string;
  onUpgradeStarted?: () => void;
}

export default function UpgradeCta({
  personaId,
  status,
  tier,
  canUpgrade,
  blockReason,
  onUpgradeStarted,
}: UpgradeCtaProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (tier === "PREMIUM") return null;

  async function handleUpgrade() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/persona/${personaId}/upgrade-premium`, {
        method: "POST",
      });
      const data = await res.json() as { error?: string; reason?: string };
      if (!res.ok) {
        setError(data.reason ?? data.error ?? "Upgrade failed");
      } else {
        onUpgradeStarted?.();
      }
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  const isTraining = status === "TRAINING";

  return (
    <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-[#fe2c55]/10 to-[#ff9f40]/10 overflow-hidden">
      {/* Gradient header bar */}
      <div className="h-1 bg-gradient-to-r from-[#fe2c55] to-[#ff9f40]" />

      <div className="p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-white font-semibold">Upgrade to Premium</h3>
          <PersonaStatusBadge status={isTraining ? "TRAINING" : status} />
        </div>

        <p className="text-white/60 text-sm leading-relaxed">
          Train a dedicated model on your photos using LoRA fine-tuning.
          Get <span className="text-white font-medium">92-98% identity match</span> and
          consistent results across all styles.
          <span className="text-white/40"> ~15 min. 1 free train on Free plan.</span>
        </p>

        {isTraining ? (
          <div className="flex items-center gap-3 py-2">
            <div className="w-4 h-4 rounded-full border-2 border-amber-400 border-t-transparent animate-spin flex-shrink-0" />
            <span className="text-amber-300 text-sm font-medium">Training in progress... (~15 min)</span>
          </div>
        ) : (
          <>
            {error && (
              <div className="rounded-lg bg-red-500/10 border border-red-500/20 px-3 py-2 text-red-400 text-xs">
                {error === "lifetime_limit"
                  ? "You've used your 1 free premium training. Upgrade your plan for more."
                  : error === "cooling_period"
                  ? "Please wait 24 hours after signing up before training."
                  : error === "email_unverified"
                  ? "Please verify your email first."
                  : error}
              </div>
            )}

            <button
              type="button"
              onClick={handleUpgrade}
              disabled={loading || !canUpgrade || status !== "READY"}
              title={
                !canUpgrade
                  ? blockReason === "lifetime_limit"
                    ? "Upgrade your plan for more premium trains"
                    : blockReason === "cooling_period"
                    ? "Wait 24 hours after signup"
                    : blockReason
                  : undefined
              }
              className="w-full py-3 rounded-xl bg-gradient-to-r from-[#fe2c55] to-[#ff9f40] text-white font-bold text-sm hover:opacity-90 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {loading ? "Starting training..." : "Start Premium Training"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}

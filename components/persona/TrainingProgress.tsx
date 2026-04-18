"use client";

import { useState, useEffect, useCallback } from "react";
import PersonaTierBadge from "./PersonaTierBadge";

interface TrainingProgressProps {
  personaId: string;
  initialStatus: string;
  initialTier: string;
  onCompleted?: (loraUrl: string) => void;
}

export default function TrainingProgress({
  personaId,
  initialStatus,
  initialTier,
  onCompleted,
}: TrainingProgressProps) {
  const [status, setStatus] = useState(initialStatus);
  const [tier, setTier] = useState(initialTier);

  const poll = useCallback(async () => {
    try {
      const res = await fetch(`/api/persona/${personaId}`);
      if (!res.ok) return;
      const data = await res.json() as { status: string; tier: string; loraUrl?: string };
      setStatus(data.status);
      setTier(data.tier);
      if (data.status === "READY" && data.tier === "PREMIUM" && data.loraUrl) {
        onCompleted?.(data.loraUrl);
      }
    } catch {
      // ignore
    }
  }, [personaId, onCompleted]);

  useEffect(() => {
    if (status !== "TRAINING") return;

    // Poll every 10 seconds
    const interval = setInterval(poll, 10_000);
    return () => clearInterval(interval);
  }, [status, poll]);

  if (status === "TRAINING") {
    return (
      <div className="flex items-center gap-3 py-2">
        <div className="w-4 h-4 rounded-full border-2 border-amber-400 border-t-transparent animate-spin flex-shrink-0" />
        <div>
          <p className="text-amber-300 text-sm font-medium">Training in progress</p>
          <p className="text-white/40 text-xs">Typically 15-20 minutes. This page will update automatically.</p>
        </div>
      </div>
    );
  }

  if (status === "READY" && tier === "PREMIUM") {
    return (
      <div className="flex items-center gap-2">
        <span className="text-emerald-400 text-sm font-medium">Training complete!</span>
        <PersonaTierBadge tier="PREMIUM" />
      </div>
    );
  }

  if (status === "FAILED") {
    return (
      <div className="text-red-400 text-sm">
        Training failed. Please try again or contact support.
      </div>
    );
  }

  return null;
}

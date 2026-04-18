"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface TakedownDialogProps {
  personaId: string;
  personaName: string;
  onClose: () => void;
}

export default function TakedownDialog({ personaId, personaName, onClose }: TakedownDialogProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function handleTakedown() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/persona/${personaId}/takedown`, { method: "POST" });
      const data = await res.json() as { error?: string };
      if (!res.ok) {
        setError(data.error ?? "Takedown failed");
      } else {
        router.push("/personas");
      }
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-sm rounded-2xl bg-[#181828] border border-white/10 p-6 shadow-2xl space-y-4">
        <h2 className="text-white font-bold text-lg">Request Takedown</h2>
        <p className="text-white/60 text-sm">
          This will archive the persona <span className="text-white font-medium">{personaName}</span> and
          remove it from your library. This action cannot be undone immediately — contact support to restore.
        </p>

        {error && (
          <div className="rounded-lg bg-red-500/10 border border-red-500/20 px-3 py-2 text-red-400 text-xs">
            {error}
          </div>
        )}

        <div className="flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border border-white/20 text-white text-sm hover:bg-white/10 transition-all"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleTakedown}
            disabled={loading}
            className="flex-1 py-2.5 rounded-xl bg-red-500/80 text-white text-sm font-semibold hover:bg-red-500 transition-all disabled:opacity-50"
          >
            {loading ? "Processing..." : "Archive Persona"}
          </button>
        </div>
      </div>
    </div>
  );
}

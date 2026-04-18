"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import TakedownDialog from "@/components/persona/TakedownDialog";

interface PersonaDetailClientProps {
  personaId: string;
  userId: string;
  children: React.ReactNode;
}

export default function PersonaDetailClient({ personaId, userId, children }: PersonaDetailClientProps) {
  const [showTakedown, setShowTakedown] = useState(false);
  const router = useRouter();

  async function handleDelete() {
    if (!confirm("Delete this persona? This cannot be undone.")) return;
    const res = await fetch(`/api/persona/${personaId}`, { method: "DELETE" });
    if (res.ok) {
      router.push("/personas");
    }
  }

  // Clone children and inject onDelete handler if it's PersonaDetailHeader
  return (
    <>
      {/* We can't pass onDelete directly into server-rendered children without a wrapper */}
      <div className="relative">
        {children}
        {/* Floating action buttons */}
        <div className="absolute top-4 right-4 flex items-center gap-2 z-10">
          <button
            type="button"
            onClick={() => setShowTakedown(true)}
            className="px-3 py-1.5 rounded-lg border border-white/10 text-white/50 text-xs hover:text-white hover:border-white/30 transition-all bg-black/40 backdrop-blur-sm"
          >
            Takedown Request
          </button>
          <button
            type="button"
            onClick={handleDelete}
            className="px-3 py-1.5 rounded-lg border border-red-500/20 text-red-400/70 text-xs hover:text-red-400 hover:border-red-500/40 transition-all bg-black/40 backdrop-blur-sm"
          >
            Delete
          </button>
        </div>
      </div>

      {showTakedown && (
        <TakedownDialog
          personaId={personaId}
          personaName="this persona"
          onClose={() => setShowTakedown(false)}
        />
      )}
    </>
  );
}

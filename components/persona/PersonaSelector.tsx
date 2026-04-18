"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface PersonaOption {
  id: string;
  name: string;
  tier: "INSTANT" | "PREMIUM";
  triggerWord: string;
  primaryPhotoUrl?: string | null;
  coverImageUrl?: string | null;
}

interface PersonaSelectorProps {
  selectedPersonaId: string | null;
  onSelect: (personaId: string | null) => void;
}

export default function PersonaSelector({ selectedPersonaId, onSelect }: PersonaSelectorProps) {
  const [personas, setPersonas] = useState<PersonaOption[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/persona")
      .then((r) => r.json())
      .then((data: unknown) => {
        if (Array.isArray(data)) {
          // Filter to only READY personas
          const ready = (data as Array<{ status: string } & PersonaOption>).filter(
            (p) => p.status === "READY"
          );
          setPersonas(ready);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-white/40 text-sm">
        <div className="w-3 h-3 rounded-full border border-white/30 border-t-transparent animate-spin" />
        Loading personas...
      </div>
    );
  }

  if (personas.length === 0) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-white/40 text-sm">No personas yet.</span>
        <Link
          href="/personas/new"
          className="text-pink-400 hover:text-pink-300 text-sm underline underline-offset-2 transition-colors"
        >
          Create one
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-white/70 text-sm font-medium">Identity (Persona)</span>
      <div className="flex flex-wrap gap-2">
        {/* None chip */}
        <button
          type="button"
          onClick={() => onSelect(null)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all border ${
            selectedPersonaId === null
              ? "bg-white/20 text-white border-white/30"
              : "bg-white/5 text-white/50 border-white/10 hover:border-white/20 hover:text-white/70"
          }`}
        >
          None
        </button>

        {/* Persona chips */}
        {personas.map((persona) => {
          const isSelected = selectedPersonaId === persona.id;
          return (
            <button
              key={persona.id}
              type="button"
              onClick={() => onSelect(isSelected ? null : persona.id)}
              className={`relative flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all border ${
                isSelected
                  ? "bg-gradient-to-r from-[#fe2c55]/20 to-[#ff9f40]/20 text-white border-[#fe2c55]/50 shadow-[0_0_12px_rgba(254,44,85,0.25)]"
                  : "bg-white/5 text-white/70 border-white/10 hover:border-white/30 hover:text-white"
              }`}
            >
              {(persona.primaryPhotoUrl ?? persona.coverImageUrl) && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={persona.primaryPhotoUrl ?? persona.coverImageUrl ?? ""}
                  alt={persona.name}
                  className="w-4 h-4 rounded-full object-cover flex-shrink-0"
                />
              )}
              <span>{persona.name}</span>
              {persona.tier === "PREMIUM" && (
                <span className="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-[#fe2c55] to-[#ff9f40] flex-shrink-0" />
              )}
              {isSelected && (
                <span className="absolute inset-0 rounded-full ring-1 ring-[#fe2c55]/40 pointer-events-none" />
              )}
            </button>
          );
        })}

        {/* Add new chip */}
        <Link
          href="/personas/new"
          className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium bg-white/5 text-white/40 border border-dashed border-white/20 hover:text-white/60 hover:border-white/30 transition-all"
        >
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          New
        </Link>
      </div>
    </div>
  );
}

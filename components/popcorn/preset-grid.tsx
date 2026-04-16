"use client";

import { useState } from "react";
import { POPCORN_PRESETS, type PopcornPreset } from "@/lib/popcorn";

interface PresetGridProps {
  selectedId: string | null;
  onSelect: (id: string) => void;
}

export default function PresetGrid({ selectedId, onSelect }: PresetGridProps) {
  const [showAll, setShowAll] = useState(false);

  const visiblePresets = showAll ? POPCORN_PRESETS : POPCORN_PRESETS.slice(0, 4);

  return (
    <div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {visiblePresets.map((preset) => (
          <PresetCard
            key={preset.id}
            preset={preset}
            selected={selectedId === preset.id}
            onSelect={onSelect}
          />
        ))}
      </div>

      {!showAll && POPCORN_PRESETS.length > 4 && (
        <button
          type="button"
          onClick={() => setShowAll(true)}
          className="mt-3 text-sm text-white/50 hover:text-white transition-colors underline"
        >
          See all {POPCORN_PRESETS.length} presets &rarr;
        </button>
      )}
      {showAll && (
        <button
          type="button"
          onClick={() => setShowAll(false)}
          className="mt-3 text-sm text-white/50 hover:text-white transition-colors underline"
        >
          Show less
        </button>
      )}
    </div>
  );
}

function PresetCard({
  preset,
  selected,
  onSelect,
}: {
  preset: PopcornPreset;
  selected: boolean;
  onSelect: (id: string) => void;
}) {
  return (
    <button
      type="button"
      data-testid="preset-card"
      data-preset-id={preset.id}
      aria-pressed={selected ? "true" : "false"}
      onClick={() => onSelect(preset.id)}
      className={`relative rounded-xl overflow-hidden border transition-all text-left ${
        selected
          ? "border-fuchsia-500/60 ring-2 ring-fuchsia-500/30"
          : "border-white/15 hover:border-white/30"
      }`}
    >
      {/* Gradient thumb */}
      <div
        className={`h-20 w-full bg-gradient-to-br ${preset.gradientClass} ${
          selected ? "opacity-100" : "opacity-70"
        }`}
      />

      {/* Selected overlay */}
      {selected && (
        <div className="absolute inset-0 bg-brand-gradient opacity-20 pointer-events-none" />
      )}

      <div className="p-2 bg-[#181828]">
        <p className="text-white text-xs font-semibold leading-tight truncate">{preset.name}</p>
        <p className="text-white/40 text-[10px] mt-0.5 truncate">{preset.tagline}</p>
        <p className="text-white/30 text-[10px] mt-0.5">{preset.durationSec}s</p>
      </div>
    </button>
  );
}

"use client";

import { MIXED_MEDIA_STYLES } from "@/lib/mixed-media";

interface StylePresetGridProps {
  selectedIds: string[];
  onToggle: (id: string) => void;
  disabledIds?: string[];
}

export default function StylePresetGrid({
  selectedIds,
  onToggle,
  disabledIds = [],
}: StylePresetGridProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
      {MIXED_MEDIA_STYLES.map((style) => {
        const isActive = selectedIds.includes(style.id);
        const isDisabled =
          disabledIds.includes(style.id) ||
          (!isActive && selectedIds.length >= 3);
        return (
          <button
            key={style.id}
            type="button"
            data-testid="style-tile"
            data-style-id={style.id}
            data-active={isActive}
            aria-pressed={isActive}
            disabled={isDisabled}
            onClick={() => onToggle(style.id)}
            className={`relative overflow-hidden rounded-xl p-3 text-left transition-all
              bg-gradient-to-br ${style.gradientClass}
              ${isActive ? "ring-2 ring-fuchsia-400 shadow-lg shadow-fuchsia-400/20" : "opacity-80 hover:opacity-100"}
              ${isDisabled && !isActive ? "opacity-30 cursor-not-allowed" : "cursor-pointer"}
            `}
          >
            <p className="font-semibold text-white text-sm leading-tight">{style.name}</p>
            <p className="text-white/70 text-[11px] mt-0.5 leading-tight">{style.tagline}</p>
            {isActive && (
              <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-white/20 flex items-center justify-center">
                <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

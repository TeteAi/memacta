"use client";

import { COPILOT_STARTERS } from "@/lib/copilot";

interface StarterGridProps {
  onSelect: (prompt: string, intent: string) => void;
}

export default function StarterGrid({ onSelect }: StarterGridProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
      {COPILOT_STARTERS.map((starter) => (
        <button
          key={starter.intent}
          type="button"
          data-testid="starter-card"
          data-intent={starter.intent}
          onClick={() => onSelect(starter.prompt, starter.intent)}
          className="text-left px-4 py-3 rounded-xl bg-[#181828] border border-white/15 hover:border-white/25 hover:bg-white/5 transition-all group"
        >
          <span className="text-white/80 text-sm font-medium group-hover:text-white transition-colors">
            {starter.label}
          </span>
          <p className="text-white/40 text-xs mt-1 leading-relaxed line-clamp-2">
            {starter.prompt}
          </p>
        </button>
      ))}
    </div>
  );
}

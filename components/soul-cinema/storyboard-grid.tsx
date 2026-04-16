"use client";

import type { SoulCinemaScene } from "@/lib/soul-cinema";

interface StoryboardGridProps {
  scenes: SoulCinemaScene[];
  loading: boolean;
  onRegenerate: () => void;
}

export default function StoryboardGrid({ scenes, loading, onRegenerate }: StoryboardGridProps) {
  if (loading) {
    return (
      <div className="flex flex-wrap gap-3">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="flex-1 min-w-[120px] max-w-[200px] h-24 rounded-xl bg-[#1e1e32] animate-pulse border border-white/10"
          />
        ))}
      </div>
    );
  }

  if (scenes.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-white/15 bg-[#1e1e32]/40 px-6 py-8 text-center">
        <p className="text-white/30 text-sm">
          Fill in your story details above to auto-generate the storyboard.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3">
        {scenes.map((scene) => (
          <div
            key={scene.sceneNumber}
            data-testid="storyboard-tile"
            className="flex-1 min-w-[130px] max-w-[220px] rounded-xl border border-white/15 bg-[#1e1e32] p-3 space-y-1.5"
          >
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-bold text-fuchsia-400 uppercase tracking-wider">
                Scene {scene.sceneNumber}
              </span>
            </div>
            <p className="text-[12px] text-white/70 leading-snug line-clamp-3">
              {scene.beat}
            </p>
          </div>
        ))}
      </div>

      <button
        type="button"
        data-testid="regenerate-beats-btn"
        onClick={onRegenerate}
        className="inline-flex items-center gap-2 text-xs text-white/50 hover:text-white transition-colors bg-white/5 hover:bg-white/10 rounded-lg px-3 py-1.5 border border-white/10"
      >
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
        </svg>
        Regenerate beats
      </button>
    </div>
  );
}

"use client";

import LookbookTile, { ShotState } from "./lookbook-tile";

interface LookbookGridProps {
  shots: ShotState[];
  outfitLabels: string[];
  onRetry: (index: number) => void;
}

export default function LookbookGrid({
  shots,
  outfitLabels,
  onRetry,
}: LookbookGridProps) {
  if (shots.length === 0) return null;

  return (
    <div data-testid="lookbook-grid" className="space-y-3">
      <h2 className="text-white font-semibold text-sm">
        Results{" "}
        <span className="text-white/40 font-normal text-xs">
          ({shots.filter((s) => s.status === "succeeded").length} /
          {shots.length} completed)
        </span>
      </h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {shots.map((shot, i) => (
          <LookbookTile
            key={i}
            index={i}
            shot={shot}
            outfitLabel={outfitLabels[i] ?? `Outfit ${i + 1}`}
            onRetry={onRetry}
          />
        ))}
      </div>
    </div>
  );
}

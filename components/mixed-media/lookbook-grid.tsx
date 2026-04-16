"use client";

import MixedMediaTile, { type MixedMediaResult } from "./mixed-media-tile";

interface LookbookGridProps {
  results: MixedMediaResult[];
  onRetry: (blendId: string, variationIndex: number) => void;
}

export default function LookbookGrid({ results, onRetry }: LookbookGridProps) {
  if (results.length === 0) return null;
  return (
    <div data-testid="lookbook-grid" className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
      {results.map((r) => (
        <MixedMediaTile
          key={`${r.blendId}-${r.variationIndex}`}
          result={r}
          onRetry={onRetry}
        />
      ))}
    </div>
  );
}

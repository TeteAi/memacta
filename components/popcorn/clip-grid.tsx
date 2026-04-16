"use client";

import ClipTile, { type ClipTileState } from "./clip-tile";

interface ClipGridProps {
  clips: ClipTileState[];
  onRetry: (index: number) => void;
}

export default function ClipGrid({ clips, onRetry }: ClipGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {clips.map((clip, i) => (
        <ClipTile
          key={`${clip.seed}-${i}`}
          tile={clip}
          index={i}
          onRetry={onRetry}
        />
      ))}
    </div>
  );
}

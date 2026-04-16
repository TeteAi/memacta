"use client";

import ReelTile, { type ReelTileState } from "./reel-tile";
import type { SoulCinemaScene } from "@/lib/soul-cinema";

interface ReelGridProps {
  tiles: ReelTileState[];
  scenes: SoulCinemaScene[];
  onRetry: (index: number) => void;
}

export default function ReelGrid({ tiles, scenes, onRetry }: ReelGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
      {tiles.map((tile, idx) => (
        <ReelTile
          key={idx}
          index={idx}
          tile={tile}
          sceneNumber={scenes[idx]?.sceneNumber ?? idx + 1}
          beat={scenes[idx]?.beat ?? ""}
          onRetry={onRetry}
        />
      ))}
    </div>
  );
}

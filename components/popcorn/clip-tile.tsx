"use client";

export type ClipStatus = "idle" | "running" | "succeeded" | "failed";

export interface ClipTileState {
  status: ClipStatus;
  url?: string;
  error?: string;
  seed: number;
}

interface ClipTileProps {
  tile: ClipTileState;
  index: number;
  onRetry: (index: number) => void;
}

export default function ClipTile({ tile, index, onRetry }: ClipTileProps) {
  return (
    <div
      data-testid="clip-tile"
      data-seed={tile.seed}
      data-status={tile.status}
      className="aspect-[9/16] rounded-xl overflow-hidden bg-[#181828] border border-white/15 relative flex items-center justify-center"
    >
      {tile.status === "idle" && (
        <div className="text-center p-4">
          <div className="w-10 h-10 mx-auto rounded-full bg-white/5 flex items-center justify-center mb-2">
            <svg className="w-5 h-5 text-white/20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z" />
            </svg>
          </div>
          <p className="text-white/20 text-xs">Clip {index + 1}</p>
        </div>
      )}

      {tile.status === "running" && (
        <div className="text-center p-4">
          <div className="w-10 h-10 mx-auto rounded-full border-2 border-fuchsia-500/30 border-t-fuchsia-500 animate-spin mb-2" />
          <p className="text-white/50 text-xs">Generating…</p>
          <p className="text-white/25 text-[10px] mt-1">Seed #{tile.seed}</p>
        </div>
      )}

      {tile.status === "succeeded" && tile.url && (
        <>
          <video
            src={tile.url}
            autoPlay
            muted
            loop
            playsInline
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute bottom-2 right-2 flex gap-1.5">
            <a
              href={tile.url}
              download={`popcorn-clip-${tile.seed}.mp4`}
              className="px-2.5 py-1 rounded-lg bg-black/60 text-white text-xs font-medium hover:bg-black/80 transition-colors border border-white/20"
              onClick={(e) => e.stopPropagation()}
            >
              Save
            </a>
          </div>
          <div className="absolute top-2 left-2">
            <span className="px-2 py-0.5 rounded-full bg-black/60 text-white/60 text-[10px]">
              #{tile.seed}
            </span>
          </div>
        </>
      )}

      {tile.status === "failed" && (
        <div className="text-center p-4">
          <div className="w-10 h-10 mx-auto rounded-full bg-red-500/10 flex items-center justify-center mb-2">
            <svg className="w-5 h-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
            </svg>
          </div>
          <p className="text-red-400 text-xs mb-2">{tile.error || "Generation failed"}</p>
          <button
            type="button"
            data-testid="retry-clip-btn"
            onClick={() => onRetry(index)}
            className="px-3 py-1.5 rounded-lg bg-fuchsia-500/20 text-fuchsia-300 text-xs font-medium hover:bg-fuchsia-500/30 transition-colors border border-fuchsia-500/30"
          >
            Retry
          </button>
        </div>
      )}
    </div>
  );
}

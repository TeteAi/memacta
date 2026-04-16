"use client";

export type ReelTileStatus = "idle" | "running" | "succeeded" | "failed";

export interface ReelTileState {
  status: ReelTileStatus;
  url?: string;
  error?: string;
}

interface ReelTileProps {
  index: number;
  tile: ReelTileState;
  sceneNumber: number;
  beat: string;
  onRetry: (index: number) => void;
}

export default function ReelTile({ index, tile, sceneNumber, beat, onRetry }: ReelTileProps) {
  return (
    <div
      data-testid={`reel-tile-${index}`}
      data-status={tile.status}
      className="rounded-xl border border-white/15 bg-[#181828] overflow-hidden"
    >
      {/* Preview area */}
      <div className="aspect-video relative min-h-[90px]">
        {tile.status === "succeeded" && tile.url ? (
          <video
            src={tile.url}
            className="w-full h-full object-cover"
            controls
            playsInline
            preload="metadata"
          />
        ) : tile.status === "running" ? (
          <div className="w-full h-full flex items-center justify-center bg-[#1e1e32]">
            <div className="text-center">
              <div className="w-8 h-8 mx-auto rounded-full border-2 border-fuchsia-500 border-t-transparent animate-spin mb-2" />
              <p className="text-white/40 text-[11px]">Generating…</p>
            </div>
          </div>
        ) : tile.status === "failed" ? (
          <div className="w-full h-full flex items-center justify-center bg-[#1e1e32] min-h-[90px]">
            <div className="text-center px-3">
              <div className="w-8 h-8 mx-auto rounded-full bg-[#FE2C55]/15 flex items-center justify-center mb-2">
                <svg className="w-4 h-4 text-[#FE2C55]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                </svg>
              </div>
              <p className="text-[#FE2C55] text-[11px] mb-1 line-clamp-1">{tile.error || "Failed"}</p>
            </div>
          </div>
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-[#1e1e32] min-h-[90px]">
            <div className="text-center">
              <div className="w-8 h-8 mx-auto rounded-full border border-white/10 flex items-center justify-center mb-1.5">
                <svg className="w-4 h-4 text-white/30" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z" />
                </svg>
              </div>
              <p className="text-white/20 text-[11px]">Scene {sceneNumber}</p>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-3 py-2 flex items-start justify-between gap-2">
        <div className="min-w-0">
          <span className="text-[10px] text-fuchsia-400 font-bold uppercase tracking-wider">Scene {sceneNumber}</span>
          <p className="text-[11px] text-white/50 line-clamp-2 mt-0.5">{beat}</p>
        </div>

        <div className="flex items-center gap-1.5 flex-shrink-0 mt-0.5">
          {tile.status === "succeeded" && tile.url && (
            <a
              href={tile.url}
              download={`memacta-scene-${sceneNumber}-${Date.now()}.mp4`}
              target="_blank"
              rel="noopener noreferrer"
              data-testid={`reel-download-${index}`}
              className="inline-flex items-center gap-1 text-[11px] text-white/60 hover:text-white transition-colors bg-white/5 hover:bg-white/10 rounded-lg px-2 py-1"
            >
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
              </svg>
              DL
            </a>
          )}

          {tile.status === "failed" && (
            <button
              type="button"
              onClick={() => onRetry(index)}
              data-testid={`reel-retry-${index}`}
              className="inline-flex items-center gap-1 text-[11px] text-fuchsia-400 hover:text-fuchsia-300 transition-colors bg-fuchsia-500/10 hover:bg-fuchsia-500/20 rounded-lg px-2 py-1 border border-fuchsia-500/20"
            >
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
              </svg>
              Retry
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

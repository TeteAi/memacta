"use client";

export type MixedMediaResult = {
  blendId: string;
  variationIndex: number;
  status: "pending" | "running" | "succeeded" | "failed";
  mediaUrl?: string;
  error?: string;
  mediaType: "image" | "video";
  styleNames: string[];
};

interface MixedMediaTileProps {
  result: MixedMediaResult;
  onRetry: (blendId: string, variationIndex: number) => void;
}

export default function MixedMediaTile({ result, onRetry }: MixedMediaTileProps) {
  const label = result.styleNames.join(" x ");

  return (
    <div
      data-testid="lookbook-tile"
      data-status={result.status}
      data-blend-id={result.blendId}
      data-media-url={result.mediaUrl ?? ""}
      className="rounded-xl bg-[#181828] border border-white/15 overflow-hidden"
    >
      <div className="relative aspect-square bg-[#0e0e1a] flex items-center justify-center min-h-[160px]">
        {result.status === "pending" || result.status === "running" ? (
          <div className="flex flex-col items-center gap-2">
            <div className="w-8 h-8 rounded-full border-2 border-fuchsia-400 border-t-transparent animate-spin" />
            <span className="text-xs text-white/40">Generating…</span>
          </div>
        ) : result.status === "succeeded" && result.mediaUrl ? (
          result.mediaType === "video" ? (
            <video
              src={result.mediaUrl}
              autoPlay
              muted
              loop
              playsInline
              className="w-full h-full object-cover"
            />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={result.mediaUrl}
              alt={label}
              className="w-full h-full object-cover"
            />
          )
        ) : result.status === "failed" ? (
          <div className="flex flex-col items-center gap-3 px-4 text-center">
            <svg className="w-8 h-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
            </svg>
            <p className="text-xs text-white/50">{result.error || "Generation failed"}</p>
            <button
              type="button"
              data-testid="retry-btn"
              onClick={() => onRetry(result.blendId, result.variationIndex)}
              className="text-xs px-3 py-1.5 rounded-lg bg-fuchsia-500/20 text-fuchsia-300 border border-fuchsia-400/30 hover:bg-fuchsia-500/30 transition-colors"
            >
              Retry
            </button>
          </div>
        ) : null}
      </div>
      <div className="p-3">
        <p className="text-xs text-white/50 truncate">{label}</p>
        <p className="text-[10px] text-white/30">Variation {result.variationIndex + 1}</p>
      </div>
    </div>
  );
}

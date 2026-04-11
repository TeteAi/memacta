"use client";

export type Clip = {
  id: string;
  prompt: string;
  model: string;
  resultUrl?: string;
  durationSec: number;
  order: number;
};

type Props = {
  clips: Clip[];
  onDelete: (id: string) => void;
  onMove: (id: string, direction: "up" | "down") => void;
};

export default function Timeline({ clips, onDelete, onMove }: Props) {
  const sorted = [...clips].sort((a, b) => a.order - b.order);
  return (
    <div
      data-testid="timeline"
      className="flex gap-3 overflow-x-auto border border-white/10 rounded-xl bg-[#0e0e1a] p-4 min-h-[140px]"
    >
      {sorted.length === 0 ? (
        <p className="text-white/40 text-sm">No clips yet. Add one below to start building your sequence.</p>
      ) : (
        sorted.map((clip) => (
          <div
            key={clip.id}
            data-testid={`clip-${clip.id}`}
            className="flex-shrink-0 w-48 rounded-xl border border-white/10 bg-[#1a1a2e] p-3 flex flex-col gap-1.5 hover:border-purple-500/30 transition-colors"
          >
            {clip.resultUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={clip.resultUrl}
                alt={clip.prompt}
                className="w-full h-20 object-cover rounded"
              />
            ) : (
              <div className="w-full h-20 bg-white/5 rounded-lg flex items-center justify-center text-white/20 text-xs">No preview</div>
            )}
            <p className="text-xs truncate" title={clip.prompt}>
              {clip.prompt}
            </p>
            <p className="text-[10px] text-white/40">
              {clip.model} · {clip.durationSec}s
            </p>
            <div className="flex gap-1 mt-1">
              <button
                type="button"
                aria-label={`Move ${clip.prompt} up`}
                onClick={() => onMove(clip.id, "up")}
                className="text-xs border border-white/10 rounded-lg px-1.5 py-0.5 text-white/50 hover:bg-white/10 hover:text-white transition-colors"
              >
                ↑
              </button>
              <button
                type="button"
                aria-label={`Move ${clip.prompt} down`}
                onClick={() => onMove(clip.id, "down")}
                className="text-xs border border-white/10 rounded-lg px-1.5 py-0.5 text-white/50 hover:bg-white/10 hover:text-white transition-colors"
              >
                ↓
              </button>
              <button
                type="button"
                aria-label={`Delete ${clip.prompt}`}
                onClick={() => onDelete(clip.id)}
                className="text-xs border border-red-500/20 rounded-lg px-1.5 py-0.5 ml-auto text-red-400 hover:bg-red-500/10 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
}

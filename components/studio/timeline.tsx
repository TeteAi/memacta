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
      className="flex gap-3 overflow-x-auto border border-border rounded-lg bg-card p-3 min-h-[140px]"
    >
      {sorted.length === 0 ? (
        <p className="text-muted-foreground text-sm">No clips yet. Add one below.</p>
      ) : (
        sorted.map((clip) => (
          <div
            key={clip.id}
            data-testid={`clip-${clip.id}`}
            className="flex-shrink-0 w-48 rounded-md border border-border bg-background p-2 flex flex-col gap-1"
          >
            {clip.resultUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={clip.resultUrl}
                alt={clip.prompt}
                className="w-full h-20 object-cover rounded"
              />
            ) : (
              <div className="w-full h-20 bg-muted rounded" />
            )}
            <p className="text-xs truncate" title={clip.prompt}>
              {clip.prompt}
            </p>
            <p className="text-[10px] text-muted-foreground">
              {clip.model} · {clip.durationSec}s
            </p>
            <div className="flex gap-1 mt-1">
              <button
                type="button"
                aria-label={`Move ${clip.prompt} up`}
                onClick={() => onMove(clip.id, "up")}
                className="text-xs border rounded px-1"
              >
                ↑
              </button>
              <button
                type="button"
                aria-label={`Move ${clip.prompt} down`}
                onClick={() => onMove(clip.id, "down")}
                className="text-xs border rounded px-1"
              >
                ↓
              </button>
              <button
                type="button"
                aria-label={`Delete ${clip.prompt}`}
                onClick={() => onDelete(clip.id)}
                className="text-xs border rounded px-1 ml-auto text-red-400"
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

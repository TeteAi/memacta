"use client";

interface OutputSettingsProps {
  mediaType: "image" | "video";
  onMediaTypeChange: (v: "image" | "video") => void;
  aspectRatio: "1:1" | "16:9" | "9:16";
  onAspectRatioChange: (v: "1:1" | "16:9" | "9:16") => void;
  variationsPerBlend: 1 | 2 | 3;
  onVariationsChange: (v: 1 | 2 | 3) => void;
}

function SegmentBtn<T extends string | number>({
  value,
  current,
  label,
  onChange,
}: {
  value: T;
  current: T;
  label: string;
  onChange: (v: T) => void;
}) {
  const active = value === current;
  return (
    <button
      type="button"
      onClick={() => onChange(value)}
      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
        active
          ? "bg-fuchsia-500/30 text-fuchsia-200 border border-fuchsia-400/40"
          : "text-white/50 hover:text-white/80 border border-white/15 hover:border-white/25"
      }`}
    >
      {label}
    </button>
  );
}

export default function OutputSettings({
  mediaType,
  onMediaTypeChange,
  aspectRatio,
  onAspectRatioChange,
  variationsPerBlend,
  onVariationsChange,
}: OutputSettingsProps) {
  return (
    <div data-testid="output-settings" className="space-y-4">
      <div>
        <p className="text-xs font-semibold text-white/50 uppercase tracking-wider mb-2">Media type</p>
        <div className="flex gap-2">
          <SegmentBtn value="image" current={mediaType} label="Image" onChange={onMediaTypeChange} />
          <SegmentBtn value="video" current={mediaType} label="Video" onChange={onMediaTypeChange} />
        </div>
      </div>

      <div>
        <p className="text-xs font-semibold text-white/50 uppercase tracking-wider mb-2">Aspect ratio</p>
        <div className="flex gap-2">
          <SegmentBtn value="1:1" current={aspectRatio} label="1:1" onChange={onAspectRatioChange} />
          <SegmentBtn value="16:9" current={aspectRatio} label="16:9" onChange={onAspectRatioChange} />
          <SegmentBtn value="9:16" current={aspectRatio} label="9:16" onChange={onAspectRatioChange} />
        </div>
      </div>

      <div>
        <p className="text-xs font-semibold text-white/50 uppercase tracking-wider mb-2">Variations per blend</p>
        <div className="flex gap-2">
          <SegmentBtn value={1 as 1 | 2 | 3} current={variationsPerBlend} label="1" onChange={onVariationsChange} />
          <SegmentBtn value={2 as 1 | 2 | 3} current={variationsPerBlend} label="2" onChange={onVariationsChange} />
          <SegmentBtn value={3 as 1 | 2 | 3} current={variationsPerBlend} label="3" onChange={onVariationsChange} />
        </div>
      </div>
    </div>
  );
}

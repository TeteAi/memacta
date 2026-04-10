"use client";

const PRESETS = ["Cinematic", "Anime", "Photoreal", "Documentary", "Dreamy", "Neon noir"];

type Props = {
  value: string;
  onChange: (v: string) => void;
};

export default function PromptBox({ value, onChange }: Props) {
  const applyPreset = (preset: string) => {
    const styleStr = `${preset.toLowerCase()} style`;
    if (value.toLowerCase().includes(styleStr)) return;
    const next = value + (value ? ", " : "") + styleStr;
    onChange(next);
  };
  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm text-muted-foreground" htmlFor="prompt-box">
        Prompt
      </label>
      <textarea
        id="prompt-box"
        rows={3}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="bg-card border border-border rounded-lg p-3 w-full"
        placeholder="Describe your scene..."
      />
      <div className="flex flex-wrap gap-2">
        {PRESETS.map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => applyPreset(p)}
            className="rounded-full border px-3 py-1 text-xs hover:bg-accent"
          >
            {p}
          </button>
        ))}
      </div>
    </div>
  );
}

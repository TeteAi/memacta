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
      <label className="text-white/70 text-sm font-medium" htmlFor="prompt-box">
        Prompt
      </label>
      <textarea
        id="prompt-box"
        rows={3}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="bg-[#1e1e32] border border-white/15 rounded-xl p-4 w-full text-white placeholder:text-white/50 focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/30 outline-none resize-none"
        placeholder="Describe your scene..."
      />
      <div className="flex flex-wrap gap-2">
        {PRESETS.map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => applyPreset(p)}
            className="rounded-full bg-white/15 px-3 py-1.5 text-xs text-white/70 hover:bg-white/25 hover:text-white transition-all"
          >
            {p}
          </button>
        ))}
      </div>
    </div>
  );
}

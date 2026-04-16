"use client";

const MAX_CHARS = 140;

interface SubjectInputProps {
  value: string;
  onChange: (value: string) => void;
}

export default function SubjectInput({ value, onChange }: SubjectInputProps) {
  const remaining = MAX_CHARS - value.length;
  const isOver = remaining < 0;

  return (
    <div className="space-y-1">
      <label className="text-white/60 text-xs font-medium block">
        Subject (e.g. &ldquo;a 22-yo skateboarder with cherry-red hair&rdquo;)
      </label>
      <textarea
        data-testid="subject-prompt"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={2}
        maxLength={MAX_CHARS + 20}
        placeholder="a 22-yo skateboarder with cherry-red hair..."
        className="w-full rounded-xl border border-white/15 bg-[#1e1e32] px-3 py-2.5 text-sm text-white placeholder:text-white/30 focus:border-fuchsia-500/50 focus:ring-1 focus:ring-fuchsia-500/30 outline-none resize-none"
      />
      <p
        className={`text-right text-[11px] ${
          isOver ? "text-[#FE2C55]" : remaining <= 20 ? "text-yellow-400" : "text-white/30"
        }`}
      >
        {remaining} characters remaining
      </p>
    </div>
  );
}

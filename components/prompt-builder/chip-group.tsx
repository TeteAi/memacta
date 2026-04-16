"use client";

interface ChipGroupProps {
  label: string;
  options: readonly string[];
  selected: string | null;
  onSelect: (value: string | null) => void;
  testId?: string;
}

export default function ChipGroup({
  label,
  options,
  selected,
  onSelect,
  testId,
}: ChipGroupProps) {
  return (
    <div data-testid={testId}>
      <p className="text-sm font-semibold text-white/80 mb-2">{label}</p>
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => {
          const isActive = selected === opt;
          return (
            <button
              key={opt}
              type="button"
              onClick={() => onSelect(isActive ? null : opt)}
              aria-pressed={isActive}
              className={
                isActive
                  ? "px-3 py-1.5 rounded-full text-sm font-medium bg-brand-gradient text-white transition-all"
                  : "px-3 py-1.5 rounded-full text-sm font-medium bg-white/10 text-white/70 hover:bg-white/15 transition-all"
              }
            >
              {opt}
            </button>
          );
        })}
      </div>
    </div>
  );
}

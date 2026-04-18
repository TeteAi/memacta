"use client";

type Status = "DRAFT" | "READY" | "TRAINING" | "FAILED";

const STATUS_CONFIG: Record<Status, { label: string; className: string }> = {
  DRAFT: {
    label: "DRAFT",
    className: "bg-white/10 text-white/50 border-white/10",
  },
  READY: {
    label: "READY",
    className: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
  },
  TRAINING: {
    label: "TRAINING",
    className: "bg-amber-500/20 text-amber-300 border-amber-500/30 animate-pulse",
  },
  FAILED: {
    label: "FAILED",
    className: "bg-red-500/20 text-red-400 border-red-500/30",
  },
};

export default function PersonaStatusBadge({ status }: { status: Status }) {
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.DRAFT;
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border tracking-wide ${cfg.className}`}
    >
      {cfg.label}
    </span>
  );
}

"use client";

interface ComposeBoxProps {
  value: string;
  onChange: (val: string) => void;
  onSend: () => void;
  loading: boolean;
}

export default function ComposeBox({ value, onChange, onSend, loading }: ComposeBoxProps) {
  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (!loading && value.trim().length > 0) {
        onSend();
      }
    }
  }

  return (
    <div
      data-testid="compose-box"
      className="flex gap-3 items-end px-4 py-4 border-t border-white/10"
    >
      <textarea
        rows={2}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Type a message…"
        className="flex-1 rounded-xl border border-white/15 bg-[#1e1e32] px-4 py-3 text-sm text-white placeholder:text-white/30 focus:border-fuchsia-500/50 focus:ring-1 focus:ring-fuchsia-500/30 outline-none resize-none leading-relaxed"
      />
      <button
        type="button"
        data-testid="send-btn"
        onClick={onSend}
        disabled={loading || value.trim().length === 0}
        className="flex-shrink-0 px-5 py-3 rounded-xl bg-brand-gradient glow-btn text-white text-sm font-semibold disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-90 transition-all"
      >
        {loading ? "…" : "Send"}
      </button>
    </div>
  );
}

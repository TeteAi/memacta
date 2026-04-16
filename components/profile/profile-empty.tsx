import Link from "next/link";

export default function ProfileEmpty() {
  return (
    <div
      data-testid="profile-empty"
      className="flex flex-col items-center justify-center py-20 text-center"
    >
      <p className="text-white/60 text-lg mb-2">No work yet</p>
      <p className="text-white/40 text-sm mb-8">
        Be inspired by featured creators
      </p>
      <div className="flex gap-4">
        <Link
          href="/community"
          className="px-5 py-2 rounded-xl border border-white/20 text-sm font-medium text-white hover:bg-white/10 transition-colors"
        >
          Browse community
        </Link>
        <Link
          href="/create"
          className="px-5 py-2 rounded-xl bg-brand-gradient text-white text-sm font-semibold hover:opacity-90 transition-all glow-btn"
        >
          Start creating
        </Link>
      </div>
    </div>
  );
}

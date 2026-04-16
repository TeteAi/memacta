import Link from "next/link";

export default function CreatorNotFound() {
  return (
    <main className="flex flex-col items-center justify-center min-h-[60vh] px-6 text-center">
      <h1 className="text-4xl font-black text-brand-gradient mb-4">
        Creator not found
      </h1>
      <p className="text-white/60 mb-8 max-w-sm">
        This profile doesn&apos;t exist or may have been removed.
      </p>
      <Link
        href="/community"
        className="px-6 py-3 rounded-xl bg-brand-gradient text-white font-semibold hover:opacity-90 transition-all glow-btn"
      >
        Browse community
      </Link>
    </main>
  );
}

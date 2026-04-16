import Link from "next/link";

export const metadata = {
  title: "memacta – Page not found",
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <main className="mx-auto max-w-xl px-6 py-20 text-center">
      <p className="text-sm font-medium text-brand-cyan mb-3">404</p>
      <h1 className="text-3xl font-bold text-white mb-3">
        This page got lost in the render queue
      </h1>
      <p className="text-white/60 mb-8">
        The page you&apos;re looking for doesn&apos;t exist (or moved).
        Head back home or try generating something new.
      </p>
      <div className="flex flex-wrap justify-center gap-3">
        <Link
          href="/"
          className="px-6 py-2.5 rounded-xl bg-brand-gradient text-white font-semibold hover:opacity-90 transition-opacity"
        >
          Back home
        </Link>
        <Link
          href="/create"
          className="px-6 py-2.5 rounded-xl border border-white/20 text-white hover:bg-white/10 transition-colors"
        >
          Start creating
        </Link>
      </div>
    </main>
  );
}

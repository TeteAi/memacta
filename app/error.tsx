"use client";

import Link from "next/link";
import { useEffect } from "react";

// Route-level error boundary. Catches errors in any segment below
// `app/` (but not in the root layout — that's handled by
// global-error.tsx). Shows a friendly "try again" UI instead of a
// blank white page. Server logs still get the real stack trace via
// Next's built-in error reporting.

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(
      JSON.stringify({
        event: "app.route_error",
        message: error.message,
        digest: error.digest,
      })
    );
  }, [error]);

  return (
    <main className="mx-auto max-w-xl px-6 py-20 text-center">
      <h1 className="text-2xl font-bold text-white mb-3">
        Something went wrong on our side
      </h1>
      <p className="text-white/60 mb-8">
        We&apos;ve logged the error. Try refreshing — most issues are
        transient. If it keeps happening, please{" "}
        <Link href="/contact" className="text-brand-cyan underline">
          let us know
        </Link>
        .
      </p>
      <div className="flex flex-wrap justify-center gap-3">
        <button
          type="button"
          onClick={reset}
          className="px-6 py-2.5 rounded-xl bg-brand-gradient text-white font-semibold hover:opacity-90 transition-opacity"
        >
          Try again
        </button>
        <Link
          href="/"
          className="px-6 py-2.5 rounded-xl border border-white/20 text-white hover:bg-white/10 transition-colors"
        >
          Back home
        </Link>
      </div>
    </main>
  );
}

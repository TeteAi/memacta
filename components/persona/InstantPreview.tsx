"use client";

import Link from "next/link";

interface InstantPreviewProps {
  personaId: string;
  personaName: string;
  previews: Array<{ url: string }>;
  loading?: boolean;
}

export default function InstantPreview({ personaId, personaName, previews, loading }: InstantPreviewProps) {
  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-white font-semibold text-lg mb-1">Persona Ready!</h2>
        <p className="text-white/50 text-sm">
          Your Persona <span className="text-white font-medium">{personaName}</span> is ready. Here are 4 instant previews.
        </p>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="w-10 h-10 mx-auto rounded-full border-2 border-pink-500 border-t-transparent animate-spin mb-3" />
          <p className="text-white/60 text-sm animate-pulse">Generating previews...</p>
        </div>
      ) : previews.length > 0 ? (
        <div className="grid grid-cols-2 gap-3">
          {previews.map((p, i) => (
            <div key={i} className="relative rounded-xl overflow-hidden border border-white/10 aspect-square">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={p.url} alt={`Preview ${i + 1}`} className="w-full h-full object-cover" />
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-white/10 bg-white/5 p-8 text-center text-white/40 text-sm">
          Previews will appear here once generated.
        </div>
      )}

      {/* CTA buttons */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Link
          href={`/personas/${personaId}`}
          className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border border-white/20 text-white text-sm font-medium hover:bg-white/10 transition-all"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
          </svg>
          Go to Persona
        </Link>
        <Link
          href={`/create/image?personaId=${personaId}`}
          className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-pink-500 to-orange-500 text-white text-sm font-bold hover:opacity-90 transition-all"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Use in Create
        </Link>
      </div>
    </div>
  );
}

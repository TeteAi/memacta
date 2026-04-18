"use client";

import Link from "next/link";
import PersonaTierBadge from "./PersonaTierBadge";
import PersonaStatusBadge from "./PersonaStatusBadge";

interface PersonaDetailHeaderProps {
  id: string;
  name: string;
  tier: "INSTANT" | "PREMIUM";
  status: "DRAFT" | "READY" | "TRAINING" | "FAILED";
  coverImageUrl?: string | null;
  generationCount?: number;
  onDelete?: () => void;
}

export default function PersonaDetailHeader({
  id,
  name,
  tier,
  status,
  coverImageUrl,
  generationCount = 0,
  onDelete,
}: PersonaDetailHeaderProps) {
  return (
    <div className="rounded-2xl border border-white/10 bg-[#181828] overflow-hidden">
      {/* Cover */}
      <div className="relative h-48 bg-[#1e1e32]">
        {coverImageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={coverImageUrl}
            alt={name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <svg className="w-16 h-16 text-white/10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
            </svg>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#181828] via-transparent to-transparent" />
      </div>

      {/* Info + actions */}
      <div className="px-5 pb-5 -mt-4 relative">
        <div className="flex items-start justify-between gap-4 mb-3">
          <div>
            <h1 className="text-white text-xl font-bold">{name}</h1>
            <p className="text-white/40 text-sm mt-0.5">{generationCount} generation{generationCount !== 1 ? "s" : ""}</p>
          </div>
          <div className="flex items-center gap-2 mt-1">
            <PersonaStatusBadge status={status} />
            <PersonaTierBadge tier={tier} />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Link
            href={`/create/image?personaId=${id}`}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-pink-500 to-orange-500 text-white text-sm font-semibold hover:opacity-90 transition-all"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Use in Create
          </Link>

          {onDelete && (
            <button
              type="button"
              onClick={onDelete}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-red-500/30 text-red-400 text-sm hover:bg-red-500/10 transition-all"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
              </svg>
              Delete
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

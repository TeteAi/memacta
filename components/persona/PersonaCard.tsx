"use client";

import Link from "next/link";
import PersonaTierBadge from "./PersonaTierBadge";
import PersonaStatusBadge from "./PersonaStatusBadge";

interface PersonaCardProps {
  id: string;
  name: string;
  tier: "INSTANT" | "PREMIUM";
  status: "DRAFT" | "READY" | "TRAINING" | "FAILED";
  primaryPhotoUrl?: string | null;
  coverImageUrl?: string | null;
  generationCount?: number;
  trainingStartedAt?: Date | string | null;
}

export default function PersonaCard({
  id,
  name,
  tier,
  status,
  primaryPhotoUrl,
  coverImageUrl,
  generationCount = 0,
  trainingStartedAt,
}: PersonaCardProps) {
  const cover = coverImageUrl ?? primaryPhotoUrl;

  return (
    <Link
      href={`/personas/${id}`}
      className="group relative flex flex-col rounded-2xl bg-[#181828] border border-white/10 overflow-hidden hover:border-pink-500/40 transition-all hover:shadow-[0_0_20px_rgba(254,44,85,0.15)]"
    >
      {/* Cover Image */}
      <div className="aspect-square w-full bg-[#1e1e32] relative overflow-hidden">
        {cover ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={cover}
            alt={name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <svg
              className="w-12 h-12 text-white/20"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
              />
            </svg>
          </div>
        )}

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
      </div>

      {/* Info */}
      <div className="p-3 space-y-1.5">
        <div className="flex items-start justify-between gap-2">
          <p className="text-white font-semibold text-sm truncate">{name}</p>
          <PersonaTierBadge tier={tier} />
        </div>
        <div className="flex items-center gap-2">
          <PersonaStatusBadge status={status} />
          {status === "TRAINING" && trainingStartedAt && (
            <span className="text-xs text-amber-300/70">~ 15 min</span>
          )}
          {status === "READY" && (
            <span className="text-xs text-white/40">{generationCount} gen{generationCount !== 1 ? "s" : ""}</span>
          )}
        </div>
      </div>
    </Link>
  );
}

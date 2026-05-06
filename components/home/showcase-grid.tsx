"use client";

import type { ShowcaseItem } from "@/lib/showcase";
import Link from "next/link";

interface ShowcaseGridProps {
  items: ShowcaseItem[];
}

export default function ShowcaseGrid({ items }: ShowcaseGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {items.map((item) => (
        // Wrap the entire card in <Link>. The previous <div> only had
        // cursor-pointer + hover:scale styling — looking interactive but
        // doing nothing on tap was the #1 mobile complaint. Showcase items
        // aren't real DB Posts (they're seeded items in lib/showcase.ts),
        // so we route to /community as the closest meaningful destination.
        <Link
          key={item.id}
          href="/community"
          className="group rounded-xl overflow-hidden bg-[#181828] border border-white/15 hover:border-purple-500/40 transition-all hover:shadow-lg hover:shadow-purple-500/10 block focus:outline-none focus-visible:ring-2 focus-visible:ring-fuchsia-500/60"
          data-testid="showcase-card"
        >
          <div className="aspect-video relative bg-white/5">
            {item.mediaType === "video" ? (
              <video
                src={item.mediaUrl}
                poster={item.thumbnailUrl}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                muted
                autoPlay
                loop
                playsInline
              />
            ) : (
              <img
                src={item.mediaUrl}
                alt={item.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                loading="lazy"
              />
            )}
            <span className="absolute top-2 right-2 px-2 py-0.5 text-[10px] font-medium rounded-full bg-brand-gradient text-white">
              {item.category}
            </span>
          </div>
          <div className="p-3">
            <p className="text-sm font-semibold text-white truncate">{item.title}</p>
            <div className="flex items-center justify-between text-xs text-white/60 mt-1.5">
              <span className="flex items-center gap-1">
                <span className="w-4 h-4 rounded-full bg-white/10 inline-flex items-center justify-center text-[8px]">
                  {item.creator[0]}
                </span>
                {item.creator}
              </span>
              <span className="px-2 py-0.5 rounded-full bg-white/15 text-[10px] font-medium text-white/70">
                {item.tool}
              </span>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}

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
        <div
          key={item.id}
          className="group rounded-xl border border-border bg-white/5 overflow-hidden hover:border-brand-pink transition-colors"
          data-testid="showcase-card"
        >
          <div className="aspect-video relative bg-white/10">
            {item.mediaType === "video" ? (
              <video
                src={item.mediaUrl}
                poster={item.thumbnailUrl}
                className="w-full h-full object-cover"
                muted
                autoPlay
                loop
                playsInline
              />
            ) : (
              <img
                src={item.mediaUrl}
                alt={item.title}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            )}
            <span className="absolute top-2 right-2 px-2 py-0.5 text-[10px] rounded-full bg-black/60 text-white/80 backdrop-blur-sm">
              {item.category}
            </span>
          </div>
          <div className="p-3">
            <p className="text-sm font-medium truncate">{item.title}</p>
            <div className="flex items-center justify-between text-xs text-muted-foreground mt-1">
              <span>{item.creator}</span>
              <span className="px-1.5 py-0.5 rounded bg-white/10 text-[10px]">
                {item.tool}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

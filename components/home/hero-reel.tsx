"use client";

import { useRef, useEffect, useCallback } from "react";
import type { ShowcaseItem } from "@/lib/showcase";

interface HeroReelProps {
  items: ShowcaseItem[];
}

export default function HeroReel({ items }: HeroReelProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const animRef = useRef<number>(0);
  const pausedRef = useRef(false);

  const animate = useCallback(() => {
    const el = scrollRef.current;
    if (!el || pausedRef.current) {
      animRef.current = requestAnimationFrame(animate);
      return;
    }
    el.scrollLeft += 0.5;
    if (el.scrollLeft >= el.scrollWidth / 2) {
      el.scrollLeft = 0;
    }
    animRef.current = requestAnimationFrame(animate);
  }, []);

  useEffect(() => {
    animRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animRef.current);
  }, [animate]);

  const doubled = [...items, ...items];

  return (
    <div
      ref={scrollRef}
      className="flex gap-4 overflow-x-auto py-4 px-4"
      style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      onMouseEnter={() => { pausedRef.current = true; }}
      onMouseLeave={() => { pausedRef.current = false; }}
      data-testid="hero-reel"
    >
      {doubled.map((item, idx) => (
        <div
          key={`${item.id}-${idx}`}
          className="flex-shrink-0 w-64 md:w-80 rounded-xl overflow-hidden border border-white/10 bg-white/5 hover:border-purple-500/50 transition-all hover:scale-[1.02] cursor-pointer group"
        >
          <div className="aspect-video relative">
            {item.mediaType === "video" ? (
              <video
                src={item.mediaUrl}
                poster={item.thumbnailUrl}
                className="w-full h-full object-cover"
                muted
                autoPlay
                loop
                playsInline
                data-testid="reel-video"
              />
            ) : (
              <img
                src={item.mediaUrl}
                alt={item.title}
                className="w-full h-full object-cover"
                loading="lazy"
                data-testid="reel-image"
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-3">
              <p className="text-sm font-semibold text-white truncate">
                {item.title}
              </p>
              <p className="text-xs text-white/60 flex items-center gap-1 mt-0.5">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-brand-gradient" />
                {item.tool}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

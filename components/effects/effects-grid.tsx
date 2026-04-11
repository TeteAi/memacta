"use client";
import { useState } from "react";
import Link from "next/link";
import type { Effect } from "@/lib/effects";

type Filter = "all" | "effect" | "template";

export function EffectsGrid({ effects }: { effects: Effect[] }) {
  const [filter, setFilter] = useState<Filter>("all");

  const visible = effects.filter((e) =>
    filter === "all" ? true : e.category === filter
  );

  const tabs: { key: Filter; label: string }[] = [
    { key: "all", label: "All" },
    { key: "effect", label: "Effects" },
    { key: "template", label: "Templates" },
  ];

  return (
    <div data-testid="effects-grid" className="space-y-6">
      <div className="flex gap-2" role="tablist">
        {tabs.map((t) => (
          <button
            key={t.key}
            role="tab"
            data-testid={`filter-${t.key}`}
            aria-selected={filter === t.key}
            onClick={() => setFilter(t.key)}
            className={`text-sm font-medium transition-all ${
              filter === t.key
                ? "bg-brand-gradient text-white rounded-full px-4 py-2"
                : "bg-white/15 text-white/70 rounded-full px-4 py-2 hover:bg-white/25"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {visible.map((e) => (
          <Link
            key={e.id}
            href={`/effects/${e.id}`}
            data-testid={`effect-card-${e.id}`}
            className="block rounded-xl bg-[#181828] border border-white/15 overflow-hidden hover:border-purple-500/40 hover:shadow-lg hover:shadow-purple-500/10 transition-all group"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={e.thumbnail} alt={e.name} className="w-full aspect-square object-cover group-hover:scale-105 transition-transform duration-500" />
            <div className="p-2">
              <h3 className="text-sm font-semibold text-white">{e.name}</h3>
              <p className="text-xs text-white/60 capitalize">{e.category}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

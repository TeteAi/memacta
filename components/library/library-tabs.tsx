"use client";

import { useState } from "react";
import Link from "next/link";

export type LibraryItem = {
  id: string;
  type: "image" | "video" | "character" | "project";
  title: string;
  thumbnail: string | null;
  date: string;
};

const TABS = ["All", "Images", "Videos", "Characters", "Projects"] as const;
type Tab = (typeof TABS)[number];

const TAB_FILTER: Record<Tab, LibraryItem["type"][] | null> = {
  All: null,
  Images: ["image"],
  Videos: ["video"],
  Characters: ["character"],
  Projects: ["project"],
};

export default function LibraryTabs({ items }: { items: LibraryItem[] }) {
  const [activeTab, setActiveTab] = useState<Tab>("All");

  const filtered = TAB_FILTER[activeTab]
    ? items.filter((i) => TAB_FILTER[activeTab]!.includes(i.type))
    : items;

  return (
    <div>
      <nav className="flex gap-2 mb-6" role="tablist">
        {TABS.map((tab) => (
          <button
            key={tab}
            role="tab"
            aria-selected={activeTab === tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === tab
                ? "bg-brand-gradient text-white"
                : "bg-white/5 text-muted-foreground hover:text-foreground hover:bg-white/10"
            }`}
          >
            {tab}
          </button>
        ))}
      </nav>

      {filtered.length === 0 ? (
        <p className="text-muted-foreground text-center py-12">
          No items yet. Start creating to fill your library!
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filtered.map((item) => (
            <Link
              key={item.id}
              href={`/library/${item.id}`}
              className="group rounded-xl border border-border bg-white/5 overflow-hidden hover:border-brand-pink transition-colors"
            >
              <div className="aspect-video bg-white/10 flex items-center justify-center">
                {item.thumbnail ? (
                  <img
                    src={item.thumbnail}
                    alt={item.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-muted-foreground text-xs">
                    No preview
                  </span>
                )}
              </div>
              <div className="p-3">
                <p className="text-sm font-medium truncate">{item.title}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {item.type} &middot; {item.date}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

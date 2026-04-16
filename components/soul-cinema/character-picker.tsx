"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { SHOWCASE_CHARACTERS, type ShowcaseCharacter } from "@/lib/soul-cinema";

export type CharacterOption = {
  id: string;
  name: string;
  avatarUrl: string;
  refImageUrl: string;
};

interface CharacterPickerProps {
  selectedId: string | null;
  onSelect: (character: CharacterOption) => void;
}

export default function CharacterPicker({ selectedId, onSelect }: CharacterPickerProps) {
  const [characters, setCharacters] = useState<CharacterOption[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/characters");
        if (res.ok) {
          const data = await res.json();
          type RawChar = { id: string; name: string; refImageUrls?: string };
          const userChars: CharacterOption[] = (data.characters ?? []).map((c: RawChar) => {
            let refImageUrl = "";
            try {
              const urls = JSON.parse(c.refImageUrls ?? "[]");
              refImageUrl = urls[0] ?? "";
            } catch {
              refImageUrl = "";
            }
            return {
              id: c.id,
              name: c.name,
              avatarUrl: refImageUrl || `https://api.dicebear.com/7.x/personas/svg?seed=${encodeURIComponent(c.name)}`,
              refImageUrl,
            };
          });
          // Prepend user characters before showcase ones
          setCharacters([...userChars, ...SHOWCASE_CHARACTERS]);
        } else {
          setCharacters([...SHOWCASE_CHARACTERS]);
        }
      } catch {
        setCharacters([...SHOWCASE_CHARACTERS]);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center gap-3">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="w-16 h-20 rounded-xl bg-[#1e1e32] animate-pulse border border-white/10"
          />
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      {characters.map((char) => {
        const isSelected = selectedId === char.id;
        return (
          <button
            key={char.id}
            type="button"
            data-testid="character-tile"
            aria-pressed={isSelected}
            onClick={() => onSelect(char)}
            className={`flex flex-col items-center gap-1.5 p-2 rounded-xl border transition-all cursor-pointer ${
              isSelected
                ? "border-fuchsia-500 bg-fuchsia-500/10 ring-2 ring-fuchsia-500/30"
                : "border-white/15 bg-[#1e1e32] hover:border-fuchsia-500/40 hover:bg-fuchsia-500/5"
            }`}
          >
            <div className={`w-12 h-12 rounded-full overflow-hidden border-2 ${isSelected ? "border-fuchsia-500" : "border-white/20"}`}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={char.avatarUrl}
                alt={char.name}
                className="w-full h-full object-cover bg-[#181828]"
              />
            </div>
            <span className={`text-[11px] font-medium truncate max-w-[60px] ${isSelected ? "text-fuchsia-300" : "text-white/70"}`}>
              {char.name}
            </span>
          </button>
        );
      })}

      {/* + New tile */}
      <Link
        href="/tools/soul-id"
        data-testid="character-new-tile"
        className="flex flex-col items-center gap-1.5 p-2 rounded-xl border border-dashed border-white/20 hover:border-fuchsia-500/40 bg-[#1e1e32] hover:bg-fuchsia-500/5 transition-all"
      >
        <div className="w-12 h-12 rounded-full border-2 border-dashed border-white/20 flex items-center justify-center bg-white/5">
          <svg className="w-5 h-5 text-white/40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
        </div>
        <span className="text-[11px] font-medium text-white/40">New</span>
      </Link>
    </div>
  );
}

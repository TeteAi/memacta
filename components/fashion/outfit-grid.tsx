"use client";

import { useRef } from "react";
import { handleAuthRequired } from "@/lib/auth-redirect";

export interface OutfitSlot {
  preview: string | null;
  uploadedUrl: string | null;
  uploading: boolean;
}

interface OutfitGridProps {
  slots: OutfitSlot[];
  onSlotUpdate: (index: number, slot: OutfitSlot) => void;
  onError: (msg: string) => void;
}

interface SlotProps {
  index: number;
  slot: OutfitSlot;
  onUpdate: (slot: OutfitSlot) => void;
  onError: (msg: string) => void;
}

function OutfitSlotCell({ index, slot, onUpdate, onError }: SlotProps) {
  const fileRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File) {
    const preview = URL.createObjectURL(file);
    onUpdate({ preview, uploadedUrl: null, uploading: true });
    const formData = new FormData();
    formData.append("file", file);
    try {
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const json = await res.json();
      if (handleAuthRequired(res, json)) return;
      if (!res.ok) {
        onError(json.error || "Upload failed");
        onUpdate({ preview: null, uploadedUrl: null, uploading: false });
        return;
      }
      onUpdate({ preview, uploadedUrl: json.url, uploading: false });
    } catch (e) {
      onError((e as Error).message);
      onUpdate({ preview: null, uploadedUrl: null, uploading: false });
    }
  }

  function handleUrl() {
    const url = prompt("Paste outfit image URL:");
    if (url && url.trim()) {
      onUpdate({ preview: url.trim(), uploadedUrl: url.trim(), uploading: false });
    }
  }

  function clear(e: React.MouseEvent) {
    e.stopPropagation();
    onUpdate({ preview: null, uploadedUrl: null, uploading: false });
  }

  return (
    <div
      data-testid={`outfit-slot-${index}`}
      className="relative aspect-square rounded-xl border border-dashed border-white/15 hover:border-fuchsia-500/40 bg-[#1e1e32] transition-colors overflow-hidden cursor-pointer"
      onClick={() => {
        if (!slot.preview) fileRef.current?.click();
      }}
      onContextMenu={(e) => {
        e.preventDefault();
        handleUrl();
      }}
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => {
        e.preventDefault();
        const file = e.dataTransfer.files[0];
        if (file) handleFile(file);
      }}
    >
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
        }}
      />

      {slot.preview ? (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={slot.preview}
            alt={`Outfit ${index + 1}`}
            className="w-full h-full object-cover"
          />
          {slot.uploading && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <div className="w-6 h-6 rounded-full border-2 border-fuchsia-500 border-t-transparent animate-spin" />
            </div>
          )}
          <button
            type="button"
            onClick={clear}
            className="absolute top-1 right-1 w-5 h-5 rounded-full bg-[#FE2C55]/80 text-white text-xs flex items-center justify-center hover:bg-[#FE2C55] transition-colors"
          >
            ×
          </button>
          <div className="absolute bottom-1 left-1 right-1 text-center">
            <span className="text-[10px] text-white/70 bg-black/50 rounded px-1">
              {index + 1}
            </span>
          </div>
        </>
      ) : (
        <div className="flex flex-col items-center justify-center h-full gap-1 p-2">
          <div className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center">
            <svg className="w-3.5 h-3.5 text-white/40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
          </div>
          <span className="text-[10px] text-white/30 text-center leading-tight">
            {index + 1}
          </span>
        </div>
      )}
    </div>
  );
}

export default function OutfitGrid({ slots, onSlotUpdate, onError }: OutfitGridProps) {
  return (
    <div data-testid="outfit-grid" className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-white/60 text-xs font-medium">
          Outfits (1–6 slots — click to upload or right-click to paste URL)
        </label>
        <span className="text-[10px] text-white/30">
          {slots.filter((s) => s.uploadedUrl || s.preview).length} / 6
        </span>
      </div>
      <div className="grid grid-cols-6 gap-2">
        {slots.map((slot, i) => (
          <OutfitSlotCell
            key={i}
            index={i}
            slot={slot}
            onUpdate={(updated) => onSlotUpdate(i, updated)}
            onError={onError}
          />
        ))}
      </div>
    </div>
  );
}

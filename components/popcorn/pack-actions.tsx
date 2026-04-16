"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { ClipTileState } from "./clip-tile";

interface PackActionsProps {
  clips: ClipTileState[];
  presetId: string | null;
}

export default function PackActions({ clips, presetId }: PackActionsProps) {
  const router = useRouter();
  const [sharing, setSharing] = useState(false);
  const [shareError, setShareError] = useState<string | null>(null);

  const succeededClips = clips.filter((c) => c.status === "succeeded" && c.url);
  const hasSucceeded = succeededClips.length > 0;

  async function handleShare() {
    if (!hasSucceeded || !presetId) return;
    setSharing(true);
    setShareError(null);

    const clipUrls = succeededClips.map((c) => c.url as string);

    try {
      const res = await fetch("/api/popcorn/share", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ clips: clipUrls, presetId }),
      });
      const json = await res.json();
      if (res.ok) {
        router.push("/community");
      } else {
        setShareError(json.error || "Share failed");
      }
    } catch (e) {
      setShareError((e as Error).message);
    } finally {
      setSharing(false);
    }
  }

  function handleSchedule() {
    if (!hasSucceeded) return;
    const urls = succeededClips
      .map((c) => encodeURIComponent(c.url as string))
      .join(",");
    router.push(`/social/schedule?urls=${urls}`);
  }

  return (
    <div className="space-y-2">
      {shareError && (
        <p className="text-[#FE2C55] text-xs">{shareError}</p>
      )}
      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={handleShare}
          disabled={!hasSucceeded || sharing}
          className="px-5 py-2.5 rounded-xl bg-brand-gradient text-white text-sm font-semibold glow-btn disabled:opacity-40 disabled:cursor-not-allowed transition-all"
        >
          {sharing ? "Sharing…" : "Share pack to community"}
        </button>
        <button
          type="button"
          onClick={handleSchedule}
          disabled={!hasSucceeded}
          className="px-5 py-2.5 rounded-xl bg-white/10 border border-white/15 text-white text-sm font-semibold hover:bg-white/15 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
        >
          Schedule all to social
        </button>
      </div>
    </div>
  );
}

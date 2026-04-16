"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { ReelTileState } from "./reel-tile";
import type { SoulCinemaScene } from "@/lib/soul-cinema";
import { handleAuthRequired } from "@/lib/auth-redirect";

interface ReelActionsProps {
  tiles: ReelTileState[];
  scenes: SoulCinemaScene[];
  model: string;
  genre: string;
  storyPrompt: string;
  durationSec?: number;
}

export default function ReelActions({
  tiles,
  scenes,
  model,
  genre,
  storyPrompt,
  durationSec = 5,
}: ReelActionsProps) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [shareError, setShareError] = useState<string | null>(null);
  const [shared, setShared] = useState(false);

  const firstSucceeded = tiles.find((t) => t.status === "succeeded" && t.url);
  const anySucceeded = !!firstSucceeded;

  async function onSaveAsProject() {
    if (!anySucceeded) return;
    setSaving(true);
    setSaveError(null);

    const clips = scenes.map((scene, idx) => ({
      id: `scene-${scene.sceneNumber}-${Date.now()}-${idx}`,
      prompt: scene.prompt,
      model,
      resultUrl: tiles[idx]?.url,
      durationSec,
      order: idx,
    }));

    const name = `Soul Cinema — ${genre} / ${storyPrompt.slice(0, 40)}`;

    try {
      const res = await fetch("/api/soul-cinema/save", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ name, clips }),
      });
      const json = await res.json();

      if (handleAuthRequired(res, json)) return;

      if (res.ok && json.id) {
        router.push(`/studio/${json.id}`);
      } else {
        setSaveError(json.error ?? "Failed to save project");
      }
    } catch (e) {
      setSaveError((e as Error).message);
    } finally {
      setSaving(false);
    }
  }

  async function onShareToCommunity() {
    if (!firstSucceeded?.url) return;
    setSharing(true);
    setShareError(null);

    const title = storyPrompt.slice(0, 100) || "Soul Cinema reel";

    try {
      const res = await fetch("/api/community/posts", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          title,
          mediaUrl: firstSucceeded.url,
          mediaType: "video",
          toolUsed: "soul-cinema",
        }),
      });
      const json = await res.json();

      if (handleAuthRequired(res, json)) return;

      if (res.ok || res.status === 201) {
        setShared(true);
      } else {
        setShareError(json.error ?? "Failed to share");
      }
    } catch (e) {
      setShareError((e as Error).message);
    } finally {
      setSharing(false);
    }
  }

  function onDownload() {
    if (!firstSucceeded?.url) return;
    const a = document.createElement("a");
    a.href = firstSucceeded.url!;
    a.download = `memacta-soul-cinema-${Date.now()}.mp4`;
    a.target = "_blank";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-white/10">
        <button
          type="button"
          data-testid="save-as-project-btn"
          onClick={onSaveAsProject}
          disabled={saving || !anySucceeded}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-gradient text-white text-sm font-semibold hover:opacity-90 transition-all disabled:opacity-40 disabled:cursor-not-allowed glow-btn"
        >
          {saving ? (
            <>
              <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
              Saving…
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z" />
              </svg>
              Save as Project
            </>
          )}
        </button>

        <button
          type="button"
          data-testid="share-community-btn"
          onClick={onShareToCommunity}
          disabled={sharing || !anySucceeded || shared}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-white/15 bg-[#1e1e32] text-white text-sm font-medium hover:bg-white/10 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {shared ? (
            <>
              <svg className="w-4 h-4 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Shared
            </>
          ) : sharing ? (
            <>
              <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
              Sharing…
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z" />
              </svg>
              Share to Community
            </>
          )}
        </button>

        <button
          type="button"
          data-testid="download-reel-btn"
          onClick={onDownload}
          disabled={!anySucceeded}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-white/15 bg-[#1e1e32] text-white text-sm font-medium hover:bg-white/10 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
          </svg>
          Download
        </button>
      </div>

      {saveError && (
        <p className="text-[#FE2C55] text-xs">{saveError}</p>
      )}
      {shareError && (
        <p className="text-[#FE2C55] text-xs">{shareError}</p>
      )}
    </div>
  );
}

"use client";

import { useState } from "react";
import type { ShotState } from "./lookbook-tile";

interface LookbookShareButtonProps {
  shots: ShotState[];
  stylePrompt: string;
  disabled?: boolean;
}

export default function LookbookShareButton({
  shots,
  stylePrompt,
  disabled,
}: LookbookShareButtonProps) {
  const [posting, setPosting] = useState(false);
  const [posted, setPosted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const succeededShots = shots.filter((s) => s.status === "succeeded" && s.url);
  const isDisabled = disabled || posting || succeededShots.length === 0;

  async function handlePost() {
    if (isDisabled) return;
    setPosting(true);
    setError(null);
    try {
      const firstUrl = succeededShots[0]?.url ?? "";
      const n = shots.length;
      const res = await fetch("/api/community/posts", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          title: `${n}-look fashion factory drop`,
          description: stylePrompt || undefined,
          mediaUrl: firstUrl,
          mediaType: "image",
          toolUsed: "fashion-factory",
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error || "Post failed");
        return;
      }
      setPosted(true);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setPosting(false);
    }
  }

  if (posted) {
    return (
      <div
        data-testid="lookbook-share-success"
        className="inline-flex items-center gap-2 text-sm text-fuchsia-300 bg-fuchsia-500/10 border border-fuchsia-500/20 rounded-xl px-4 py-2"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
        </svg>
        Posted to community
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1">
      <button
        type="button"
        onClick={handlePost}
        disabled={isDisabled}
        data-testid="lookbook-share-button"
        className="inline-flex items-center gap-2 bg-[#181828] hover:bg-white/5 border border-white/15 hover:border-white/25 text-white/80 hover:text-white text-sm font-medium rounded-xl px-4 py-2.5 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {posting ? (
          <div className="w-4 h-4 rounded-full border-2 border-white/40 border-t-white animate-spin" />
        ) : (
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z" />
          </svg>
        )}
        Post lookbook to community
      </button>
      {error && <p className="text-[#FE2C55] text-xs">{error}</p>}
    </div>
  );
}

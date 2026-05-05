"use client";

import { useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import ModelPicker from "./model-picker";
import PromptBox from "./prompt-box";
import { videoModels, imageModels, getModel } from "@/lib/ai/models";
import ShareButton from "@/components/social/share-button";
import { smartDownload } from "@/lib/download";
import { stashPendingGeneration } from "@/lib/pending-generations";

type Props = {
  mediaType: "video" | "image";
  initialModel?: string;
  initialPrompt?: string;
};

type Aspect = "16:9" | "9:16" | "1:1";

type Result = {
  id?: string;
  status?: string;
  url?: string;
  error?: string;
};

export default function GenerateForm({ mediaType, initialModel: initialModelProp, initialPrompt }: Props) {
  const models = mediaType === "video" ? videoModels() : imageModels();
  const defaultModelId = models[0]?.id ?? "";
  // Use initialModelProp if it matches a model of the correct mediaType, otherwise fall back to default
  const resolvedInitialModel =
    initialModelProp && models.some((m) => m.id === initialModelProp)
      ? initialModelProp
      : defaultModelId;

  const [model, setModel] = useState(resolvedInitialModel);
  const [prompt, setPrompt] = useState(initialPrompt ?? "");
  const [imageUrl, setImageUrl] = useState("");
  const [aspectRatio, setAspectRatio] = useState<Aspect>(
    (getModel(resolvedInitialModel)?.defaultAspect ?? "16:9") as Aspect
  );
  const [result, setResult] = useState<Result | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { status: sessionStatus, data: sessionData } = useSession();
  const planId = (sessionData?.user as { planId?: string } | undefined)?.planId ?? "free";

  const handleModelChange = (id: string) => {
    setModel(id);
    const m = getModel(id);
    if (m) setAspectRatio(m.defaultAspect);
  };

  async function onGenerate() {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const body: Record<string, unknown> = {
        prompt,
        model,
        mediaType,
        aspectRatio,
      };
      if (mediaType === "video" && imageUrl) body.imageUrl = imageUrl;
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) {
        // Prefer the human-friendly `message` field when the server includes
        // one (e.g. daily_cap_reached, insufficient_credits), fall back to the
        // raw error code otherwise.
        setError(data.message || data.error || "failed");
      } else {
        setResult(data);
        // Anon users don't get a Generation row written server-side, so
        // stash the result client-side. If they sign up, <ClaimPending />
        // will claim it into their real library on the next page load.
        if (sessionStatus !== "authenticated" && data?.url) {
          stashPendingGeneration({
            model,
            mediaType,
            prompt,
            imageUrl: mediaType === "video" && imageUrl ? imageUrl : null,
            resultUrl: data.url,
          });
        }
      }
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  const aspects: Aspect[] = ["16:9", "9:16", "1:1"];

  return (
    <div className="flex flex-col gap-4">
      <ModelPicker mediaType={mediaType} value={model} onChange={handleModelChange} />
      <PromptBox value={prompt} onChange={setPrompt} />
      {mediaType === "video" && (
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-white/70 text-sm font-medium">Image URL (optional, for image-to-video)</span>
          <input
            type="url"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            placeholder="Optional image URL for image-to-video"
            className="bg-[#1e1e32] border border-white/15 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/50 focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/30 outline-none"
          />
        </label>
      )}
      <div className="flex flex-col gap-1 text-sm">
        <span className="text-white/70 text-sm font-medium">Aspect ratio</span>
        <div className="flex gap-2">
          {aspects.map((a) => (
            <button
              key={a}
              type="button"
              onClick={() => setAspectRatio(a)}
              className={`rounded-full px-4 py-1.5 text-xs font-medium transition-all ${
                aspectRatio === a
                  ? "bg-brand-gradient text-white shadow-sm"
                  : "bg-white/15 text-white/70 hover:bg-white/25"
              }`}
            >
              {a}
            </button>
          ))}
        </div>
      </div>
      <button type="button" onClick={onGenerate} disabled={loading || !prompt} className="w-full py-3 rounded-xl bg-brand-gradient text-white font-bold text-sm hover:opacity-90 transition-all glow-btn disabled:opacity-40 disabled:cursor-not-allowed">{loading ? "Generating..." : "Generate"}</button>
      <div data-testid="result">
        {loading && <p className="text-white/70 text-center animate-pulse">Generating your creation...</p>}
        {error && <p className="text-[#FE2C55] bg-[#FE2C55]/10 rounded-lg px-4 py-2 text-sm">{error}</p>}
        {result?.url && (
          <>
            {mediaType === "video" ? (
              <video controls src={result.url} className="w-full rounded-xl border border-white/15" />
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={result.url} alt="result" className="w-full rounded-xl border border-white/15" />
            )}
            <div className="mt-3 flex flex-wrap items-center gap-3">
              <ShareButton mediaUrl={result.url} mediaType={mediaType} caption={prompt} />
              <button
                type="button"
                onClick={() => {
                  if (!result.url) return;
                  void smartDownload(result.url, mediaType, planId, {
                    filename: `memacta-${mediaType}-${Date.now()}`,
                  });
                }}
                className="inline-flex items-center gap-1.5 bg-white/15 hover:bg-white/25 text-white text-sm font-medium rounded-xl px-4 py-2 transition-all"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                </svg>
                Download
              </button>
              <Link
                href="/library"
                className="inline-flex items-center gap-1.5 bg-white/15 hover:bg-white/25 text-white text-sm font-medium rounded-xl px-4 py-2 transition-all"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z" />
                </svg>
                Save to Library
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

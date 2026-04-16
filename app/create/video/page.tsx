"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import ModelPicker from "@/components/create/model-picker";
import PromptBox from "@/components/create/prompt-box";
import { videoModels, getModel } from "@/lib/ai/models";
import ShareButton from "@/components/social/share-button";
import { handleAuthRequired } from "@/lib/auth-redirect";

function TextToVideoInner() {
  const searchParams = useSearchParams();
  const modelParam = searchParams.get("model") ?? "";
  const promptParam = searchParams.get("prompt") ?? "";

  const models = videoModels();
  const resolvedInitial =
    modelParam && models.some((m) => m.id === modelParam)
      ? modelParam
      : models[0]?.id ?? "";

  const [model, setModel] = useState(resolvedInitial);
  const [prompt, setPrompt] = useState(promptParam);
  const [aspectRatio, setAspectRatio] = useState<"16:9" | "9:16" | "1:1">(
    (getModel(resolvedInitial)?.defaultAspect ?? "16:9") as "16:9" | "9:16" | "1:1"
  );
  const [duration, setDuration] = useState("5");
  const [result, setResult] = useState<{ url?: string; error?: string } | null>(null);
  const [loading, setLoading] = useState(false);

  const handleModelChange = (id: string) => {
    setModel(id);
    const m = getModel(id);
    if (m) setAspectRatio(m.defaultAspect);
  };

  async function onGenerate() {
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ prompt, model, mediaType: "video", aspectRatio, duration }),
      });
      const data = await res.json();
      if (handleAuthRequired(res, data)) return;
      if (!res.ok) setResult({ error: data.error || "Generation failed" });
      else setResult(data);
    } catch (e) {
      setResult({ error: (e as Error).message });
    } finally {
      setLoading(false);
    }
  }

  const aspects: ("16:9" | "9:16" | "1:1")[] = ["16:9", "9:16", "1:1"];

  return (
    <main className="mx-auto max-w-3xl px-6 py-10">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 mb-6 text-sm">
        <Link href="/create" className="text-white/50 hover:text-white transition-colors">Create</Link>
        <span className="text-white/30">/</span>
        <span className="text-white/80">Text to Video</span>
      </div>

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9A2.25 2.25 0 002.25 7.5v9a2.25 2.25 0 002.25 2.25z" />
            </svg>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Text to Video</h1>
            <p className="text-sm text-white/50">Describe a scene and generate a cinematic video</p>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="rounded-2xl bg-[#181828] border border-white/10 p-6 space-y-5">
        {/* Prompt — the main input */}
        <PromptBox value={prompt} onChange={setPrompt} />

        {/* Model + Aspect + Duration row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <ModelPicker mediaType="video" value={model} onChange={handleModelChange} />

          <div className="flex flex-col gap-1.5">
            <span className="text-white/70 text-sm font-medium">Aspect Ratio</span>
            <div className="flex gap-1.5">
              {aspects.map((a) => (
                <button
                  key={a}
                  type="button"
                  onClick={() => setAspectRatio(a)}
                  className={`flex-1 rounded-lg px-2 py-2.5 text-xs font-medium transition-all ${
                    aspectRatio === a
                      ? "bg-purple-500/20 text-purple-300 border border-purple-500/40"
                      : "bg-[#1e1e32] text-white/50 border border-white/10 hover:border-white/20"
                  }`}
                >
                  {a}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <span className="text-white/70 text-sm font-medium">Duration</span>
            <select
              className="bg-[#1e1e32] border border-white/15 rounded-xl px-4 py-2.5 text-sm text-white focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/30 outline-none appearance-none cursor-pointer"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
            >
              <option value="3">3 seconds</option>
              <option value="5">5 seconds</option>
              <option value="10">10 seconds</option>
              <option value="15">15 seconds</option>
            </select>
          </div>
        </div>

        {/* Generate */}
        <button
          type="button"
          onClick={onGenerate}
          disabled={loading || !prompt}
          className="w-full py-3.5 rounded-xl bg-brand-gradient text-white font-bold text-sm hover:opacity-90 transition-all glow-btn disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {loading ? "Generating Video..." : "Generate Video"}
        </button>

        {/* Loading */}
        {loading && (
          <div className="text-center py-8">
            <div className="w-10 h-10 mx-auto rounded-full border-2 border-purple-500 border-t-transparent animate-spin mb-3" />
            <p className="text-white/60 text-sm animate-pulse">Creating your video...</p>
          </div>
        )}

        {/* Error */}
        {result?.error && (
          <div className="rounded-xl bg-[#FE2C55]/10 border border-[#FE2C55]/20 px-4 py-3">
            <p className="text-[#FE2C55] text-sm">{result.error}</p>
          </div>
        )}

        {/* Result */}
        {result?.url && (
          <div className="space-y-4">
            <div className="rounded-xl border border-white/15 overflow-hidden">
              <video controls src={result.url} className="w-full" />
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <ShareButton mediaUrl={result.url} mediaType="video" caption={prompt} />
              <a
                href={result.url}
                download={`memacta-video-${Date.now()}.mp4`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 bg-white/10 hover:bg-white/20 text-white text-sm font-medium rounded-xl px-4 py-2 transition-all"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                </svg>
                Download
              </a>
              <Link href="/library" className="inline-flex items-center gap-1.5 bg-white/10 hover:bg-white/20 text-white text-sm font-medium rounded-xl px-4 py-2 transition-all">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z" />
                </svg>
                Save to Library
              </Link>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

export default function TextToVideoPage() {
  return (
    <Suspense fallback={null}>
      <TextToVideoInner />
    </Suspense>
  );
}

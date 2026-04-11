"use client";

import { useState } from "react";
import Link from "next/link";
import ModelPicker from "@/components/create/model-picker";
import { imageModels, getModel } from "@/lib/ai/models";
import ShareButton from "@/components/social/share-button";

const STYLE_PRESETS = [
  { label: "Photorealistic", value: "photorealistic, high detail, 8k" },
  { label: "Cinematic", value: "cinematic lighting, film grain, dramatic" },
  { label: "Anime", value: "anime style, vibrant colors, detailed" },
  { label: "Oil Painting", value: "oil painting style, textured brushstrokes" },
  { label: "Digital Art", value: "digital art, vibrant, clean lines" },
  { label: "Watercolor", value: "watercolor painting, soft edges, dreamy" },
  { label: "3D Render", value: "3D render, octane, detailed, studio lighting" },
  { label: "Portrait", value: "portrait photography, shallow DOF, studio" },
];

export default function ImageGenerationPage() {
  const initial = imageModels()[0]?.id ?? "";
  const [model, setModel] = useState(initial);
  const [prompt, setPrompt] = useState("");
  const [negativePrompt, setNegativePrompt] = useState("");
  const [aspectRatio, setAspectRatio] = useState<"1:1" | "16:9" | "9:16" | "4:3" | "3:4">("1:1");
  const [selectedStyle, setSelectedStyle] = useState<string | null>(null);
  const [showNegative, setShowNegative] = useState(false);
  const [result, setResult] = useState<{ url?: string; error?: string } | null>(null);
  const [loading, setLoading] = useState(false);

  const handleModelChange = (id: string) => {
    setModel(id);
    const m = getModel(id);
    if (m) setAspectRatio(m.defaultAspect as "1:1");
  };

  function applyStyle(style: typeof STYLE_PRESETS[0]) {
    if (selectedStyle === style.label) {
      setSelectedStyle(null);
      setPrompt((prev) => prev.replace(`, ${style.value}`, "").replace(style.value, ""));
    } else {
      // Remove previous style if any
      if (selectedStyle) {
        const prev = STYLE_PRESETS.find((s) => s.label === selectedStyle);
        if (prev) setPrompt((p) => p.replace(`, ${prev.value}`, "").replace(prev.value, ""));
      }
      setSelectedStyle(style.label);
      setPrompt((prev) => prev + (prev ? ", " : "") + style.value);
    }
  }

  async function onGenerate() {
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          prompt,
          negativePrompt: negativePrompt || undefined,
          model,
          mediaType: "image",
          aspectRatio,
        }),
      });
      const data = await res.json();
      if (!res.ok) setResult({ error: data.error || "Generation failed" });
      else setResult(data);
    } catch (e) {
      setResult({ error: (e as Error).message });
    } finally {
      setLoading(false);
    }
  }

  const aspects: { label: string; value: "1:1" | "16:9" | "9:16" | "4:3" | "3:4" }[] = [
    { label: "1:1", value: "1:1" },
    { label: "16:9", value: "16:9" },
    { label: "9:16", value: "9:16" },
    { label: "4:3", value: "4:3" },
    { label: "3:4", value: "3:4" },
  ];

  return (
    <main className="mx-auto max-w-3xl px-6 py-10">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 mb-6 text-sm">
        <Link href="/create" className="text-white/50 hover:text-white transition-colors">Create</Link>
        <span className="text-white/30">/</span>
        <span className="text-white/80">Image Generation</span>
      </div>

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-pink-500 to-orange-500 flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z" />
            </svg>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Image Generation</h1>
            <p className="text-sm text-white/50">Create stunning images from text descriptions</p>
          </div>
        </div>
      </div>

      <div className="rounded-2xl bg-[#181828] border border-white/10 p-6 space-y-5">
        {/* Prompt */}
        <div>
          <label className="text-white/70 text-sm font-medium mb-1.5 block">Describe your image</label>
          <textarea
            rows={4}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="w-full rounded-xl border border-white/15 bg-[#1e1e32] p-4 text-sm text-white placeholder:text-white/40 focus:border-pink-500/50 focus:ring-1 focus:ring-pink-500/30 outline-none resize-none"
            placeholder="A beautiful sunset over mountains with golden light, photorealistic, 8k..."
          />
        </div>

        {/* Style Presets */}
        <div>
          <span className="text-white/70 text-sm font-medium mb-2 block">Style Presets</span>
          <div className="flex flex-wrap gap-2">
            {STYLE_PRESETS.map((style) => (
              <button
                key={style.label}
                type="button"
                onClick={() => applyStyle(style)}
                className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition-all ${
                  selectedStyle === style.label
                    ? "bg-pink-500/20 text-pink-300 border border-pink-500/40"
                    : "bg-white/10 text-white/60 hover:bg-white/20 hover:text-white border border-transparent"
                }`}
              >
                {style.label}
              </button>
            ))}
          </div>
        </div>

        {/* Negative Prompt (collapsible) */}
        <div>
          <button
            type="button"
            onClick={() => setShowNegative(!showNegative)}
            className="text-xs text-white/40 hover:text-white/60 transition-colors flex items-center gap-1"
          >
            <svg className={`w-3 h-3 transition-transform ${showNegative ? "rotate-90" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
            </svg>
            Negative prompt (exclude from result)
          </button>
          {showNegative && (
            <textarea
              rows={2}
              value={negativePrompt}
              onChange={(e) => setNegativePrompt(e.target.value)}
              className="w-full mt-2 rounded-xl border border-white/10 bg-[#1e1e32] p-3 text-sm text-white/80 placeholder:text-white/30 focus:border-red-500/40 outline-none resize-none"
              placeholder="blurry, low quality, distorted, watermark..."
            />
          )}
        </div>

        {/* Settings row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <ModelPicker mediaType="image" value={model} onChange={handleModelChange} />

          <div className="flex flex-col gap-1.5">
            <span className="text-white/70 text-sm font-medium">Aspect Ratio</span>
            <div className="flex gap-1">
              {aspects.map((a) => (
                <button
                  key={a.value}
                  type="button"
                  onClick={() => setAspectRatio(a.value)}
                  className={`flex-1 rounded-lg px-1.5 py-2.5 text-xs font-medium transition-all ${
                    aspectRatio === a.value
                      ? "bg-pink-500/20 text-pink-300 border border-pink-500/40"
                      : "bg-[#1e1e32] text-white/50 border border-white/10 hover:border-white/20"
                  }`}
                >
                  {a.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Generate */}
        <button
          type="button"
          onClick={onGenerate}
          disabled={loading || !prompt}
          className="w-full py-3.5 rounded-xl bg-gradient-to-r from-pink-500 to-orange-500 text-white font-bold text-sm hover:opacity-90 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {loading ? "Generating Image..." : "Generate Image"}
        </button>

        {/* Loading */}
        {loading && (
          <div className="text-center py-8">
            <div className="w-10 h-10 mx-auto rounded-full border-2 border-pink-500 border-t-transparent animate-spin mb-3" />
            <p className="text-white/60 text-sm animate-pulse">Creating your image...</p>
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
            <div className="rounded-xl border border-white/15 overflow-hidden bg-[#1e1e32]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={result.url} alt="Generated image" className="w-full" />
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <ShareButton mediaUrl={result.url} mediaType="image" caption={prompt} />
              <a href={result.url} download={`memacta-image-${Date.now()}.png`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 bg-white/10 hover:bg-white/20 text-white text-sm font-medium rounded-xl px-4 py-2 transition-all">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" /></svg>
                Download
              </a>
              <Link href="/library" className="inline-flex items-center gap-1.5 bg-white/10 hover:bg-white/20 text-white text-sm font-medium rounded-xl px-4 py-2 transition-all">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z" /></svg>
                Save to Library
              </Link>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

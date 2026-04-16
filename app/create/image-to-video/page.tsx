"use client";

import { useState, useRef, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { videoModels, getModel } from "@/lib/ai/models";
import ShareButton from "@/components/social/share-button";
import { handleAuthRequired } from "@/lib/auth-redirect";

function ImageToVideoInner() {
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
  const [imageUrl, setImageUrl] = useState("");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  // URL returned by /api/upload after we push the selected file server-side.
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [aspectRatio, setAspectRatio] = useState<"16:9" | "9:16" | "1:1">(
    (getModel(resolvedInitial)?.defaultAspect ?? "16:9") as "16:9" | "9:16" | "1:1"
  );
  const [motionStrength, setMotionStrength] = useState("medium");
  const [result, setResult] = useState<{ url?: string; error?: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  async function handleFileSelect(file: File) {
    // Show a local preview immediately, then upload in the background.
    const preview = URL.createObjectURL(file);
    setImagePreview(preview);
    setImageUrl("");
    setUploadedUrl(null);
    setUploading(true);
    setResult(null);
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: form });
      const data = await res.json();
      if (handleAuthRequired(res, data)) return;
      if (!res.ok) {
        setResult({ error: data.error || "Upload failed" });
        setImagePreview(null);
        return;
      }
      setUploadedUrl(data.url);
    } catch (e) {
      setResult({ error: (e as Error).message });
    } finally {
      setUploading(false);
    }
  }

  async function onGenerate() {
    // Prefer the hosted URL (uploaded file or user-pasted URL) — never send a blob: preview.
    const srcImage = uploadedUrl || imageUrl;
    if (!srcImage) return;
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          prompt: prompt || "Animate this image with natural motion",
          model,
          mediaType: "video",
          aspectRatio,
          imageUrl: srcImage,
          motionStrength,
        }),
      });
      const data = await res.json();
      if (handleAuthRequired(res, data)) return;
      if (!res.ok) setResult({ error: data.message || data.error || "Generation failed" });
      else setResult(data);
    } catch (e) {
      setResult({ error: (e as Error).message });
    } finally {
      setLoading(false);
    }
  }

  const hasImage = !!(uploadedUrl || imageUrl);
  const canSubmit = hasImage && !uploading && !loading;
  const aspects: ("16:9" | "9:16" | "1:1")[] = ["16:9", "9:16", "1:1"];

  return (
    <main className="mx-auto max-w-3xl px-6 py-10">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 mb-6 text-sm">
        <Link href="/create" className="text-white/50 hover:text-white transition-colors">Create</Link>
        <span className="text-white/30">/</span>
        <span className="text-white/80">Image to Video</span>
      </div>

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.375 19.5h17.25m-17.25 0a1.125 1.125 0 01-1.125-1.125M3.375 19.5h7.5c.621 0 1.125-.504 1.125-1.125M3.375 19.5c-.621 0-1.125-.504-1.125-1.125m0 0V5.625m0 12.75v-1.5c0-.621.504-1.125 1.125-1.125m18.375 2.625V5.625m0 12.75c0 .621-.504 1.125-1.125 1.125m1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125" />
            </svg>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Image to Video</h1>
            <p className="text-sm text-white/50">Upload an image and bring it to life with AI motion</p>
          </div>
        </div>
      </div>

      <div className="rounded-2xl bg-[#181828] border border-white/10 p-6 space-y-5">
        {/* Step 1: Image Upload — PRIMARY INPUT */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span className="w-6 h-6 rounded-full bg-cyan-500/20 text-cyan-400 text-xs font-bold flex items-center justify-center">1</span>
            <span className="text-white font-medium text-sm">Upload your image</span>
            <span className="text-[10px] text-red-400 font-medium">Required</span>
          </div>

          {/* Upload zone */}
          <div
            onClick={() => fileRef.current?.click()}
            className={`relative rounded-xl border-2 border-dashed transition-all cursor-pointer group ${
              imagePreview
                ? "border-cyan-500/40 bg-cyan-500/5"
                : "border-white/15 hover:border-cyan-500/40 bg-[#1e1e32]"
            }`}
          >
            <input
              type="file"
              accept="image/*"
              className="hidden"
              ref={fileRef}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFileSelect(file);
              }}
            />

            {imagePreview ? (
              <div className="p-4 flex items-center gap-4">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={imagePreview} alt="Selected" className="w-32 h-32 rounded-lg object-cover border border-white/20" />
                <div className="flex-1">
                  <p className="text-white text-sm font-medium mb-1">
                    {uploading ? "Uploading…" : uploadedUrl ? "Image ready" : "Image selected"}
                  </p>
                  <p className="text-white/50 text-xs mb-3">
                    {uploading ? "This takes a few seconds" : "Click to change image"}
                  </p>
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); setImagePreview(null); setUploadedUrl(null); }}
                    className="text-xs text-red-400 hover:text-red-300 transition-colors"
                  >
                    Remove image
                  </button>
                </div>
              </div>
            ) : (
              <div className="py-10 px-6 text-center">
                <div className="w-14 h-14 mx-auto rounded-xl bg-white/10 flex items-center justify-center mb-3 group-hover:bg-cyan-500/20 transition-colors">
                  <svg className="w-7 h-7 text-white/40 group-hover:text-cyan-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                  </svg>
                </div>
                <p className="text-sm text-white/60 mb-1">
                  <span className="text-cyan-400 font-medium">Click to upload</span> or drag and drop
                </p>
                <p className="text-xs text-white/40">PNG, JPG, WebP up to 10MB</p>
              </div>
            )}
          </div>

          {/* OR URL */}
          {!imagePreview && (
            <>
              <div className="flex items-center gap-3 my-3">
                <div className="flex-1 h-px bg-white/10" />
                <span className="text-xs text-white/30 font-medium">OR PASTE URL</span>
                <div className="flex-1 h-px bg-white/10" />
              </div>
              <input
                type="url"
                placeholder="https://example.com/your-image.jpg"
                className="w-full rounded-xl border border-white/15 bg-[#1e1e32] px-4 py-3 text-sm text-white placeholder:text-white/40 focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/30 outline-none"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
              />
            </>
          )}
        </div>

        {/* Step 2: Motion Prompt */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span className="w-6 h-6 rounded-full bg-purple-500/20 text-purple-400 text-xs font-bold flex items-center justify-center">2</span>
            <span className="text-white font-medium text-sm">Describe the motion</span>
            <span className="text-[10px] text-white/40 font-medium">Optional</span>
          </div>
          <textarea
            rows={3}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="w-full rounded-xl border border-white/15 bg-[#1e1e32] p-4 text-sm text-white placeholder:text-white/40 focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/30 outline-none resize-none"
            placeholder="Describe how you want the image to move... e.g. 'Slow zoom in with hair flowing in the wind'"
          />
          <div className="flex flex-wrap gap-2 mt-2">
            {["Slow zoom in", "Camera pan left", "Hair flowing", "Subtle breathing", "Parallax depth"].map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setPrompt((prev) => prev + (prev ? ", " : "") + p.toLowerCase())}
                className="rounded-full bg-white/10 px-3 py-1 text-xs text-white/60 hover:bg-white/20 hover:text-white transition-all"
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        {/* Step 3: Settings */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span className="w-6 h-6 rounded-full bg-pink-500/20 text-pink-400 text-xs font-bold flex items-center justify-center">3</span>
            <span className="text-white font-medium text-sm">Settings</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Model */}
            <div className="flex flex-col gap-1.5">
              <span className="text-white/50 text-xs font-medium">Model</span>
              <select
                className="bg-[#1e1e32] border border-white/15 rounded-xl px-3 py-2.5 text-sm text-white focus:border-purple-500/50 outline-none appearance-none cursor-pointer"
                value={model}
                onChange={(e) => { setModel(e.target.value); const m = getModel(e.target.value); if (m) setAspectRatio(m.defaultAspect); }}
              >
                {videoModels().map((m) => (
                  <option key={m.id} value={m.id}>{m.name}{m.badge ? ` · ${m.badge}` : ""}</option>
                ))}
              </select>
            </div>

            {/* Aspect */}
            <div className="flex flex-col gap-1.5">
              <span className="text-white/50 text-xs font-medium">Aspect Ratio</span>
              <div className="flex gap-1.5">
                {aspects.map((a) => (
                  <button
                    key={a}
                    type="button"
                    onClick={() => setAspectRatio(a)}
                    className={`flex-1 rounded-lg px-2 py-2.5 text-xs font-medium transition-all ${
                      aspectRatio === a
                        ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40"
                        : "bg-[#1e1e32] text-white/50 border border-white/10 hover:border-white/20"
                    }`}
                  >
                    {a}
                  </button>
                ))}
              </div>
            </div>

            {/* Motion strength */}
            <div className="flex flex-col gap-1.5">
              <span className="text-white/50 text-xs font-medium">Motion Strength</span>
              <select
                className="bg-[#1e1e32] border border-white/15 rounded-xl px-3 py-2.5 text-sm text-white focus:border-purple-500/50 outline-none appearance-none cursor-pointer"
                value={motionStrength}
                onChange={(e) => setMotionStrength(e.target.value)}
              >
                <option value="subtle">Subtle</option>
                <option value="medium">Medium</option>
                <option value="strong">Strong</option>
              </select>
            </div>
          </div>
        </div>

        {/* Generate */}
        <button
          type="button"
          onClick={onGenerate}
          disabled={!canSubmit}
          className="w-full py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-bold text-sm hover:opacity-90 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {loading
            ? "Animating Image..."
            : uploading
            ? "Uploading Image..."
            : hasImage
            ? "Animate Image"
            : "Upload an Image First"}
        </button>

        {/* Loading */}
        {loading && (
          <div className="text-center py-8">
            <div className="w-10 h-10 mx-auto rounded-full border-2 border-cyan-500 border-t-transparent animate-spin mb-3" />
            <p className="text-white/60 text-sm animate-pulse">Bringing your image to life...</p>
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
              <ShareButton mediaUrl={result.url} mediaType="video" caption={prompt || "AI animated image"} />
              <a href={result.url} download={`memacta-i2v-${Date.now()}.mp4`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 bg-white/10 hover:bg-white/20 text-white text-sm font-medium rounded-xl px-4 py-2 transition-all">
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

export default function ImageToVideoPage() {
  return (
    <Suspense fallback={null}>
      <ImageToVideoInner />
    </Suspense>
  );
}

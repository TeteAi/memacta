"use client";
import { useState, useRef } from "react";
import Link from "next/link";
import type { ToolDef } from "@/lib/tools/p2-tools";
import ShareButton from "@/components/social/share-button";
import { downloadWithWatermark } from "@/lib/watermark";

export function ToolPage({ tool }: { tool: ToolDef }) {
  const [values, setValues] = useState<Record<string, string>>({});
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const update = (k: string, v: string) =>
    setValues((p) => ({ ...p, [k]: v }));

  function handleFileSelect(key: string, file: File) {
    // Create a local object URL for preview and use as placeholder
    const url = URL.createObjectURL(file);
    update(key, url);
  }

  async function onGenerate() {
    setLoading(true);
    setResult(null);
    setError(null);
    const promptParts: string[] = [`[${tool.name}]`];
    for (const i of tool.inputs) {
      const v = values[i.key] ?? "";
      if (v) promptParts.push(`${i.label}: ${v}`);
    }
    const model = tool.mediaOut === "video" ? "kling-3" : "soul-v2";
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: promptParts.join(" | "),
          model,
          mediaType: tool.mediaOut,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data?.message || data?.error || "Generation failed. Please try again.");
      } else {
        setResult(data?.url ?? data?.result ?? null);
      }
    } catch {
      setError("Network error. Please check your connection.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div data-testid="tool-page" className="space-y-5">
      {/* Input Fields */}
      <div className="space-y-4">
        {tool.inputs.map((i) => (
          <div key={i.key} className="space-y-1.5">
            <label className="block text-sm font-medium text-white">{i.label}</label>
            {i.type === "prompt" ? (
              <textarea
                data-testid={`input-${i.key}`}
                rows={3}
                placeholder="Describe what you want..."
                className="w-full rounded-xl border border-white/15 bg-[#1e1e32] p-4 text-white placeholder:text-white/50 focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/30 outline-none resize-none"
                value={values[i.key] ?? ""}
                onChange={(e) => update(i.key, e.target.value)}
              />
            ) : i.type === "image" ? (
              <div className="space-y-2">
                {/* File Upload Zone */}
                <div
                  onClick={() => fileRefs.current[i.key]?.click()}
                  className="relative rounded-xl border-2 border-dashed border-white/20 hover:border-purple-500/40 bg-[#1e1e32] p-6 text-center cursor-pointer transition-all group"
                >
                  <input
                    type="file"
                    accept="image/*,video/*"
                    className="hidden"
                    ref={(el) => { fileRefs.current[i.key] = el; }}
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleFileSelect(i.key, file);
                    }}
                  />
                  {values[i.key] ? (
                    <div className="space-y-2">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={values[i.key]}
                        alt="Preview"
                        className="max-h-32 mx-auto rounded-lg object-contain"
                      />
                      <p className="text-xs text-white/60">Click to change</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="w-12 h-12 mx-auto rounded-xl bg-white/10 flex items-center justify-center group-hover:bg-purple-500/20 transition-colors">
                        <svg className="w-6 h-6 text-white/50 group-hover:text-purple-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                        </svg>
                      </div>
                      <p className="text-sm text-white/60">
                        <span className="text-purple-400 font-medium">Click to upload</span> or drag &amp; drop
                      </p>
                      <p className="text-xs text-white/40">PNG, JPG, WebP up to 10MB</p>
                    </div>
                  )}
                </div>

                {/* OR divider */}
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-px bg-white/10" />
                  <span className="text-xs text-white/40 font-medium">OR</span>
                  <div className="flex-1 h-px bg-white/10" />
                </div>

                {/* URL input */}
                <input
                  data-testid={`input-${i.key}`}
                  type="url"
                  placeholder="Paste image URL here..."
                  className="w-full rounded-xl border border-white/15 bg-[#1e1e32] px-4 py-3 text-sm text-white placeholder:text-white/50 focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/30 outline-none"
                  value={values[i.key]?.startsWith("blob:") ? "" : (values[i.key] ?? "")}
                  onChange={(e) => update(i.key, e.target.value)}
                />
              </div>
            ) : (
              <input
                data-testid={`input-${i.key}`}
                type="text"
                placeholder={`Enter ${i.label.toLowerCase()}...`}
                className="w-full rounded-xl border border-white/15 bg-[#1e1e32] px-4 py-3 text-sm text-white placeholder:text-white/50 focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/30 outline-none"
                value={values[i.key] ?? ""}
                onChange={(e) => update(i.key, e.target.value)}
              />
            )}
          </div>
        ))}
      </div>

      {/* Generate Button */}
      <button
        data-testid="generate-button"
        onClick={onGenerate}
        disabled={loading}
        className="w-full py-3 rounded-xl bg-brand-gradient text-white font-bold text-sm hover:opacity-90 transition-all glow-btn disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {loading ? "Generating..." : "Generate"}
      </button>

      {/* Loading State */}
      {loading && (
        <div className="text-center py-8">
          <div className="w-10 h-10 mx-auto rounded-full border-2 border-purple-500 border-t-transparent animate-spin mb-3" />
          <p className="text-white/70 text-sm animate-pulse">Creating your {tool.mediaOut}...</p>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="rounded-xl bg-[#FE2C55]/10 border border-[#FE2C55]/20 px-4 py-3">
          <p className="text-[#FE2C55] text-sm">{error}</p>
        </div>
      )}

      {/* Result */}
      {result && (
        <div data-testid="tool-result" className="space-y-4">
          <div className="rounded-xl border border-white/15 bg-[#181828] overflow-hidden">
            {tool.mediaOut === "video" ? (
              <video controls src={result} className="w-full" />
            ) : result.startsWith("http") || result.startsWith("blob:") || result.startsWith("/") ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={result} alt="Generated result" className="w-full" />
            ) : (
              <div className="p-6 text-center">
                <div className="w-14 h-14 mx-auto rounded-xl bg-green-500/20 flex items-center justify-center mb-3">
                  <svg className="w-7 h-7 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                </div>
                <p className="text-white font-medium">Generation complete!</p>
                <p className="text-white/60 text-sm mt-1">{result}</p>
              </div>
            )}
          </div>

          {/* Action Buttons — Share & Download */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Share to Social */}
            <ShareButton
              mediaUrl={result}
              mediaType={tool.mediaOut === "video" ? "video" : "image"}
              caption={values[tool.inputs.find(i => i.type === "prompt")?.key ?? ""] ?? tool.name}
            />

            {/* Download — images go through the watermarker so downloads
                carry the memacta brand; videos download raw (no client-side
                video watermarking yet). */}
            {(result.startsWith("http") || result.startsWith("/")) && (
              tool.mediaOut === "video" ? (
                <a
                  href={result}
                  download={`memacta-${tool.slug}-${Date.now()}.mp4`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 bg-white/15 hover:bg-white/25 text-white text-sm font-medium rounded-xl px-4 py-2 transition-all"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                  </svg>
                  Download
                </a>
              ) : (
                <button
                  type="button"
                  onClick={() =>
                    downloadWithWatermark(result, {
                      filename: `memacta-${tool.slug}-${Date.now()}`,
                    })
                  }
                  className="inline-flex items-center gap-1.5 bg-white/15 hover:bg-white/25 text-white text-sm font-medium rounded-xl px-4 py-2 transition-all"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                  </svg>
                  Download
                </button>
              )
            )}

            {/* Save to Library */}
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
        </div>
      )}
    </div>
  );
}

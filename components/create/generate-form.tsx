"use client";

import { useState } from "react";
import ModelPicker from "./model-picker";
import PromptBox from "./prompt-box";
import { videoModels, imageModels, getModel } from "@/lib/ai/models";
import ShareButton from "@/components/social/share-button";

type Props = { mediaType: "video" | "image" };

type Aspect = "16:9" | "9:16" | "1:1";

type Result = {
  id?: string;
  status?: string;
  url?: string;
  error?: string;
};

export default function GenerateForm({ mediaType }: Props) {
  const initialModel =
    (mediaType === "video" ? videoModels() : imageModels())[0]?.id ?? "";
  const [model, setModel] = useState(initialModel);
  const [prompt, setPrompt] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [aspectRatio, setAspectRatio] = useState<Aspect>(
    (getModel(initialModel)?.defaultAspect ?? "16:9") as Aspect
  );
  const [result, setResult] = useState<Result | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
        setError(data.error || "failed");
      } else {
        setResult(data);
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
            <div className="mt-2">
              <ShareButton mediaUrl={result.url} mediaType={mediaType} caption={prompt} />
            </div>
          </>
        )}
      </div>
    </div>
  );
}

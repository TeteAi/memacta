"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
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
          <span className="text-muted-foreground">Image URL (optional, for image-to-video)</span>
          <input
            type="url"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            placeholder="Optional image URL for image-to-video"
            className="bg-card border border-border rounded-lg px-3 py-2 text-sm"
          />
        </label>
      )}
      <div className="flex flex-col gap-1 text-sm">
        <span className="text-muted-foreground">Aspect ratio</span>
        <div className="flex gap-2">
          {aspects.map((a) => (
            <button
              key={a}
              type="button"
              onClick={() => setAspectRatio(a)}
              className={`rounded-full border px-3 py-1 text-xs ${
                aspectRatio === a
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-accent"
              }`}
            >
              {a}
            </button>
          ))}
        </div>
      </div>
      <Button type="button" onClick={onGenerate} disabled={loading || !prompt}>
        Generate
      </Button>
      <div data-testid="result">
        {loading && <p>Generating…</p>}
        {error && <p className="text-red-500">{error}</p>}
        {result?.url && (
          <>
            {mediaType === "video" ? (
              <video controls src={result.url} className="w-full rounded-lg" />
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={result.url} alt="result" className="w-full rounded-lg" />
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

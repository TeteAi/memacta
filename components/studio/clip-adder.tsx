"use client";

import { useState } from "react";
import { videoModels } from "@/lib/ai/models";
import type { Clip } from "./timeline";

type Props = {
  onAdd: (clip: Clip) => void;
};

const ASPECTS = ["16:9", "9:16", "1:1"] as const;
type Aspect = (typeof ASPECTS)[number];

export default function ClipAdder({ onAdd }: Props) {
  const models = videoModels();
  const [prompt, setPrompt] = useState("");
  const [model, setModel] = useState(models[0]?.id ?? "kling-3");
  const [aspect, setAspect] = useState<Aspect>("16:9");
  const [loading, setLoading] = useState(false);

  async function handleAdd() {
    if (!prompt.trim()) return;
    setLoading(true);
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, model, mediaType: "video", aspectRatio: aspect }),
      });
      const data = await res.json();
      const clip: Clip = {
        id: data.id ?? `clip-${Date.now()}`,
        prompt,
        model,
        resultUrl: data.url,
        durationSec: 5,
        order: Date.now(),
      };
      onAdd(clip);
      setPrompt("");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-3 border border-border rounded-lg bg-card p-4">
      <label className="flex flex-col gap-1 text-sm">
        <span className="text-muted-foreground">Clip prompt</span>
        <input
          type="text"
          aria-label="Clip prompt"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Describe the shot..."
          className="bg-background border border-border rounded px-3 py-2"
        />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        <span className="text-muted-foreground">Model</span>
        <select
          aria-label="Model"
          value={model}
          onChange={(e) => setModel(e.target.value)}
          className="bg-background border border-border rounded px-3 py-2"
        >
          {models.map((m) => (
            <option key={m.id} value={m.id}>
              {m.name}
            </option>
          ))}
        </select>
      </label>
      <div className="flex gap-2">
        {ASPECTS.map((a) => (
          <button
            key={a}
            type="button"
            onClick={() => setAspect(a)}
            className={`rounded-full border px-3 py-1 text-xs ${
              aspect === a ? "bg-primary text-primary-foreground" : "hover:bg-accent"
            }`}
          >
            {a}
          </button>
        ))}
      </div>
      <button
        type="button"
        onClick={handleAdd}
        disabled={loading}
        className="rounded-lg bg-primary text-primary-foreground px-4 py-2 text-sm font-semibold disabled:opacity-60"
      >
        {loading ? "Adding..." : "Add Clip"}
      </button>
    </div>
  );
}

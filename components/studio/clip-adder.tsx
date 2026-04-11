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
    <div className="flex flex-col gap-4 border border-white/15 rounded-xl bg-[#0e0e1a] p-5">
      <label className="flex flex-col gap-1 text-sm">
        <span className="text-white/70 font-medium">Clip prompt</span>
        <input
          type="text"
          aria-label="Clip prompt"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Describe the shot..."
          className="bg-[#1e1e32] border border-white/15 rounded-xl px-4 py-3 text-white placeholder:text-white/50 focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/30 outline-none"
        />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        <span className="text-white/70 font-medium">Model</span>
        <select
          aria-label="Model"
          value={model}
          onChange={(e) => setModel(e.target.value)}
          className="bg-[#1e1e32] border border-white/15 rounded-xl px-4 py-3 text-white focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/30 outline-none"
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
            className={`rounded-full px-4 py-1.5 text-xs font-medium transition-all ${aspect === a ? "bg-brand-gradient text-white" : "bg-white/15 text-white/70 hover:bg-white/25"}`}
          >
            {a}
          </button>
        ))}
      </div>
      <button
        type="button"
        onClick={handleAdd}
        disabled={loading}
        className="rounded-xl bg-brand-gradient text-white px-4 py-2.5 text-sm font-semibold disabled:opacity-40 hover:opacity-90 transition-all"
      >
        {loading ? "Adding..." : "Add Clip"}
      </button>
    </div>
  );
}

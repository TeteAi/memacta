"use client";

import { videoModels } from "@/lib/ai/models";

const GENRES = ["drama", "noir", "scifi", "romance", "action"] as const;
const TONES = ["moody", "bright", "tense", "dreamy"] as const;
const SCENE_COUNTS = [3, 4, 5, 6] as const;
const ASPECT_RATIOS = ["16:9", "9:16"] as const;

export type StoryFormValues = {
  storyPrompt: string;
  genre: (typeof GENRES)[number];
  tone: (typeof TONES)[number];
  sceneCount: 3 | 4 | 5 | 6;
  model: string;
  aspectRatio: "16:9" | "9:16";
};

interface StoryFormProps {
  values: StoryFormValues;
  onChange: (values: StoryFormValues) => void;
}

const VIDEO_MODELS = videoModels();

export default function StoryForm({ values, onChange }: StoryFormProps) {
  function set<K extends keyof StoryFormValues>(key: K, val: StoryFormValues[K]) {
    onChange({ ...values, [key]: val });
  }

  return (
    <div className="space-y-5">
      {/* Story prompt */}
      <div>
        <label className="text-white/60 text-xs font-medium block mb-2">
          Your story <span className="text-white/30">(min 10 chars)</span>
        </label>
        <textarea
          rows={4}
          data-testid="story-prompt"
          value={values.storyPrompt}
          onChange={(e) => set("storyPrompt", e.target.value)}
          placeholder="e.g. Maya finds a mysterious letter and chases its author through a rainy Tokyo night…"
          className="w-full rounded-xl border border-white/15 bg-[#1e1e32] px-4 py-3 text-sm text-white placeholder:text-white/30 focus:border-fuchsia-500/50 focus:ring-1 focus:ring-fuchsia-500/30 outline-none resize-none"
        />
      </div>

      {/* Genre */}
      <div>
        <label className="text-white/60 text-xs font-medium block mb-2">Genre</label>
        <div className="flex flex-wrap gap-2">
          {GENRES.map((g) => (
            <button
              key={g}
              type="button"
              data-testid={`genre-chip-${g}`}
              onClick={() => set("genre", g)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all capitalize border ${
                values.genre === g
                  ? "bg-brand-gradient text-white border-transparent"
                  : "border-white/15 text-white/60 hover:text-white hover:border-white/30 bg-transparent"
              }`}
            >
              {g}
            </button>
          ))}
        </div>
      </div>

      {/* Tone */}
      <div>
        <label className="text-white/60 text-xs font-medium block mb-2">Tone</label>
        <div className="flex flex-wrap gap-2">
          {TONES.map((t) => (
            <button
              key={t}
              type="button"
              data-testid={`tone-chip-${t}`}
              onClick={() => set("tone", t)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all capitalize border ${
                values.tone === t
                  ? "bg-brand-gradient text-white border-transparent"
                  : "border-white/15 text-white/60 hover:text-white hover:border-white/30 bg-transparent"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Scene count */}
      <div>
        <label className="text-white/60 text-xs font-medium block mb-2">Scenes</label>
        <div className="flex gap-2">
          {SCENE_COUNTS.map((n) => (
            <button
              key={n}
              type="button"
              data-testid={`scene-count-${n}`}
              onClick={() => set("sceneCount", n as 3 | 4 | 5 | 6)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${
                values.sceneCount === n
                  ? "bg-brand-gradient text-white border-transparent"
                  : "border-white/15 text-white/60 hover:text-white hover:border-white/30 bg-transparent"
              }`}
            >
              {n}
            </button>
          ))}
        </div>
      </div>

      {/* Model + Aspect */}
      <div className="flex flex-wrap gap-4">
        <div className="flex-1 min-w-[160px]">
          <label className="text-white/60 text-xs font-medium block mb-2">Model</label>
          <select
            data-testid="model-select"
            value={values.model}
            onChange={(e) => set("model", e.target.value)}
            className="w-full rounded-xl border border-white/15 bg-[#1e1e32] px-3 py-2 text-sm text-white focus:border-fuchsia-500/50 focus:ring-1 focus:ring-fuchsia-500/30 outline-none"
          >
            {VIDEO_MODELS.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-white/60 text-xs font-medium block mb-2">Aspect</label>
          <div className="flex gap-2">
            {ASPECT_RATIOS.map((ar) => (
              <button
                key={ar}
                type="button"
                data-testid={`aspect-${ar.replace(":", "-")}`}
                onClick={() => set("aspectRatio", ar)}
                className={`px-3 py-2 rounded-lg text-xs font-medium transition-all border ${
                  values.aspectRatio === ar
                    ? "bg-brand-gradient text-white border-transparent"
                    : "border-white/15 text-white/60 hover:text-white hover:border-white/30 bg-transparent"
                }`}
              >
                {ar}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

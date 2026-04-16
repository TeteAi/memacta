"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import ChipGroup from "./chip-group";
import {
  PROMPT_CATEGORIES,
  STYLE_OPTIONS,
  LIGHTING_OPTIONS,
  CAMERA_OPTIONS,
  MOTION_OPTIONS,
  MOOD_OPTIONS,
  composePrompt,
  type PromptCategory,
} from "@/lib/prompt-builder";

const CATEGORY_LABELS: Record<PromptCategory, string> = {
  video: "Video",
  image: "Image",
  character: "Character",
};

function getCategoryHref(category: PromptCategory, encodedPrompt: string): string {
  if (category === "video") return `/create/video?prompt=${encodedPrompt}`;
  if (category === "image") return `/create/image?prompt=${encodedPrompt}`;
  return `/tools/soul-id?prompt=${encodedPrompt}`;
}

export default function PromptBuilder() {
  const [category, setCategory] = useState<PromptCategory>("video");
  const [subject, setSubject] = useState("");
  const [style, setStyle] = useState<string | null>(null);
  const [lighting, setLighting] = useState<string | null>(null);
  const [camera, setCamera] = useState<string | null>(null);
  const [motion, setMotion] = useState<string | null>(null);
  const [mood, setMood] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const prompt = composePrompt(
    {
      subject,
      style: style ?? undefined,
      lighting: lighting ?? undefined,
      camera: camera ?? undefined,
      motion: motion ?? undefined,
      mood: mood ?? undefined,
    },
    category
  );

  const encodedPrompt = encodeURIComponent(prompt);
  const isDisabled = subject.trim() === "";

  const handleCategoryChange = useCallback((cat: PromptCategory) => {
    setCategory(cat);
    // Reset fields that don't apply to all categories
    setCamera(null);
    setMotion(null);
  }, []);

  const handleCopy = useCallback(async () => {
    if (!prompt) return;
    try {
      await navigator.clipboard.writeText(prompt);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // clipboard unavailable in some test environments
    }
  }, [prompt]);

  const showCamera = category === "video" || category === "image";
  const showMotion = category === "video";

  return (
    <div
      data-testid="prompt-builder"
      className="rounded-2xl bg-[#181828] border border-white/15 p-6 mb-10"
    >
      {/* Header + category toggle */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <p className="text-white/70 text-sm">Build a killer prompt, chip by chip.</p>
        <div className="flex gap-2">
          {PROMPT_CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => handleCategoryChange(cat)}
              className={
                category === cat
                  ? "px-4 py-1.5 rounded-full text-sm font-semibold bg-brand-gradient text-white transition-all"
                  : "px-4 py-1.5 rounded-full text-sm font-medium bg-white/10 text-white/70 hover:bg-white/15 transition-all"
              }
            >
              {CATEGORY_LABELS[cat]}
            </button>
          ))}
        </div>
      </div>

      {/* Fields */}
      <div className="space-y-5">
        {/* 1. Subject */}
        <div>
          <label className="text-sm font-semibold text-white/80 mb-2 block">
            1. Subject <span className="text-pink-400">*</span>
          </label>
          <textarea
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="e.g. a golden retriever puppy playing in autumn leaves"
            rows={2}
            className="w-full rounded-lg bg-[#1e1e32] border border-white/15 text-white text-sm px-3 py-2 placeholder:text-white/30 focus:outline-none focus:border-white/30 resize-none"
          />
        </div>

        {/* 2. Style */}
        <ChipGroup
          label="2. Style (pick 1)"
          options={STYLE_OPTIONS}
          selected={style}
          onSelect={setStyle}
          testId="chip-group-style"
        />

        {/* 3. Lighting */}
        <ChipGroup
          label="3. Lighting (pick 1)"
          options={LIGHTING_OPTIONS}
          selected={lighting}
          onSelect={setLighting}
          testId="chip-group-lighting"
        />

        {/* 4. Camera (video + image only) */}
        {showCamera && (
          <ChipGroup
            label="4. Camera (pick 1)"
            options={CAMERA_OPTIONS}
            selected={camera}
            onSelect={setCamera}
            testId="chip-group-camera"
          />
        )}

        {/* 5. Motion (video only) */}
        {showMotion && (
          <ChipGroup
            label="5. Motion (video only)"
            options={MOTION_OPTIONS}
            selected={motion}
            onSelect={setMotion}
            testId="chip-group-motion"
          />
        )}

        {/* 6. Mood */}
        <ChipGroup
          label={`${showMotion ? "6" : showCamera ? "5" : "4"}. Mood (pick 1)`}
          options={MOOD_OPTIONS}
          selected={mood}
          onSelect={setMood}
          testId="chip-group-mood"
        />
      </div>

      {/* Live preview */}
      <div className="mt-6">
        <p className="text-sm font-semibold text-white/60 mb-2">Live prompt preview:</p>
        <div
          data-testid="prompt-preview"
          className="rounded-lg bg-[#181828] border border-white/15 px-4 py-3 min-h-[56px] text-sm text-white/90 font-mono leading-relaxed"
        >
          {prompt}
        </div>
      </div>

      {/* Action buttons */}
      <div className="mt-4 flex flex-wrap gap-3 items-center">
        <button
          type="button"
          onClick={handleCopy}
          disabled={isDisabled}
          className="px-4 py-2 rounded-lg bg-white/10 text-white/80 text-sm font-medium hover:bg-white/15 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {copied ? "Copied!" : "Copy prompt"}
        </button>

        {isDisabled ? (
          <button
            type="button"
            disabled
            className="glow-btn px-4 py-2 rounded-lg bg-brand-gradient text-white text-sm font-semibold opacity-40 cursor-not-allowed"
          >
            Open in Create &rarr;
          </button>
        ) : (
          <Link
            href={getCategoryHref(category, encodedPrompt)}
            className="glow-btn px-4 py-2 rounded-lg bg-brand-gradient text-white text-sm font-semibold"
          >
            Open in Create &rarr;
          </Link>
        )}

        {isDisabled ? (
          <button
            type="button"
            disabled
            className="px-4 py-2 rounded-lg bg-white/10 text-white/70 text-sm font-medium opacity-40 cursor-not-allowed"
          >
            Send to Copilot
          </button>
        ) : (
          <Link
            href={`/copilot?prompt=${encodedPrompt}`}
            className="px-4 py-2 rounded-lg bg-white/10 text-white/70 text-sm font-medium hover:bg-white/15 transition-all"
          >
            Send to Copilot
          </Link>
        )}
      </div>
    </div>
  );
}

"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { imageModels } from "@/lib/ai/models";
import ShareButton from "@/components/social/share-button";

// ── Data ────────────────────────────────────────────────────────────────────

const AGE_RANGES = ["18–25", "25–35", "35–45", "45+"];
const GENDERS = ["Female", "Male", "Non-binary"];
const ETHNICITIES = [
  "East Asian", "South Asian", "Southeast Asian",
  "Black / African", "Latina / Hispanic", "Middle Eastern",
  "White / European", "Mixed / Multiracial",
];
const PERSONALITY_TAGS = [
  "Confident", "Playful", "Mysterious", "Elegant",
  "Bold", "Friendly", "Edgy", "Sophisticated",
];

const HAIR_STYLES = [
  "Long Straight", "Long Wavy", "Short Bob",
  "Curly", "Braids", "Pixie Cut", "Bun",
];
const HAIR_COLORS = ["Black", "Blonde", "Brown", "Red", "Pink", "Blue", "Silver"];
const BODY_TYPES = ["Slim", "Athletic", "Curvy", "Average"];

const NICHES = [
  { label: "Fashion & Lifestyle", icon: "👗" },
  { label: "Beauty & Makeup",     icon: "💄" },
  { label: "Fitness & Health",    icon: "💪" },
  { label: "Travel & Adventure",  icon: "✈️" },
  { label: "Tech & Gaming",       icon: "🎮" },
  { label: "Food & Cooking",      icon: "🍳" },
  { label: "Art & Photography",   icon: "📸" },
  { label: "Music & Entertainment", icon: "🎵" },
];
const FASHION_STYLES = [
  "Streetwear", "High Fashion", "Casual", "Athleisure",
  "Vintage", "Minimalist", "Glamour", "Y2K",
];

const SCENES = [
  "Studio", "Beach", "City Street", "Cafe",
  "Gym", "Nature", "Red Carpet", "Home",
];
const POSES = [
  "Standing", "Sitting", "Walking", "Close-up", "Full Body", "Action Shot",
];
const MOODS = [
  "Happy", "Serious", "Playful", "Mysterious", "Confident", "Dreamy",
];
const ASPECT_RATIOS = [
  { label: "1:1 (Instagram)", value: "1:1" },
  { label: "9:16 (Stories/Reels)", value: "9:16" },
  { label: "4:5 (Portrait)", value: "4:5" },
] as const;
const VARIATION_COUNTS = [1, 2, 4] as const;

// ── Helpers ──────────────────────────────────────────────────────────────────

function Chip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition-all border ${
        active
          ? "bg-fuchsia-500/20 text-fuchsia-300 border-fuchsia-500/40"
          : "bg-white/10 text-white/60 hover:bg-white/20 hover:text-white border-transparent"
      }`}
    >
      {label}
    </button>
  );
}

function StepBadge({ n, color = "fuchsia" }: { n: number; color?: string }) {
  const cls =
    color === "violet"
      ? "bg-violet-500/20 text-violet-400"
      : color === "pink"
      ? "bg-pink-500/20 text-pink-400"
      : color === "purple"
      ? "bg-purple-500/20 text-purple-400"
      : "bg-fuchsia-500/20 text-fuchsia-400";
  return (
    <span
      className={`w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center ${cls}`}
    >
      {n}
    </span>
  );
}

function SectionHeader({
  step,
  title,
  color,
}: {
  step: number;
  title: string;
  color?: string;
}) {
  return (
    <div className="flex items-center gap-2 mb-4">
      <StepBadge n={step} color={color} />
      <span className="text-white font-semibold text-sm">{title}</span>
    </div>
  );
}

// ── Prompt builder ────────────────────────────────────────────────────────────

function buildPrompt(f: FormState): string {
  const parts: string[] = [];

  const age = f.ageRange || "25–35";
  const gender = f.gender?.toLowerCase() || "female";
  const ethnicity = f.ethnicity || "";
  const name = f.name ? `named ${f.name}` : "";
  const personality = f.personality.length
    ? f.personality.join(", ").toLowerCase()
    : "confident";

  parts.push(
    `Professional portrait photo of a ${age} year old ${gender}${
      ethnicity ? ` ${ethnicity}` : ""
    } AI influencer${name ? " " + name : ""}`
  );
  parts.push(`${personality} personality`);

  if (f.hairStyle || f.hairColor)
    parts.push(
      `${f.hairColor || ""} ${f.hairStyle || "hair"}`.trim() + " hair"
    );
  if (f.bodyType) parts.push(`${f.bodyType.toLowerCase()} body type`);
  if (f.distinctiveFeatures) parts.push(f.distinctiveFeatures);

  if (f.outfit) parts.push(`wearing ${f.outfit}`);
  if (f.fashionStyle) parts.push(`${f.fashionStyle} fashion style`);

  if (f.niche) parts.push(`${f.niche} influencer aesthetic`);

  if (f.scene) parts.push(`setting: ${f.scene}`);
  if (f.pose) parts.push(`pose: ${f.pose}`);
  if (f.mood) parts.push(`mood: ${f.mood}`);

  parts.push("photorealistic, high detail, 8k, sharp focus, professional lighting");

  return parts.join(". ");
}

// ── Types ─────────────────────────────────────────────────────────────────────

interface FormState {
  name: string;
  ageRange: string;
  gender: string;
  ethnicity: string;
  personality: string[];
  // appearance
  referencePreview: string | null;
  generateFromScratch: boolean;
  hairStyle: string;
  hairColor: string;
  bodyType: string;
  distinctiveFeatures: string;
  // style
  niche: string;
  fashionStyle: string;
  outfit: string;
  // content
  scene: string;
  pose: string;
  mood: string;
  model: string;
  aspectRatio: string;
  variations: number;
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function AIInfluencerPage() {
  const imgModels = imageModels();
  const defaultModel = imgModels[0]?.id ?? "";

  const [form, setForm] = useState<FormState>({
    name: "",
    ageRange: "18–25",
    gender: "Female",
    ethnicity: "",
    personality: [],
    referencePreview: null,
    generateFromScratch: true,
    hairStyle: "",
    hairColor: "",
    bodyType: "",
    distinctiveFeatures: "",
    niche: "",
    fashionStyle: "",
    outfit: "",
    scene: "",
    pose: "",
    mood: "",
    model: defaultModel,
    aspectRatio: "1:1",
    variations: 1,
  });

  const [results, setResults] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function togglePersonality(tag: string) {
    set(
      "personality",
      form.personality.includes(tag)
        ? form.personality.filter((t) => t !== tag)
        : [...form.personality, tag]
    );
  }

  function handleFileSelect(file: File) {
    const url = URL.createObjectURL(file);
    set("referencePreview", url);
    set("generateFromScratch", false);
  }

  async function onGenerate() {
    setLoading(true);
    setError(null);
    setResults([]);

    const prompt = buildPrompt(form);

    try {
      const requests = Array.from({ length: form.variations }, () =>
        fetch("/api/generate", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            prompt,
            model: form.model,
            mediaType: "image",
            aspectRatio: form.aspectRatio,
            imageUrl: !form.generateFromScratch
              ? form.referencePreview ?? undefined
              : undefined,
          }),
        }).then((r) => r.json())
      );

      const responses = await Promise.all(requests);
      const urls: string[] = responses
        .filter((d) => d.url)
        .map((d: { url: string }) => d.url);

      if (urls.length === 0) {
        const firstError = responses.find((d) => d.error);
        setError(firstError?.error || "Generation failed");
      } else {
        setResults(urls);
      }
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  const canGenerate = !loading;

  return (
    <main className="mx-auto max-w-4xl px-6 py-10">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 mb-6 text-sm">
        <Link href="/tools" className="text-white/50 hover:text-white transition-colors">
          Tools
        </Link>
        <span className="text-white/30">/</span>
        <span className="text-white/80">AI Influencer</span>
      </div>

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-fuchsia-500 to-violet-600 flex items-center justify-center shadow-lg shadow-fuchsia-500/20">
            <svg
              className="w-6 h-6 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
              />
            </svg>
          </div>
          <div>
            <h1 className="text-3xl font-bold text-brand-gradient">AI Influencer Creator</h1>
            <p className="text-sm text-white/50 mt-0.5">
              Design a complete AI influencer with custom appearance, personality, and style
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 mt-3">
          <span className="text-[10px] px-2.5 py-1 rounded-full bg-fuchsia-500/15 text-fuchsia-300 font-medium border border-fuchsia-500/20">
            Identity
          </span>
          <span className="text-[10px] px-2.5 py-1 rounded-full bg-violet-500/15 text-violet-300 font-medium border border-violet-500/20">
            Output: image
          </span>
        </div>
      </div>

      <div className="space-y-5">
        {/* ── STEP 1: Character Identity ────────────────────────────────────── */}
        <div className="rounded-2xl bg-[#181828] border border-white/10 p-6">
          <SectionHeader step={1} title="Character Identity" color="fuchsia" />

          {/* Name */}
          <div className="mb-4">
            <label className="text-white/60 text-xs font-medium mb-1.5 block">
              Influencer Name
            </label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
              placeholder="e.g. Luna, Aria, Nova..."
              className="w-full rounded-xl border border-white/15 bg-[#1e1e32] px-4 py-3 text-sm text-white placeholder:text-white/30 focus:border-fuchsia-500/50 focus:ring-1 focus:ring-fuchsia-500/30 outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
            {/* Age range */}
            <div>
              <label className="text-white/60 text-xs font-medium mb-1.5 block">
                Age Range
              </label>
              <div className="flex flex-wrap gap-1.5">
                {AGE_RANGES.map((a) => (
                  <button
                    key={a}
                    type="button"
                    onClick={() => set("ageRange", a)}
                    className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all border ${
                      form.ageRange === a
                        ? "bg-fuchsia-500/20 text-fuchsia-300 border-fuchsia-500/40"
                        : "bg-white/5 text-white/50 border-white/10 hover:border-white/20 hover:text-white/80"
                    }`}
                  >
                    {a}
                  </button>
                ))}
              </div>
            </div>

            {/* Gender */}
            <div>
              <label className="text-white/60 text-xs font-medium mb-1.5 block">
                Gender
              </label>
              <div className="flex flex-wrap gap-1.5">
                {GENDERS.map((g) => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => set("gender", g)}
                    className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all border ${
                      form.gender === g
                        ? "bg-fuchsia-500/20 text-fuchsia-300 border-fuchsia-500/40"
                        : "bg-white/5 text-white/50 border-white/10 hover:border-white/20 hover:text-white/80"
                    }`}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>

            {/* Ethnicity */}
            <div>
              <label className="text-white/60 text-xs font-medium mb-1.5 block">
                Ethnicity / Look
              </label>
              <select
                value={form.ethnicity}
                onChange={(e) => set("ethnicity", e.target.value)}
                className="w-full bg-[#1e1e32] border border-white/15 rounded-xl px-3 py-2.5 text-sm text-white focus:border-fuchsia-500/50 outline-none appearance-none cursor-pointer"
              >
                <option value="">Select...</option>
                {ETHNICITIES.map((e) => (
                  <option key={e} value={e}>
                    {e}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Personality tags */}
          <div>
            <label className="text-white/60 text-xs font-medium mb-2 block">
              Personality (select multiple)
            </label>
            <div className="flex flex-wrap gap-2">
              {PERSONALITY_TAGS.map((tag) => (
                <Chip
                  key={tag}
                  label={tag}
                  active={form.personality.includes(tag)}
                  onClick={() => togglePersonality(tag)}
                />
              ))}
            </div>
          </div>
        </div>

        {/* ── STEP 2: Appearance ───────────────────────────────────────────── */}
        <div className="rounded-2xl bg-[#181828] border border-white/10 p-6">
          <SectionHeader step={2} title="Appearance" color="violet" />

          {/* Reference image upload */}
          <div className="mb-5">
            <div className="flex items-center justify-between mb-2">
              <label className="text-white/60 text-xs font-medium">
                Reference Image (optional)
              </label>
              <button
                type="button"
                onClick={() => {
                  set("generateFromScratch", !form.generateFromScratch);
                  if (!form.generateFromScratch) set("referencePreview", null);
                }}
                className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1 rounded-full border transition-all ${
                  form.generateFromScratch
                    ? "bg-violet-500/20 text-violet-300 border-violet-500/40"
                    : "bg-white/10 text-white/50 border-white/15 hover:border-white/25"
                }`}
              >
                <span
                  className={`w-2 h-2 rounded-full ${
                    form.generateFromScratch ? "bg-violet-400" : "bg-white/30"
                  }`}
                />
                Generate from scratch
              </button>
            </div>

            <div
              onClick={() => {
                if (!form.generateFromScratch) fileRef.current?.click();
              }}
              className={`relative rounded-xl border-2 border-dashed transition-all ${
                form.generateFromScratch
                  ? "border-white/10 bg-[#1e1e32]/50 opacity-50 cursor-not-allowed"
                  : form.referencePreview
                  ? "border-violet-500/40 bg-violet-500/5 cursor-pointer"
                  : "border-white/15 hover:border-violet-500/40 bg-[#1e1e32] cursor-pointer"
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
              {form.referencePreview ? (
                <div className="p-4 flex items-center gap-4">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={form.referencePreview}
                    alt="Reference"
                    className="w-24 h-24 rounded-lg object-cover border border-white/20"
                  />
                  <div className="flex-1">
                    <p className="text-white text-sm font-medium mb-1">Reference uploaded</p>
                    <p className="text-white/50 text-xs mb-2">Click to change</p>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        set("referencePreview", null);
                        set("generateFromScratch", true);
                      }}
                      className="text-xs text-red-400 hover:text-red-300 transition-colors"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ) : (
                <div className="py-8 px-6 text-center">
                  <div className="w-12 h-12 mx-auto rounded-xl bg-white/10 flex items-center justify-center mb-3">
                    <svg
                      className="w-6 h-6 text-white/40"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={1.5}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
                      />
                    </svg>
                  </div>
                  <p className="text-sm text-white/40">
                    {form.generateFromScratch
                      ? "Disabled — generating from scratch"
                      : "Click to upload a face reference"}
                  </p>
                  <p className="text-xs text-white/25 mt-1">PNG, JPG up to 10MB</p>
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-4">
            {/* Hair style */}
            <div>
              <label className="text-white/60 text-xs font-medium mb-2 block">
                Hair Style
              </label>
              <div className="flex flex-wrap gap-1.5">
                {HAIR_STYLES.map((h) => (
                  <button
                    key={h}
                    type="button"
                    onClick={() => set("hairStyle", form.hairStyle === h ? "" : h)}
                    className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all border ${
                      form.hairStyle === h
                        ? "bg-violet-500/20 text-violet-300 border-violet-500/40"
                        : "bg-white/5 text-white/50 border-white/10 hover:border-white/20"
                    }`}
                  >
                    {h}
                  </button>
                ))}
              </div>
            </div>

            {/* Hair color */}
            <div>
              <label className="text-white/60 text-xs font-medium mb-2 block">
                Hair Color
              </label>
              <div className="flex flex-wrap gap-1.5">
                {HAIR_COLORS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => set("hairColor", form.hairColor === c ? "" : c)}
                    className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all border ${
                      form.hairColor === c
                        ? "bg-violet-500/20 text-violet-300 border-violet-500/40"
                        : "bg-white/5 text-white/50 border-white/10 hover:border-white/20"
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Body type */}
          <div className="mb-4">
            <label className="text-white/60 text-xs font-medium mb-2 block">
              Body Type
            </label>
            <div className="flex flex-wrap gap-1.5">
              {BODY_TYPES.map((b) => (
                <button
                  key={b}
                  type="button"
                  onClick={() => set("bodyType", form.bodyType === b ? "" : b)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all border ${
                    form.bodyType === b
                      ? "bg-violet-500/20 text-violet-300 border-violet-500/40"
                      : "bg-white/5 text-white/50 border-white/10 hover:border-white/20"
                  }`}
                >
                  {b}
                </button>
              ))}
            </div>
          </div>

          {/* Distinctive features */}
          <div>
            <label className="text-white/60 text-xs font-medium mb-1.5 block">
              Distinctive Features
            </label>
            <textarea
              rows={2}
              value={form.distinctiveFeatures}
              onChange={(e) => set("distinctiveFeatures", e.target.value)}
              placeholder="e.g. freckles, subtle tattoos on arm, small nose piercing..."
              className="w-full rounded-xl border border-white/15 bg-[#1e1e32] p-3 text-sm text-white placeholder:text-white/30 focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/30 outline-none resize-none"
            />
          </div>
        </div>

        {/* ── STEP 3: Style & Niche ────────────────────────────────────────── */}
        <div className="rounded-2xl bg-[#181828] border border-white/10 p-6">
          <SectionHeader step={3} title="Style & Niche" color="pink" />

          {/* Niche cards */}
          <div className="mb-5">
            <label className="text-white/60 text-xs font-medium mb-2 block">
              Niche
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {NICHES.map((n) => (
                <button
                  key={n.label}
                  type="button"
                  onClick={() =>
                    set("niche", form.niche === n.label ? "" : n.label)
                  }
                  className={`flex flex-col items-center gap-1.5 rounded-xl p-3 text-xs font-medium transition-all border ${
                    form.niche === n.label
                      ? "bg-pink-500/15 text-pink-300 border-pink-500/40"
                      : "bg-white/5 text-white/50 border-white/10 hover:border-white/20 hover:text-white/80"
                  }`}
                >
                  <span className="text-xl">{n.icon}</span>
                  <span className="text-center leading-tight">{n.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Fashion style */}
          <div className="mb-5">
            <label className="text-white/60 text-xs font-medium mb-2 block">
              Fashion Style
            </label>
            <div className="flex flex-wrap gap-2">
              {FASHION_STYLES.map((s) => (
                <Chip
                  key={s}
                  label={s}
                  active={form.fashionStyle === s}
                  onClick={() =>
                    set("fashionStyle", form.fashionStyle === s ? "" : s)
                  }
                />
              ))}
            </div>
          </div>

          {/* Default outfit */}
          <div>
            <label className="text-white/60 text-xs font-medium mb-1.5 block">
              Default Outfit Description
            </label>
            <textarea
              rows={2}
              value={form.outfit}
              onChange={(e) => set("outfit", e.target.value)}
              placeholder="e.g. fitted black turtleneck, high-waist trousers, minimalist gold jewelry..."
              className="w-full rounded-xl border border-white/15 bg-[#1e1e32] p-3 text-sm text-white placeholder:text-white/30 focus:border-pink-500/50 focus:ring-1 focus:ring-pink-500/30 outline-none resize-none"
            />
          </div>
        </div>

        {/* ── STEP 4: Content Generation ───────────────────────────────────── */}
        <div className="rounded-2xl bg-[#181828] border border-white/10 p-6">
          <SectionHeader step={4} title="Content Generation" color="purple" />

          {/* Scene */}
          <div className="mb-4">
            <label className="text-white/60 text-xs font-medium mb-2 block">
              Scene / Setting
            </label>
            <div className="flex flex-wrap gap-1.5">
              {SCENES.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => set("scene", form.scene === s ? "" : s)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all border ${
                    form.scene === s
                      ? "bg-purple-500/20 text-purple-300 border-purple-500/40"
                      : "bg-white/5 text-white/50 border-white/10 hover:border-white/20"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            {/* Pose */}
            <div>
              <label className="text-white/60 text-xs font-medium mb-2 block">
                Pose
              </label>
              <div className="flex flex-wrap gap-1.5">
                {POSES.map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => set("pose", form.pose === p ? "" : p)}
                    className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all border ${
                      form.pose === p
                        ? "bg-purple-500/20 text-purple-300 border-purple-500/40"
                        : "bg-white/5 text-white/50 border-white/10 hover:border-white/20"
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            {/* Mood */}
            <div>
              <label className="text-white/60 text-xs font-medium mb-2 block">
                Mood
              </label>
              <div className="flex flex-wrap gap-1.5">
                {MOODS.map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => set("mood", form.mood === m ? "" : m)}
                    className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all border ${
                      form.mood === m
                        ? "bg-purple-500/20 text-purple-300 border-purple-500/40"
                        : "bg-white/5 text-white/50 border-white/10 hover:border-white/20"
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Model */}
            <div>
              <label className="text-white/60 text-xs font-medium mb-1.5 block">
                AI Model
              </label>
              <select
                value={form.model}
                onChange={(e) => set("model", e.target.value)}
                className="w-full bg-[#1e1e32] border border-white/15 rounded-xl px-3 py-2.5 text-sm text-white focus:border-purple-500/50 outline-none appearance-none cursor-pointer"
              >
                {imgModels.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name}
                    {m.badge ? ` · ${m.badge}` : ""}
                  </option>
                ))}
              </select>
            </div>

            {/* Aspect ratio */}
            <div>
              <label className="text-white/60 text-xs font-medium mb-1.5 block">
                Aspect Ratio
              </label>
              <div className="flex flex-col gap-1">
                {ASPECT_RATIOS.map((a) => (
                  <button
                    key={a.value}
                    type="button"
                    onClick={() => set("aspectRatio", a.value)}
                    className={`rounded-lg px-3 py-2 text-xs font-medium transition-all border text-left ${
                      form.aspectRatio === a.value
                        ? "bg-purple-500/20 text-purple-300 border-purple-500/40"
                        : "bg-[#1e1e32] text-white/50 border-white/10 hover:border-white/20"
                    }`}
                  >
                    {a.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Variations */}
            <div>
              <label className="text-white/60 text-xs font-medium mb-1.5 block">
                Variations
              </label>
              <div className="flex flex-col gap-1">
                {VARIATION_COUNTS.map((v) => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => set("variations", v)}
                    className={`rounded-lg px-3 py-2 text-xs font-medium transition-all border text-left ${
                      form.variations === v
                        ? "bg-purple-500/20 text-purple-300 border-purple-500/40"
                        : "bg-[#1e1e32] text-white/50 border-white/10 hover:border-white/20"
                    }`}
                  >
                    {v === 1 ? "1 image" : `${v} images`}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── Generate Button ───────────────────────────────────────────────── */}
        <button
          type="button"
          onClick={onGenerate}
          disabled={!canGenerate}
          className="w-full py-4 rounded-xl bg-brand-gradient glow-btn text-white font-bold text-base hover:opacity-90 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {loading ? "Creating AI Influencer..." : "Create AI Influencer"}
        </button>

        {/* Loading */}
        {loading && (
          <div className="text-center py-8">
            <div className="w-10 h-10 mx-auto rounded-full border-2 border-fuchsia-500 border-t-transparent animate-spin mb-3" />
            <p className="text-white/60 text-sm animate-pulse">
              Crafting your AI influencer
              {form.variations > 1 ? ` (${form.variations} variations)` : ""}
              ...
            </p>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-3">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        {/* Results */}
        {results.length > 0 && (
          <div className="rounded-2xl bg-[#181828] border border-white/10 p-6 space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="text-white font-semibold text-sm">
                Generated Influencer{results.length > 1 ? "s" : ""}
              </h2>
              <span className="text-xs text-white/40">
                {results.length} image{results.length > 1 ? "s" : ""}
              </span>
            </div>

            {/* Image grid */}
            <div
              className={`grid gap-4 ${
                results.length === 1
                  ? "grid-cols-1"
                  : results.length === 2
                  ? "grid-cols-2"
                  : "grid-cols-2"
              }`}
            >
              {results.map((url, i) => (
                <div
                  key={i}
                  className="rounded-xl border border-white/10 overflow-hidden bg-[#1e1e32] group relative"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={url}
                    alt={`AI Influencer ${form.name || ""} variation ${i + 1}`}
                    className="w-full object-cover"
                  />
                  {/* Hover overlay */}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
                    <div className="flex flex-wrap gap-2 w-full">
                      <ShareButton
                        mediaUrl={url}
                        mediaType="image"
                        caption={`${form.name || "AI Influencer"} — created with memacta`}
                      />
                      <a
                        href={url}
                        download={`memacta-influencer-${form.name || "character"}-${i + 1}-${Date.now()}.png`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 bg-white/10 hover:bg-white/20 text-white text-xs font-medium rounded-lg px-3 py-1.5 transition-all"
                      >
                        <svg
                          className="w-3.5 h-3.5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={2}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3"
                          />
                        </svg>
                        Download
                      </a>
                      <Link
                        href="/library"
                        className="inline-flex items-center gap-1 bg-white/10 hover:bg-white/20 text-white text-xs font-medium rounded-lg px-3 py-1.5 transition-all"
                      >
                        <svg
                          className="w-3.5 h-3.5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={2}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z"
                          />
                        </svg>
                        Save
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Action row */}
            <div className="flex flex-wrap gap-3 pt-1">
              <button
                type="button"
                onClick={onGenerate}
                disabled={loading}
                className="inline-flex items-center gap-2 bg-fuchsia-500/15 hover:bg-fuchsia-500/25 border border-fuchsia-500/30 text-fuchsia-300 text-sm font-medium rounded-xl px-5 py-2.5 transition-all disabled:opacity-40"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99"
                  />
                </svg>
                Generate More
              </button>

              <Link
                href="/tools/soul-cast"
                className="inline-flex items-center gap-2 bg-violet-500/15 hover:bg-violet-500/25 border border-violet-500/30 text-violet-300 text-sm font-medium rounded-xl px-5 py-2.5 transition-all"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z"
                  />
                </svg>
                Create Content Series
              </Link>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

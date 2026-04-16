/**
 * Pure helper functions for the Higgsfield Popcorn feature.
 * No React, no DB — fully unit-testable in isolation.
 */

export type PopcornPreset = {
  id: string;
  name: string;
  tagline: string;
  gradientClass: string;
  basePrompt: string;
  motion: string;
  tone: string;
  model: "kling-25-turbo" | "seedance-20";
  durationSec: 3 | 5;
  aspectRatio: "9:16";
};

export const POPCORN_PRESETS: PopcornPreset[] = [
  {
    id: "snack-hop",
    name: "Snack Hop",
    tagline: "rapid pastel pan",
    gradientClass: "from-pink-400 to-yellow-300",
    basePrompt: "Snappy TikTok-style vertical video with rapid pastel transitions, bouncy energy, bright candy-colored aesthetic",
    motion: "rapid handheld pan",
    tone: "playful, pastel, snackable",
    model: "kling-25-turbo",
    durationSec: 3,
    aspectRatio: "9:16",
  },
  {
    id: "cafe-gloom",
    name: "Cafe Gloom",
    tagline: "moody coffee close-up",
    gradientClass: "from-amber-800 to-stone-700",
    basePrompt: "Moody cafe atmosphere with cinematic low-light, slow close-up drifts, warm dark tones",
    motion: "slow cinematic drift",
    tone: "moody, intimate, warm-dark",
    model: "kling-25-turbo",
    durationSec: 5,
    aspectRatio: "9:16",
  },
  {
    id: "neon-runway",
    name: "Neon Runway",
    tagline: "cyberpunk fashion walk",
    gradientClass: "from-fuchsia-500 to-cyan-400",
    basePrompt: "Cyberpunk neon runway, high-fashion vertical walk shot with electric neon lights and reflective surfaces",
    motion: "forward tracking walk",
    tone: "electric, high-fashion, cyberpunk",
    model: "kling-25-turbo",
    durationSec: 5,
    aspectRatio: "9:16",
  },
  {
    id: "retro-grwm",
    name: "Retro GRWM",
    tagline: "70s get ready clip",
    gradientClass: "from-orange-400 to-yellow-500",
    basePrompt: "Get-ready-with-me style vertical clip with retro 70s aesthetic, film grain, warm vintage color grading",
    motion: "gentle handheld sway",
    tone: "nostalgic, warm, vintage",
    model: "kling-25-turbo",
    durationSec: 5,
    aspectRatio: "9:16",
  },
  {
    id: "sunset-drive",
    name: "Sunset Drive",
    tagline: "golden hour road vibes",
    gradientClass: "from-orange-500 to-pink-500",
    basePrompt: "Golden hour vertical driving clip, sun-drenched road with lens flares, dreamy summer atmosphere",
    motion: "smooth forward drive",
    tone: "dreamy, summer, golden",
    model: "seedance-20",
    durationSec: 5,
    aspectRatio: "9:16",
  },
  {
    id: "mirror-glitch",
    name: "Mirror Glitch",
    tagline: "digital mirror loop",
    gradientClass: "from-violet-600 to-indigo-400",
    basePrompt: "Glitchy digital mirror effect vertical clip, RGB split artifacts, hypnotic loop, digital distortion aesthetic",
    motion: "glitch pulse zoom",
    tone: "glitchy, hypnotic, digital",
    model: "kling-25-turbo",
    durationSec: 3,
    aspectRatio: "9:16",
  },
  {
    id: "tokyo-streetwear",
    name: "Tokyo Streetwear",
    tagline: "harajuku walk shot",
    gradientClass: "from-red-500 to-pink-400",
    basePrompt: "Tokyo Harajuku streetwear vertical clip, busy street energy, bold fashion, neon signs, urban Japanese aesthetic",
    motion: "urban tracking shot",
    tone: "bold, urban, Japanese-street",
    model: "kling-25-turbo",
    durationSec: 5,
    aspectRatio: "9:16",
  },
  {
    id: "studio-cook",
    name: "Studio Cook",
    tagline: "overhead food moment",
    gradientClass: "from-lime-400 to-emerald-500",
    basePrompt: "Vertical overhead cooking clip, clean studio kitchen, satisfying food prep moments, bright natural light",
    motion: "smooth overhead crane",
    tone: "fresh, clean, satisfying",
    model: "seedance-20",
    durationSec: 5,
    aspectRatio: "9:16",
  },
  {
    id: "locker-room-pump",
    name: "Locker Room Pump",
    tagline: "gym hype vertical cut",
    gradientClass: "from-blue-600 to-cyan-400",
    basePrompt: "Gym locker room hype vertical clip, intensity and motivation, dramatic lighting, athletic energy",
    motion: "quick cut energy",
    tone: "intense, motivational, athletic",
    model: "kling-25-turbo",
    durationSec: 3,
    aspectRatio: "9:16",
  },
  {
    id: "pet-close-up",
    name: "Pet Close-Up",
    tagline: "soft fur macro shot",
    gradientClass: "from-yellow-300 to-orange-300",
    basePrompt: "Adorable pet close-up vertical clip, soft bokeh background, natural warm light, heartwarming and cozy atmosphere",
    motion: "gentle slow zoom-in",
    tone: "warm, soft, heartwarming",
    model: "seedance-20",
    durationSec: 3,
    aspectRatio: "9:16",
  },
  {
    id: "weekend-hike",
    name: "Weekend Hike",
    tagline: "trail adventure vlog",
    gradientClass: "from-green-500 to-teal-400",
    basePrompt: "Outdoor hiking adventure vertical vlog clip, lush nature trails, wide open landscapes, active lifestyle energy",
    motion: "handheld adventure walk",
    tone: "adventurous, natural, energetic",
    model: "seedance-20",
    durationSec: 5,
    aspectRatio: "9:16",
  },
  {
    id: "night-in",
    name: "Night In",
    tagline: "cozy home evening",
    gradientClass: "from-purple-700 to-indigo-600",
    basePrompt: "Cozy night-in vertical clip, soft lamp lighting, comfortable home atmosphere, warm blankets and candlelight",
    motion: "slow gentle drift",
    tone: "cozy, intimate, calm",
    model: "seedance-20",
    durationSec: 5,
    aspectRatio: "9:16",
  },
];

export function getPopcornPreset(id: string): PopcornPreset | undefined {
  return POPCORN_PRESETS.find((p) => p.id === id);
}

export function composePopcornPrompt(
  preset: PopcornPreset,
  subjectPrompt: string,
): string {
  return (
    `${preset.basePrompt}. ` +
    `Subject: ${subjectPrompt.trim()}. ` +
    `Motion: ${preset.motion}. ` +
    `Tone: ${preset.tone}. ` +
    `Vertical 9:16 short-form clip.`
  );
}

export interface PopcornGenerateRequest {
  prompt: string;
  model: string;
  mediaType: "video";
  imageUrl?: string;
  aspectRatio: "9:16";
  duration: number;
  seed: number;
}

export function buildPopcornBatch(
  presetId: string,
  subjectPrompt: string,
  subjectImageUrl?: string,
  seeds?: [number, number, number],
): PopcornGenerateRequest[] {
  const preset = getPopcornPreset(presetId);
  if (!preset) {
    throw new Error(`Preset not found: ${presetId}`);
  }

  if (!subjectPrompt || subjectPrompt.trim().length === 0) {
    throw new Error("Subject prompt is required");
  }

  const resolvedSeeds: [number, number, number] = seeds ?? [17, 42, 91];

  const prompt = composePopcornPrompt(preset, subjectPrompt);

  return resolvedSeeds.map((seed) => {
    const req: PopcornGenerateRequest = {
      prompt,
      model: preset.model,
      mediaType: "video",
      aspectRatio: "9:16",
      duration: preset.durationSec,
      seed,
    };
    if (subjectImageUrl) {
      req.imageUrl = subjectImageUrl;
    }
    return req;
  });
}

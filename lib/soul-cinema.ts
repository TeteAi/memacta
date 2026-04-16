/**
 * Pure helper functions for the Soul Cinema feature.
 * No React, no DB — fully unit-testable in isolation.
 */

export type SoulCinemaScene = {
  sceneNumber: number;
  beat: string;
  prompt: string;
};

export type SoulCinemaScriptInput = {
  storyPrompt: string;
  sceneCount: 3 | 4 | 5 | 6;
  genre: "drama" | "noir" | "scifi" | "romance" | "action";
  tone: "moody" | "bright" | "tense" | "dreamy";
  characterName: string;
  characterRefUrl?: string;
  seed?: number;
};

export type SoulCinemaBatchInput = {
  scenes: SoulCinemaScene[];
  model: string;
  aspectRatio: "16:9" | "9:16" | "1:1";
  characterRefUrl?: string;
  durationSec?: number;
};

export type SoulCinemaGenerateRequest = {
  prompt: string;
  model: string;
  mediaType: "video";
  imageUrl?: string;
  aspectRatio: "16:9" | "9:16" | "1:1";
  duration: number;
};

// Genre style directives — used in prompt composition
const GENRE_STYLES: Record<SoulCinemaScriptInput["genre"], string> = {
  drama:   "dramatic wide-angle cinematography, emotional depth, warm tungsten tones",
  noir:    "chiaroscuro lighting, deep shadow and high contrast, rain-slicked streets, moody film noir",
  scifi:   "neon-lit futuristic cityscape, volumetric light beams, cyberpunk sci-fi aesthetic",
  romance: "golden-hour bokeh, soft diffused light, intimate close-up framing, warm romantic palette",
  action:  "dynamic handheld camera, fast cuts, motion blur, explosive action cinematography",
};

// Tone descriptors
const TONE_WORDS: Record<SoulCinemaScriptInput["tone"], string> = {
  moody:  "moody and atmospheric",
  bright: "bright and vibrant",
  tense:  "tense and suspenseful",
  dreamy: "dreamy and ethereal",
};

// Beat template pools, keyed by genre
// Each array has 6 template strings; we pick N of them
const BEAT_TEMPLATES: Record<SoulCinemaScriptInput["genre"], string[]> = {
  drama: [
    "opens with a quiet moment of reflection",
    "confronts an unexpected revelation",
    "reaches a turning point that changes everything",
    "searches for an answer in the silence",
    "shares a raw, honest exchange",
    "closes on a single unspoken truth",
  ],
  noir: [
    "steps into the rain-soaked night",
    "follows a trail of cryptic clues",
    "encounters a shadowy figure",
    "uncovers a hidden piece of the puzzle",
    "narrowly escapes a dangerous trap",
    "faces the hard truth in the dark",
  ],
  scifi: [
    "discovers an anomalous signal in the data-stream",
    "traverses a neon-lit corridor of the future",
    "interfaces with an alien intelligence",
    "witnesses a catastrophic system failure",
    "decodes the last transmission",
    "makes a choice that redefines humanity",
  ],
  romance: [
    "catches a fleeting glance across the room",
    "shares an unexpected laugh in the rain",
    "reaches out in a moment of vulnerability",
    "almost says what has been left unsaid",
    "walks away but cannot forget",
    "finally speaks the truth out loud",
  ],
  action: [
    "races against time through a crowded street",
    "engages in a tense stand-off",
    "leaps into the unknown",
    "fights back with everything left",
    "narrowly evades capture",
    "delivers the final decisive blow",
  ],
};

/**
 * Deterministic-ish shuffle using a seed (mulberry32).
 */
function seededShuffle<T>(arr: T[], seed: number): T[] {
  const copy = [...arr];
  let s = seed >>> 0;
  for (let i = copy.length - 1; i > 0; i--) {
    s = (Math.imul(s ^ (s >>> 15), s | 1) >>> 0);
    s ^= s >>> 7;
    s = (Math.imul(s, 0x9e3779b9) >>> 0);
    const j = s % (i + 1);
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

/**
 * Pure, deterministic scene-script generator.
 * Splits the story into `sceneCount` beats using a stable template library
 * keyed by genre, then composes a per-scene prompt string.
 */
export function buildSoulCinemaScript(
  input: SoulCinemaScriptInput
): SoulCinemaScene[] {
  const {
    storyPrompt,
    sceneCount,
    genre,
    tone,
    characterName,
    seed = 42,
  } = input;

  const templates = BEAT_TEMPLATES[genre];
  const shuffled = seededShuffle(templates, seed);
  const selectedTemplates = shuffled.slice(0, sceneCount);

  const genreStyle = GENRE_STYLES[genre];
  const toneWord = TONE_WORDS[tone];

  return selectedTemplates.map((beatTemplate, i) => {
    const beat = `${characterName} ${beatTemplate}.`;
    const prompt = [
      `${characterName} — cinematic scene ${i + 1} of ${sceneCount}.`,
      `Story context: ${storyPrompt}`,
      `Scene: ${beat}`,
      `Visual style: ${genreStyle}.`,
      `Tone: ${toneWord}.`,
      `Cinematic, high production value, film-quality output.`,
    ].join(" ");

    return {
      sceneNumber: i + 1,
      beat,
      prompt,
    };
  });
}

/**
 * Maps a batch of scenes into an array of /api/generate request bodies.
 * Mirror of buildFashionBatch from lib/fashion.ts.
 */
export function buildSoulCinemaBatch(
  input: SoulCinemaBatchInput
): SoulCinemaGenerateRequest[] {
  const { scenes, model, aspectRatio, characterRefUrl, durationSec = 5 } = input;

  if (scenes.length === 0) return [];

  if (scenes.length > 6) {
    throw new Error("Soul Cinema supports at most 6 scenes");
  }

  const validScenes = scenes.filter((s) => s.beat && s.beat.trim().length > 0);

  return validScenes.map((scene) => {
    const req: SoulCinemaGenerateRequest = {
      prompt: scene.prompt,
      model,
      mediaType: "video",
      aspectRatio,
      duration: durationSec,
    };
    if (characterRefUrl) {
      req.imageUrl = characterRefUrl;
    }
    return req;
  });
}

// ─── Server action ────────────────────────────────────────────────────────────

export type ShowcaseCharacter = {
  id: string;
  name: string;
  avatarUrl: string;
  refImageUrl: string;
};

export const SHOWCASE_CHARACTERS: ShowcaseCharacter[] = [
  {
    id: "showcase-maya",
    name: "Maya",
    avatarUrl: "https://api.dicebear.com/7.x/personas/svg?seed=maya&backgroundColor=b6e3f4",
    refImageUrl: "https://api.dicebear.com/7.x/personas/svg?seed=maya-ref&backgroundColor=b6e3f4",
  },
  {
    id: "showcase-leo",
    name: "Leo",
    avatarUrl: "https://api.dicebear.com/7.x/personas/svg?seed=leo&backgroundColor=d1d4f9",
    refImageUrl: "https://api.dicebear.com/7.x/personas/svg?seed=leo-ref&backgroundColor=d1d4f9",
  },
  {
    id: "showcase-aria",
    name: "Aria",
    avatarUrl: "https://api.dicebear.com/7.x/personas/svg?seed=aria&backgroundColor=ffd5dc",
    refImageUrl: "https://api.dicebear.com/7.x/personas/svg?seed=aria-ref&backgroundColor=ffd5dc",
  },
];

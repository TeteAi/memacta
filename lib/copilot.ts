/**
 * Pure, deterministic suggestion engine for the Copilot feature.
 * No network calls. No React. Fully unit-testable in isolation.
 */

export type CopilotAction = {
  type:
    | "create-video"
    | "create-image"
    | "image-to-video"
    | "popcorn-preset"
    | "fashion-factory"
    | "soul-cinema"
    | "effect-shortcut"
    | "tool-redirect";
  label: string;
  href: string;
  icon?: "video" | "image" | "wand" | "spark" | "clapper" | "popcorn";
};

export type CopilotSuggestion = {
  reply: string;
  actions: CopilotAction[];
  intent: string;
};

export const COPILOT_STARTERS: Array<{
  intent: string;
  label: string;
  prompt: string;
}> = [
  {
    intent: "short-form",
    label: "Short-form reel",
    prompt: "Make me a short-form vertical reel for TikTok or Reels",
  },
  {
    intent: "fashion-lookbook",
    label: "Fashion lookbook",
    prompt: "Style a fashion lookbook — I have outfit references I want to use",
  },
  {
    intent: "character-scene",
    label: "Character + scene",
    prompt: "Build a character and cast them into a cinematic scene",
  },
  {
    intent: "image-to-video",
    label: "Image to video",
    prompt: "Turn a still image into a 5-second video with smooth motion",
  },
  {
    intent: "soul-cinema-beat",
    label: "Soul Cinema beat",
    prompt: "Write a narrative for Soul Cinema — a character-driven multi-scene story",
  },
  {
    intent: "recommend-model",
    label: "Which model for X?",
    prompt: "Recommend the best model for a slow cinematic reel with photorealistic rain",
  },
];

// ── keyword libraries ──────────────────────────────────────────────────────

const VIDEO_KEYWORDS = [
  "video", "reel", "clip", "cinematic", "film", "movie", "motion",
  "animation", "animate", "generate video", "create video", "10s", "10 s",
  "10-second", "5 second", "second video", "slow motion", "camera", "scene",
];

const IMAGE_KEYWORDS = [
  "image", "photo", "picture", "illustration", "portrait", "artwork", "generate image",
  "create image", "headshot", "avatar", "thumbnail",
];

const IMAGE_TO_VIDEO_KEYWORDS = [
  "turn this", "turn a", "photo into", "image into", "still into",
  "bring to life", "animate this", "animate a photo", "animate an image",
  "image to video", "photo to video",
];

const FASHION_KEYWORDS = [
  "fashion", "lookbook", "outfit", "style", "clothes", "clothing",
  "dress", "wear", "wardrobe", "streetwear", "y2k", "model",
];

const SHORT_FORM_KEYWORDS = [
  "tiktok", "reels", "short-form", "short form", "vertical", "9:16",
  "snack", "snappy", "quick clip", "popcorn",
];

const CHARACTER_KEYWORDS = [
  "character", "soul id", "soul cast", "cast", "person", "actor",
  "avatar character", "build a character", "create a character",
];

const SOUL_CINEMA_KEYWORDS = [
  "soul cinema", "narrative", "story", "multi-scene", "multi scene",
  "screenplay", "storyboard", "arc", "plot",
];

const MODEL_RECOMMEND_KEYWORDS = [
  "recommend", "which model", "best model", "what model", "suggest",
  "pick model", "what should i use", "which tool",
];

// ── primary action builders ────────────────────────────────────────────────

function makeVideoAction(prompt: string): CopilotAction {
  return {
    type: "create-video",
    label: "Use Veo 3.1 with this prompt",
    href: `/create/video?model=veo-31&prompt=${encodeURIComponent(prompt)}`,
    icon: "video",
  };
}

function makePopcornAction(presetId: string, subject: string): CopilotAction {
  return {
    type: "popcorn-preset",
    label: `Try "${presetIdToName(presetId)}" in Popcorn`,
    href: `/tools/popcorn?preset=${presetId}&subject=${encodeURIComponent(subject)}`,
    icon: "popcorn",
  };
}

function makeFashionAction(prompt: string): CopilotAction {
  return {
    type: "fashion-factory",
    label: "Open Fashion Factory",
    href: `/tools/fashion-factory?prompt=${encodeURIComponent(prompt)}`,
    icon: "wand",
  };
}

function makeSoulCinemaAction(prompt: string): CopilotAction {
  return {
    type: "soul-cinema",
    label: "Open Soul Cinema with this story",
    href: `/tools/soul-cinema?story=${encodeURIComponent(prompt)}&genre=drama`,
    icon: "clapper",
  };
}

function makeImageToVideoAction(prompt: string): CopilotAction {
  return {
    type: "image-to-video",
    label: "Animate with Image-to-Video",
    href: `/create/image-to-video?prompt=${encodeURIComponent(prompt)}`,
    icon: "video",
  };
}

function makeCharacterAction(): CopilotAction {
  return {
    type: "tool-redirect",
    label: "Build your character in Soul ID",
    href: "/tools/soul-id",
    icon: "spark",
  };
}

function makeImageAction(prompt: string): CopilotAction {
  return {
    type: "create-image",
    label: "Generate an image with Flux 2",
    href: `/create/image?model=flux-2&prompt=${encodeURIComponent(prompt)}`,
    icon: "image",
  };
}

function makeFallbackAction(): CopilotAction {
  return {
    type: "create-video",
    label: "Open Create",
    href: "/create/video",
    icon: "video",
  };
}

function presetIdToName(id: string): string {
  const map: Record<string, string> = {
    "cafe-gloom": "Cafe Gloom",
    "snack-hop": "Snack Hop",
    "neon-runway": "Neon Runway",
    "retro-grwm": "Retro GRWM",
    "sunset-drive": "Sunset Drive",
    "mirror-glitch": "Mirror Glitch",
    "tokyo-streetwear": "Tokyo Streetwear",
    "studio-cook": "Studio Cook",
    "locker-room-pump": "Locker Room Pump",
    "pet-close-up": "Pet Close-Up",
    "weekend-hike": "Weekend Hike",
    "night-in": "Night In",
  };
  return map[id] ?? id;
}

// ── intent detection ───────────────────────────────────────────────────────

function contains(msg: string, keywords: string[]): boolean {
  return keywords.some((kw) => msg.includes(kw));
}

function detectIntent(msg: string): string {
  if (contains(msg, IMAGE_TO_VIDEO_KEYWORDS)) return "image-to-video";
  if (contains(msg, SOUL_CINEMA_KEYWORDS)) return "soul-cinema-beat";
  if (contains(msg, FASHION_KEYWORDS)) return "fashion-lookbook";
  if (contains(msg, SHORT_FORM_KEYWORDS)) return "short-form";
  if (contains(msg, CHARACTER_KEYWORDS)) return "character-scene";
  if (contains(msg, MODEL_RECOMMEND_KEYWORDS)) return "recommend-model";
  if (contains(msg, VIDEO_KEYWORDS)) return "video";
  if (contains(msg, IMAGE_KEYWORDS)) return "image";
  return "general";
}

// ── reply & actions per intent ─────────────────────────────────────────────

function buildFromIntent(intent: string, prompt: string): CopilotSuggestion {
  switch (intent) {
    case "short-form": {
      return {
        reply:
          "For short-form vertical content, Popcorn is the fastest path — pick a preset and pop 3 variations in one click. If you want a longer cinematic cut, Veo 3.1 with a crafted prompt delivers stunning results too.",
        actions: [
          makePopcornAction("cafe-gloom", prompt),
          makeVideoAction(prompt),
          makePopcornAction("snack-hop", prompt),
        ].slice(0, 4),
        intent,
      };
    }

    case "fashion-lookbook": {
      return {
        reply:
          "Fashion Factory is built exactly for this. Upload one person plus up to 6 outfit references and it generates a full styled lookbook in one click using flux-kontext.",
        actions: [
          makeFashionAction(prompt),
          makeVideoAction(prompt),
        ],
        intent,
      };
    }

    case "character-scene": {
      return {
        reply:
          "Start by locking your character in Soul ID, then cast them into any scene with Soul Cast. For a full multi-scene narrative, Soul Cinema chains the character through a directed story arc.",
        actions: [
          makeCharacterAction(),
          makeSoulCinemaAction(prompt),
          {
            type: "tool-redirect",
            label: "Cast character in Soul Cast",
            href: "/tools/soul-cast",
            icon: "spark",
          } as CopilotAction,
        ].slice(0, 4),
        intent,
      };
    }

    case "image-to-video": {
      return {
        reply:
          "Image-to-Video animates your still photo into a smooth short clip. Upload your image, add a motion prompt, and choose your preferred model.",
        actions: [
          makeImageToVideoAction(prompt),
          makeVideoAction(prompt),
        ],
        intent,
      };
    }

    case "soul-cinema-beat": {
      return {
        reply:
          "Soul Cinema is designed for exactly this. Describe your story, pick a genre and tone, and it auto-generates a multi-scene narrative reel for your character.",
        actions: [
          makeSoulCinemaAction(prompt),
          makeVideoAction(prompt),
        ],
        intent,
      };
    }

    case "recommend-model": {
      return {
        reply:
          "Veo 3.1 is the top pick for photoreal cinematic video with rain, motion blur, and atmospheric depth. For short-form vertical bursts, Kling 2.5 Turbo in Popcorn is the fastest option.",
        actions: [
          makeVideoAction(prompt),
          makePopcornAction("cafe-gloom", prompt),
          {
            type: "create-video",
            label: "Browse all 18 models",
            href: "/models",
            icon: "spark",
          } as CopilotAction,
        ].slice(0, 4),
        intent,
      };
    }

    case "video": {
      return {
        reply:
          "For a cinematic video reel, Veo 3.1 gives the best photoreal motion. If you want a quick vertical pack instead, Popcorn's presets nail short-form in one click.",
        actions: [
          makeVideoAction(prompt),
          makePopcornAction("cafe-gloom", prompt),
          makeSoulCinemaAction(prompt),
        ].slice(0, 4),
        intent,
      };
    }

    case "image": {
      return {
        reply:
          "Flux 2 and GPT-Image-1.5 are both excellent for high-quality image generation. Flux 2 is faster; GPT-Image-1.5 handles complex compositions better.",
        actions: [
          makeImageAction(prompt),
          {
            type: "create-image",
            label: "Try GPT-Image-1.5",
            href: `/create/image?model=gpt-image-15&prompt=${encodeURIComponent(prompt)}`,
            icon: "image",
          } as CopilotAction,
        ],
        intent,
      };
    }

    default: {
      return {
        reply:
          "I can help you pick the right tool, model, or preset. Try describing what you want to make — a video, a lookbook, a narrative reel — and I'll route you straight there.",
        actions: [
          makeFallbackAction(),
          makeFashionAction(prompt),
          makeSoulCinemaAction(prompt),
          makePopcornAction("snack-hop", prompt),
        ].slice(0, 4),
        intent: "general",
      };
    }
  }
}

// ── public entry point ─────────────────────────────────────────────────────

export function buildCopilotSuggestion(
  userMessage: string,
  intent?: string,
): CopilotSuggestion {
  const lower = userMessage.toLowerCase();
  const resolvedIntent = intent ?? detectIntent(lower);
  const suggestion = buildFromIntent(resolvedIntent, userMessage);

  // Hard cap: max 4 actions
  suggestion.actions = suggestion.actions.slice(0, 4);

  // Ensure every action has a non-empty label, valid href, and valid type
  suggestion.actions = suggestion.actions.filter(
    (a) =>
      a.label.length > 0 &&
      a.href.startsWith("/") &&
      a.type.length > 0,
  );

  // Fallback: always have at least 1 action
  if (suggestion.actions.length === 0) {
    suggestion.actions = [makeFallbackAction()];
  }

  return suggestion;
}

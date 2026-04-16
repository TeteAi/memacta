/**
 * Pure helper functions for the Mixed Media Studio feature.
 * No React, no DB — fully unit-testable in isolation.
 */

export type MixedMediaStyle = {
  id: string;
  name: string;
  tagline: string;
  gradientClass: string;
  promptFragment: string;
  compatibleMedia: ("image" | "video")[];
};

export const MIXED_MEDIA_STYLES: MixedMediaStyle[] = [
  {
    id: "anime-realism",
    name: "Anime Realism",
    tagline: "2D characters, 3D depth",
    gradientClass: "from-pink-500 to-purple-500",
    promptFragment:
      "anime character design blended with photorealistic lighting and cinematic depth",
    compatibleMedia: ["image", "video"],
  },
  {
    id: "oil-painting",
    name: "Oil Painting",
    tagline: "classical brushwork",
    gradientClass: "from-amber-600 to-rose-500",
    promptFragment:
      "rich oil-painting brushstrokes, Rembrandt-style lighting, thick impasto texture",
    compatibleMedia: ["image"],
  },
  {
    id: "3d-claymation",
    name: "3D Claymation",
    tagline: "stop-motion clay",
    gradientClass: "from-orange-400 to-yellow-400",
    promptFragment:
      "stop-motion claymation aesthetic, visible clay thumbprints, soft studio lighting",
    compatibleMedia: ["image", "video"],
  },
  {
    id: "pixel-dream",
    name: "Pixel Dream",
    tagline: "16-bit nostalgia",
    gradientClass: "from-cyan-400 to-violet-500",
    promptFragment:
      "16-bit pixel-art style with dithering, limited color palette, retro game aesthetic",
    compatibleMedia: ["image", "video"],
  },
  {
    id: "renaissance",
    name: "Renaissance",
    tagline: "museum grandeur",
    gradientClass: "from-yellow-700 to-amber-900",
    promptFragment:
      "Renaissance oil-painting composition, dramatic chiaroscuro, museum gallery aesthetic",
    compatibleMedia: ["image"],
  },
  {
    id: "cyberpunk-noir",
    name: "Cyberpunk Noir",
    tagline: "neon rain detective",
    gradientClass: "from-fuchsia-500 to-cyan-400",
    promptFragment:
      "cyberpunk noir atmosphere with neon-reflected rain, volumetric fog, detective-film framing",
    compatibleMedia: ["image", "video"],
  },
  {
    id: "vaporwave",
    name: "Vaporwave",
    tagline: "80s synth sunset",
    gradientClass: "from-pink-400 to-cyan-300",
    promptFragment:
      "vaporwave aesthetic, 80s synthwave sunset, chromatic gradient, retro computer-graphics",
    compatibleMedia: ["image", "video"],
  },
  {
    id: "paper-cutout",
    name: "Paper Cutout",
    tagline: "layered paper craft",
    gradientClass: "from-emerald-400 to-sky-400",
    promptFragment:
      "handcrafted paper cutout style, layered construction-paper depth, visible paper fibers",
    compatibleMedia: ["image"],
  },
  {
    id: "sketch-to-real",
    name: "Sketch to Real",
    tagline: "pencil becomes photo",
    gradientClass: "from-stone-400 to-stone-600",
    promptFragment:
      "hybrid pencil-sketch blending seamlessly into photorealistic rendering, graphite edge details",
    compatibleMedia: ["image"],
  },
  {
    id: "watercolor",
    name: "Watercolor",
    tagline: "soft wet-on-wet flow",
    gradientClass: "from-teal-300 to-blue-400",
    promptFragment:
      "watercolor wet-on-wet painting style, soft color bleeds, delicate washes",
    compatibleMedia: ["image"],
  },
  {
    id: "low-poly",
    name: "Low Poly",
    tagline: "geometric 3D",
    gradientClass: "from-violet-500 to-indigo-600",
    promptFragment:
      "low-polygon 3D-render aesthetic, faceted geometry, flat shaded lighting",
    compatibleMedia: ["image", "video"],
  },
  {
    id: "chromatic-glitch",
    name: "Chromatic Glitch",
    tagline: "RGB split VHS",
    gradientClass: "from-red-500 to-blue-500",
    promptFragment:
      "chromatic aberration glitch effect, RGB-channel split, VHS scanline interference",
    compatibleMedia: ["image", "video"],
  },
];

// ---- Error types ----

export class MixedMediaSelectionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "MixedMediaSelectionError";
  }
}

export class MixedMediaIncompatibleMediaError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "MixedMediaIncompatibleMediaError";
  }
}

// ---- composeMixedMediaPrompt ----

export type ComposeMixedMediaInput = {
  selectedStyleIds: string[];
  subjectPrompt: string;
  mediaType: "image" | "video";
};

export function composeMixedMediaPrompt(input: ComposeMixedMediaInput): string {
  const { selectedStyleIds, subjectPrompt } = input;
  const fragments = selectedStyleIds.map((id) => {
    const style = MIXED_MEDIA_STYLES.find((s) => s.id === id);
    if (!style) throw new Error(`Unknown style id: ${id}`);
    return style.promptFragment;
  });
  return `${fragments.join(" fused with ")} - subject: ${subjectPrompt}`;
}

// ---- buildMixedMediaBlends ----

export type MixedMediaBlend = {
  blendId: string;
  styleIds: string[];
  styleNames: string[];
};

export function buildMixedMediaBlends(selectedStyleIds: string[]): MixedMediaBlend[] {
  if (selectedStyleIds.length < 2 || selectedStyleIds.length > 3) {
    throw new MixedMediaSelectionError(
      `Must select 2 or 3 styles, got ${selectedStyleIds.length}`,
    );
  }
  const sorted = [...selectedStyleIds].sort();
  const styleNames = sorted.map((id) => {
    const style = MIXED_MEDIA_STYLES.find((s) => s.id === id);
    return style ? style.name : id;
  });
  return [
    {
      blendId: sorted.join("-x-"),
      styleIds: sorted,
      styleNames,
    },
  ];
}

// ---- buildMixedMediaBatch ----

export type MixedMediaBatchInput = {
  selectedStyleIds: string[];
  subjectPrompt: string;
  referenceUrl?: string;
  mediaType: "image" | "video";
  aspectRatio: "1:1" | "16:9" | "9:16";
  variationsPerBlend: 1 | 2 | 3;
  videoModel?: string;
  imageModel?: string;
};

export type MixedMediaRequest = {
  blendId: string;
  variationIndex: number;
  prompt: string;
  model: string;
  mediaType: "image" | "video";
  aspectRatio: "1:1" | "16:9" | "9:16";
  imageUrl?: string;
  duration?: number;
};

export function buildMixedMediaBatch(input: MixedMediaBatchInput): MixedMediaRequest[] {
  const {
    selectedStyleIds,
    subjectPrompt,
    referenceUrl,
    mediaType,
    aspectRatio,
    variationsPerBlend,
    videoModel = "kling-25-turbo",
    imageModel = "flux-kontext",
  } = input;

  // Check compatibility
  for (const id of selectedStyleIds) {
    const style = MIXED_MEDIA_STYLES.find((s) => s.id === id);
    if (style && !style.compatibleMedia.includes(mediaType)) {
      throw new MixedMediaIncompatibleMediaError(
        `Style "${style.name}" (${id}) is not compatible with mediaType="${mediaType}"`,
      );
    }
  }

  const blends = buildMixedMediaBlends(selectedStyleIds);
  const model = mediaType === "video" ? videoModel : imageModel;

  const requests: MixedMediaRequest[] = [];
  for (const blend of blends) {
    const prompt = composeMixedMediaPrompt({ selectedStyleIds: blend.styleIds, subjectPrompt, mediaType });
    for (let i = 0; i < variationsPerBlend; i++) {
      const req: MixedMediaRequest = {
        blendId: blend.blendId,
        variationIndex: i,
        prompt,
        model,
        mediaType,
        aspectRatio,
      };
      if (referenceUrl) {
        req.imageUrl = referenceUrl;
      }
      if (mediaType === "video") {
        req.duration = 5;
      }
      requests.push(req);
    }
  }

  return requests;
}

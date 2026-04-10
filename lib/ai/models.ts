export type ModelInfo = {
  id: string;
  name: string;
  mediaType: "video" | "image";
  description: string;
  badge?: string;
  defaultAspect: "16:9" | "9:16" | "1:1";
};

export const MODELS: ModelInfo[] = [
  // --- Video (10) ---
  { id: "kling-3",        name: "Kling 3",         mediaType: "video", description: "High-fidelity cinematic video",   badge: "new",  defaultAspect: "16:9" },
  { id: "kling-25-turbo", name: "Kling 2.5 Turbo", mediaType: "video", description: "Fast drafts, low latency",        badge: "fast", defaultAspect: "16:9" },
  { id: "kling-o1",       name: "Kling O1",        mediaType: "video", description: "Reasoning-assisted motion",                       defaultAspect: "16:9" },
  { id: "sora-2",         name: "Sora 2",          mediaType: "video", description: "Long-form narrative video",       badge: "pro",  defaultAspect: "16:9" },
  { id: "veo-31",         name: "Veo 3.1",         mediaType: "video", description: "Photoreal motion from Google",                    defaultAspect: "16:9" },
  { id: "veo-3",          name: "Veo 3",           mediaType: "video", description: "Stable general-purpose video",                    defaultAspect: "16:9" },
  { id: "wan-26",         name: "Wan 2.6",         mediaType: "video", description: "Open-weights cinematic",                          defaultAspect: "16:9" },
  { id: "minimax-hailuo", name: "MiniMax Hailuo",  mediaType: "video", description: "Character-consistent scenes",                     defaultAspect: "16:9" },
  { id: "seedance-20",    name: "Seedance 2.0",    mediaType: "video", description: "Dance and motion specialist",                     defaultAspect: "9:16" },
  { id: "seedance-pro",   name: "Seedance Pro",    mediaType: "video", description: "Pro-grade dance/motion",          badge: "pro",  defaultAspect: "9:16" },

  // --- Image (8) ---
  { id: "soul-v2",         name: "Soul v2",         mediaType: "image", description: "Stylized portraits",                             defaultAspect: "1:1" },
  { id: "nano-banana-pro", name: "Nano Banana Pro", mediaType: "image", description: "Pro photoreal image",            badge: "pro",  defaultAspect: "1:1" },
  { id: "nano-banana-2",   name: "Nano Banana 2",   mediaType: "image", description: "Fast general image",             badge: "fast", defaultAspect: "1:1" },
  { id: "wan-25-image",    name: "Wan 2.5 Image",   mediaType: "image", description: "Open-weights image",                             defaultAspect: "1:1" },
  { id: "seedream-4",      name: "Seedream 4",      mediaType: "image", description: "Dreamlike surreal image",                        defaultAspect: "1:1" },
  { id: "gpt-image-15",    name: "GPT Image 1.5",   mediaType: "image", description: "Instructable image model",                       defaultAspect: "1:1" },
  { id: "flux-kontext",    name: "Flux Kontext",    mediaType: "image", description: "Context-aware editing",                          defaultAspect: "1:1" },
  { id: "flux-2",          name: "Flux 2",          mediaType: "image", description: "High-quality general image",     badge: "new",  defaultAspect: "1:1" },
];

export const videoModels = () => MODELS.filter((m) => m.mediaType === "video");
export const imageModels = () => MODELS.filter((m) => m.mediaType === "image");
export const getModel = (id: string) => MODELS.find((m) => m.id === id);

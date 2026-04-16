import { fal } from "@fal-ai/client";
import type { AIProvider, GenerationRequest, GenerationResult } from "./provider";

// Map our internal model IDs -> fal.ai endpoint slugs.
// Kept intentionally conservative — each entry is a known-available fal endpoint.
// Models not yet on fal fall back to a solid general-purpose endpoint.
export const FAL_ENDPOINTS: Record<string, string> = {
  // --- video ---
  "kling-3":        "fal-ai/kling-video/v2/master/text-to-video",
  "kling-25-turbo": "fal-ai/kling-video/v2.5-turbo/text-to-video",
  "kling-o1":       "fal-ai/kling-video/v2/master/text-to-video",
  "sora-2":         "fal-ai/sora-2/text-to-video",
  "veo-31":         "fal-ai/veo3/fast",
  "veo-3":          "fal-ai/veo3/fast",
  "wan-26":         "fal-ai/wan-25-preview/text-to-video",
  "minimax-hailuo": "fal-ai/minimax/hailuo-02/standard/text-to-video",
  "seedance-20":    "fal-ai/bytedance/seedance/v1/pro/text-to-video",
  "seedance-pro":   "fal-ai/bytedance/seedance/v1/pro/text-to-video",

  // --- image-to-video variants ---
  "kling-3-i2v":        "fal-ai/kling-video/v2/master/image-to-video",
  "kling-25-turbo-i2v": "fal-ai/kling-video/v2.5-turbo/image-to-video",
  "minimax-hailuo-i2v": "fal-ai/minimax/hailuo-02/standard/image-to-video",
  "seedance-20-i2v":    "fal-ai/bytedance/seedance/v1/pro/image-to-video",

  // --- image ---
  "nano-banana-pro": "fal-ai/nano-banana/pro",
  "nano-banana-2":   "fal-ai/nano-banana",
  "wan-25-image":    "fal-ai/wan-25-preview/text-to-image",
  "seedream-4":      "fal-ai/bytedance/seedream/v4/text-to-image",
  "gpt-image-15":    "fal-ai/gpt-image-1/text-to-image",
  "flux-kontext":    "fal-ai/flux-pro/kontext",
  "flux-2":          "fal-ai/flux-pro/v1.1-ultra",
  "soul-v2":         "fal-ai/flux-pro/v1.1-ultra",
};

function aspectToSize(a?: "16:9" | "9:16" | "1:1"):
  | "square_hd"
  | "landscape_16_9"
  | "portrait_16_9"
  | undefined {
  if (a === "16:9") return "landscape_16_9";
  if (a === "9:16") return "portrait_16_9";
  if (a === "1:1") return "square_hd";
  return undefined;
}

function buildInput(req: GenerationRequest): Record<string, unknown> {
  const input: Record<string, unknown> = { prompt: req.prompt };

  if (req.mediaType === "video") {
    if (req.durationSec) input.duration = String(req.durationSec);
    if (req.aspectRatio) input.aspect_ratio = req.aspectRatio;
    if (req.imageUrl) input.image_url = req.imageUrl;
  } else {
    // image models
    const size = aspectToSize(req.aspectRatio);
    if (size) input.image_size = size;
    if (req.imageUrl) input.image_url = req.imageUrl;
    if (typeof req.seed === "number") input.seed = req.seed;
  }

  return input;
}

// Pull the final media URL out of whichever shape fal returns.
// Most text-to-image returns `images: [{url}]`; video returns `video: {url}` or similar.
function extractMediaUrl(data: unknown): string | undefined {
  if (!data || typeof data !== "object") return undefined;
  const d = data as Record<string, unknown>;

  // video shapes
  const video = d.video as { url?: string } | undefined;
  if (video?.url) return video.url;

  // sora-style
  if (typeof d.video_url === "string") return d.video_url;

  // image shapes
  const images = d.images as Array<{ url?: string }> | undefined;
  if (Array.isArray(images) && images[0]?.url) return images[0].url;

  // single image
  const image = d.image as { url?: string } | undefined;
  if (image?.url) return image.url;

  if (typeof d.url === "string") return d.url;

  return undefined;
}

function resolveEndpoint(model: string, mediaType: "video" | "image", imageUrl?: string): string {
  // If an image URL is supplied on a video model, prefer the image-to-video variant.
  if (mediaType === "video" && imageUrl) {
    const i2v = FAL_ENDPOINTS[`${model}-i2v`];
    if (i2v) return i2v;
  }
  return FAL_ENDPOINTS[model] ?? FAL_ENDPOINTS["flux-2"];
}

export const falProvider: AIProvider = {
  id: "fal",
  supportedModels: Object.keys(FAL_ENDPOINTS),

  async generate(req: GenerationRequest): Promise<GenerationResult> {
    const key = process.env.FAL_KEY;
    if (!key) {
      return {
        id: crypto.randomUUID(),
        status: "failed",
        error: "FAL_KEY is not configured on the server",
        createdAt: new Date().toISOString(),
      };
    }

    // Configure the client lazily — safe to call per-request.
    fal.config({ credentials: key });

    const endpoint = resolveEndpoint(req.model, req.mediaType, req.imageUrl);
    const input = buildInput(req);

    try {
      const result = await fal.subscribe(endpoint, {
        input,
        logs: false,
      });

      const url = extractMediaUrl(result.data);
      if (!url) {
        return {
          id: (result.requestId as string) ?? crypto.randomUUID(),
          status: "failed",
          error: "Model returned no media URL",
          createdAt: new Date().toISOString(),
        };
      }

      return {
        id: (result.requestId as string) ?? crypto.randomUUID(),
        status: "succeeded",
        url,
        createdAt: new Date().toISOString(),
      };
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Generation failed";
      return {
        id: crypto.randomUUID(),
        status: "failed",
        error: msg,
        createdAt: new Date().toISOString(),
      };
    }
  },

  async status(id: string): Promise<GenerationResult> {
    // fal.subscribe resolves synchronously once complete, so we don't track
    // long-lived jobs here. Callers should treat `generate` as terminal.
    return {
      id,
      status: "failed",
      error: "status() not supported for synchronous subscribe flow",
      createdAt: new Date().toISOString(),
    };
  },
};

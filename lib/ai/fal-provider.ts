import { fal } from "@fal-ai/client";
import type { AIProvider, GenerationRequest, GenerationResult } from "./provider";

/**
 * Human-friendly error mapping for fal upstream failures.
 *
 * We translate HTTP status codes + known error strings into a message the
 * user can actually act on. Everything else bubbles up as a generic
 * "Generation failed" so we don't leak stack traces into the UI.
 */
export function friendlyFalError(status: number | null, rawMessage: string): string {
  const msg = rawMessage.toLowerCase();

  // Auth / plan — some models require higher fal tiers than inference-only keys.
  if (status === 403 || /forbidden|not.*authoriz/.test(msg)) {
    if (/queue/.test(msg)) {
      return "Video generation needs fal.ai queue access — check your plan at fal.ai/dashboard/billing.";
    }
    return "This model isn't available on your current fal.ai plan. Try a different model.";
  }

  // Rate limits — retriable with backoff.
  if (status === 429 || /rate.?limit|too many requests/.test(msg)) {
    return "We're generating a lot right now. Please try again in 30 seconds.";
  }

  // Upstream service down — our side, users just need to wait.
  if (status !== null && status >= 500) {
    return "AI service is temporarily down. Please try again in a minute.";
  }

  // Billing — the top-level fal account is out of credits.
  if (/exhausted balance|insufficient.*balance|payment required/.test(msg)) {
    return "Service is over capacity right now. We're topping up — try again shortly.";
  }

  // Invalid prompt / content rejected at fal's edge (they have their own moderation).
  if (status === 400 || /invalid.*prompt|content.*policy|safety/.test(msg)) {
    return "That prompt was rejected upstream. Try rephrasing or pick a different model.";
  }

  // Network-level failures (fetch threw before getting a response).
  if (/fetch failed|econnrefused|enotfound|network/.test(msg)) {
    return "Couldn't reach the AI service. Check your connection and try again.";
  }

  return "Generation failed. Please try again.";
}

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

    // Images → direct sync POST to fal.run. This uses the "inference" API
    // surface which all FAL_KEYs have access to. fal.subscribe uses the
    // separate "queue" API (queue.fal.run) which inference-only keys 403 on
    // with a generic "Forbidden" — exactly what we saw in prod. The sync
    // endpoint has a 60s timeout, which is plenty for images (5-30s typical).
    //
    // Videos → keep fal.subscribe since they can run >60s and need the queue.
    // If the queue 403s we surface the friendlier message below.
    if (req.mediaType === "image") {
      // Hard timeout: fal.run's sync endpoint has a 60s ceiling, but Vercel
      // serverless functions can be shorter. Abort after 55s so we surface a
      // clean timeout error rather than have the platform kill us.
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 55_000);
      try {
        const res = await fetch(`https://fal.run/${endpoint}`, {
          method: "POST",
          headers: {
            "content-type": "application/json",
            authorization: `Key ${key}`,
          },
          body: JSON.stringify(input),
          signal: controller.signal,
        });
        if (!res.ok) {
          const text = await res.text().catch(() => "");
          // eslint-disable-next-line no-console
          console.warn(`[fal-provider] image ${endpoint} ${res.status}`, text.slice(0, 300));
          return {
            id: crypto.randomUUID(),
            status: "failed",
            error: friendlyFalError(res.status, text),
            createdAt: new Date().toISOString(),
          };
        }
        const data = (await res.json().catch(() => null)) as unknown;
        const url = extractMediaUrl(data);
        if (!url) {
          return {
            id: crypto.randomUUID(),
            status: "failed",
            error: "The model returned no image. Try a different model or prompt.",
            createdAt: new Date().toISOString(),
          };
        }
        return {
          id: crypto.randomUUID(),
          status: "succeeded",
          url,
          createdAt: new Date().toISOString(),
        };
      } catch (e) {
        const msg = e instanceof Error ? e.message : "Generation failed";
        const isAbort = e instanceof Error && e.name === "AbortError";
        // eslint-disable-next-line no-console
        console.warn(`[fal-provider] image ${endpoint} threw:`, msg);
        return {
          id: crypto.randomUUID(),
          status: "failed",
          error: isAbort
            ? "Generation took too long and was cancelled. Try a smaller image or different model."
            : friendlyFalError(null, msg),
          createdAt: new Date().toISOString(),
        };
      } finally {
        clearTimeout(timeout);
      }
    }

    // Video path — queue mode via fal.subscribe.
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
          error: "The model returned no video. Try a different model or prompt.",
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
      // fal.subscribe errors sometimes expose a status on the error object.
      const status =
        e && typeof e === "object" && "status" in e && typeof e.status === "number"
          ? e.status
          : null;
      // eslint-disable-next-line no-console
      console.warn(`[fal-provider] video ${endpoint} subscribe threw:`, { status, msg });
      return {
        id: crypto.randomUUID(),
        status: "failed",
        error: friendlyFalError(status, msg),
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

/**
 * Persona-specific fal.ai provider functions.
 * Extends the base fal provider (lib/ai/fal-provider.ts) with 4 new functions
 * that are specific to the Persona (soul-id) feature.
 *
 * Third-party endpoints used (comments only):
 *   - fal-ai/imageutils/face-detect  (face bbox, ArcFace score, NSFW)
 *   - fal-ai/flux-pulid               (PuLID zero-shot face ID on Flux)
 *   - fal-ai/flux-lora-fast-training  (per-user LoRA fine-tune)
 *   - fal-ai/flux-lora                (inference with trained LoRA)
 *
 * All functions:
 *   - Lazily read FAL_KEY per-call
 *   - Return structured failure (never throw)
 *   - Log with prefix [fal:persona]
 *   - Map errors through friendlyFalError
 */

import { friendlyFalError } from "@/lib/ai/fal-provider";

const LOG = "[fal:persona]";

function getFalKey(): string | null {
  return process.env.FAL_KEY ?? null;
}

async function falPost(
  endpoint: string,
  body: Record<string, unknown>,
  timeoutMs = 60_000
): Promise<{ ok: boolean; status: number; data: unknown; text: string }> {
  const key = getFalKey();
  if (!key) {
    return { ok: false, status: 0, data: null, text: "FAL_KEY not configured" };
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(`https://fal.run/${endpoint}`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Key ${key}`,
      },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
    const text = await res.text().catch(() => "");
    let data: unknown = null;
    try {
      data = JSON.parse(text);
    } catch {
      data = null;
    }
    return { ok: res.ok, status: res.status, data, text };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return { ok: false, status: 0, data: null, text: msg };
  } finally {
    clearTimeout(timer);
  }
}

// ─── Mock mode ───────────────────────────────────────────────────────────────
// When MOCK_FAL=true and NODE_ENV !== 'production', all functions return
// deterministic mock responses. Used in E2E tests.

function isMock(): boolean {
  return process.env.MOCK_FAL === "true" && process.env.NODE_ENV !== "production";
}

// ─── createFaceDetect ─────────────────────────────────────────────────────────

export interface FaceDetectResult {
  faceCount: number;
  primaryBbox?: { x: number; y: number; w: number; h: number };
  primaryScore?: number;
  ageEstimate?: number;
  nsfwScore?: number;
  embedding?: Float32Array;
}

/**
 * Detects faces in an image via fal-ai/imageutils/face-detect.
 * Returns face count, bounding box, age estimate, NSFW score.
 */
export async function createFaceDetect(p: {
  imageUrl: string;
}): Promise<FaceDetectResult> {
  if (isMock()) {
    // Stub: single adult face, no NSFW
    return {
      faceCount: 1,
      primaryBbox: { x: 100, y: 80, w: 200, h: 250 },
      primaryScore: 0.98,
      ageEstimate: 25,
      nsfwScore: 0.01,
    };
  }

  const res = await falPost("fal-ai/imageutils/face-detect", {
    image_url: p.imageUrl,
  });

  if (!res.ok) {
    // eslint-disable-next-line no-console
    console.warn(LOG, "face-detect failed", res.status, res.text.slice(0, 200));
    return { faceCount: 0 };
  }

  const d = res.data as Record<string, unknown> | null;
  if (!d) return { faceCount: 0 };

  // fal-ai/imageutils/face-detect response shape:
  // { faces: [{ bbox: {x,y,w,h}, score, age, nsfw_score }] }
  const faces = (d.faces as Array<Record<string, unknown>> | undefined) ?? [];
  const primary = faces[0];

  let bbox: { x: number; y: number; w: number; h: number } | undefined;
  if (primary?.bbox && typeof primary.bbox === "object") {
    const b = primary.bbox as Record<string, number>;
    bbox = { x: b.x ?? 0, y: b.y ?? 0, w: b.w ?? 0, h: b.h ?? 0 };
  }

  return {
    faceCount: faces.length,
    primaryBbox: bbox,
    primaryScore: typeof primary?.score === "number" ? primary.score : undefined,
    ageEstimate: typeof primary?.age === "number" ? primary.age : undefined,
    nsfwScore: typeof primary?.nsfw_score === "number" ? primary.nsfw_score : undefined,
  };
}

// ─── createFluxPulidGeneration ────────────────────────────────────────────────

export interface FluxPulidResult {
  status: "succeeded" | "failed";
  url?: string;
  error?: string;
  requestId: string;
}

/**
 * Generates an image using PuLID zero-shot face ID on Flux.1-dev.
 * Used for instant-tier Persona generation and preview images.
 */
export async function createFluxPulidGeneration(p: {
  referenceImageUrl: string;
  prompt: string;
  negativePrompt?: string;
  width?: number;
  height?: number;
  seed?: number;
  strength?: number;
}): Promise<FluxPulidResult> {
  if (isMock()) {
    return {
      status: "succeeded",
      url: "https://placehold.co/1024x1024/1a1a2e/fe2c55?text=mock-pulid",
      requestId: `mock-${Date.now()}`,
    };
  }

  const res = await falPost(
    "fal-ai/flux-pulid",
    {
      reference_image_url: p.referenceImageUrl,
      prompt: p.prompt,
      negative_prompt: p.negativePrompt ?? "",
      image_size: { width: p.width ?? 1024, height: p.height ?? 1024 },
      seed: p.seed,
      id_scale: p.strength ?? 1.0,
    },
    90_000
  );

  if (!res.ok) {
    // eslint-disable-next-line no-console
    console.warn(LOG, "flux-pulid failed", res.status, res.text.slice(0, 200));
    return {
      status: "failed",
      error: friendlyFalError(res.status, res.text),
      requestId: crypto.randomUUID(),
    };
  }

  const d = res.data as Record<string, unknown> | null;
  const images = (d?.images as Array<{ url?: string }> | undefined) ?? [];
  const url = images[0]?.url ?? (typeof d?.image_url === "string" ? d.image_url : undefined);

  if (!url) {
    return {
      status: "failed",
      error: "No image returned from flux-pulid",
      requestId: crypto.randomUUID(),
    };
  }

  return { status: "succeeded", url, requestId: crypto.randomUUID() };
}

// ─── startFluxLoraTraining ────────────────────────────────────────────────────

export interface LoraTrainingResult {
  jobId: string;
  status: "queued" | "running" | "failed";
  error?: string;
}

/**
 * Starts an async LoRA fine-tune via fal-ai/flux-lora-fast-training.
 * Returns the job ID immediately; completion is delivered via webhook.
 */
export async function startFluxLoraTraining(p: {
  imagesZipUrl: string;
  triggerWord: string;
  webhookUrl: string;
  steps?: number;
  baseModel?: "flux-dev";
}): Promise<LoraTrainingResult> {
  if (isMock()) {
    return {
      jobId: `mock-job-${Date.now()}`,
      status: "queued",
    };
  }

  const key = getFalKey();
  if (!key) {
    return { jobId: "", status: "failed", error: "FAL_KEY not configured" };
  }

  // fal-ai/flux-lora-fast-training uses the async queue API.
  // We call /queue/submit, which returns a request_id immediately.
  try {
    const res = await fetch("https://queue.fal.run/fal-ai/flux-lora-fast-training", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Key ${key}`,
      },
      body: JSON.stringify({
        images_data_url: p.imagesZipUrl,
        trigger_word: p.triggerWord,
        steps: p.steps ?? 1000,
        // fal expects a webhook_url param
        webhook_url: p.webhookUrl,
      }),
    });

    const text = await res.text().catch(() => "");
    if (!res.ok) {
      // eslint-disable-next-line no-console
      console.warn(LOG, "flux-lora-fast-training queue submit failed", res.status, text.slice(0, 200));
      return {
        jobId: "",
        status: "failed",
        error: friendlyFalError(res.status, text),
      };
    }

    let data: Record<string, unknown> = {};
    try {
      data = JSON.parse(text);
    } catch {
      data = {};
    }

    const jobId = (data.request_id as string | undefined) ?? "";
    return { jobId, status: "queued" };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    // eslint-disable-next-line no-console
    console.warn(LOG, "startFluxLoraTraining threw:", msg);
    return { jobId: "", status: "failed", error: friendlyFalError(null, msg) };
  }
}

// ─── createFluxLoraGeneration ────────────────────────────────────────────────

export interface FluxLoraResult {
  status: "succeeded" | "failed";
  url?: string;
  error?: string;
  requestId: string;
}

/**
 * Generates an image using a trained LoRA via fal-ai/flux-lora.
 * Used for premium-tier Persona generation.
 */
export async function createFluxLoraGeneration(p: {
  loraUrl: string;
  triggerWord: string;
  scale?: number;
  prompt: string;
  negativePrompt?: string;
  width?: number;
  height?: number;
  seed?: number;
}): Promise<FluxLoraResult> {
  if (isMock()) {
    return {
      status: "succeeded",
      url: "https://placehold.co/1024x1024/1a1a2e/ff9f40?text=mock-lora",
      requestId: `mock-lora-${Date.now()}`,
    };
  }

  const res = await falPost(
    "fal-ai/flux-lora",
    {
      prompt: p.prompt,
      negative_prompt: p.negativePrompt ?? "",
      loras: [{ path: p.loraUrl, scale: p.scale ?? 0.9 }],
      image_size: { width: p.width ?? 1024, height: p.height ?? 1024 },
      seed: p.seed,
    },
    90_000
  );

  if (!res.ok) {
    // eslint-disable-next-line no-console
    console.warn(LOG, "flux-lora generation failed", res.status, res.text.slice(0, 200));
    return {
      status: "failed",
      error: friendlyFalError(res.status, res.text),
      requestId: crypto.randomUUID(),
    };
  }

  const d = res.data as Record<string, unknown> | null;
  const images = (d?.images as Array<{ url?: string }> | undefined) ?? [];
  const url = images[0]?.url ?? (typeof d?.image_url === "string" ? d.image_url : undefined);

  if (!url) {
    return {
      status: "failed",
      error: "No image returned from flux-lora",
      requestId: crypto.randomUUID(),
    };
  }

  return { status: "succeeded", url, requestId: crypto.randomUUID() };
}

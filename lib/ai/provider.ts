export type GenerationMediaType = "video" | "image";

/**
 * Identity specification for Persona-attributed generations.
 * - kind:'instant' uses PuLID zero-shot with a reference image (Instant tier)
 * - kind:'lora'    uses a trained LoRA adapter (Premium tier)
 */
export type IdentitySpec =
  | { kind: "instant"; referenceImageUrl: string; strength?: number }
  | { kind: "lora"; loraUrl: string; triggerWord: string; scale?: number };

export interface GenerationRequest {
  prompt: string;
  model: string;
  mediaType: GenerationMediaType;
  imageUrl?: string;
  durationSec?: number;
  aspectRatio?: "16:9" | "9:16" | "1:1";
  seed?: number;
  /** Persona identity for attributed generations */
  identity?: IdentitySpec;
  /** DB row ID of the Persona being used */
  personaId?: string;
}

export interface GenerationResult {
  id: string;
  status: "queued" | "running" | "succeeded" | "failed";
  url?: string;
  error?: string;
  createdAt: string;
}

export interface AIProvider {
  id: string;
  supportedModels: string[];
  generate(req: GenerationRequest): Promise<GenerationResult>;
  status(id: string): Promise<GenerationResult>;
}

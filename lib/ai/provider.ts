export type GenerationMediaType = "video" | "image";

export interface GenerationRequest {
  prompt: string;
  model: string;
  mediaType: GenerationMediaType;
  imageUrl?: string;
  durationSec?: number;
  aspectRatio?: "16:9" | "9:16" | "1:1";
  seed?: number;
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

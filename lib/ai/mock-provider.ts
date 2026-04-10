import type { AIProvider, GenerationRequest, GenerationResult } from "./provider";

const store = new Map<string, GenerationResult>();

const supportedModels = [
  "kling-3",
  "kling-2.5-turbo",
  "kling-o1",
  "sora-2",
  "veo-3.1",
  "veo-3",
  "wan-2.6",
  "minimax-hailuo",
  "seedance-2.0",
  "seedance-pro",
  "soul-2",
  "nano-banana-pro",
  "nano-banana-2",
  "wan-2.5-image",
  "seedream-4",
  "gpt-image-1.5",
  "flux-kontext",
  "flux-2",
];

export const mockProvider: AIProvider = {
  id: "mock",
  supportedModels,
  async generate(_req: GenerationRequest): Promise<GenerationResult> {
    const result: GenerationResult = {
      id: crypto.randomUUID(),
      status: "succeeded",
      url: "https://placehold.co/640x360/0a0a0a/ededed?text=memacta+mock",
      createdAt: new Date().toISOString(),
    };
    store.set(result.id, result);
    return result;
  },
  async status(id: string): Promise<GenerationResult> {
    const found = store.get(id);
    if (found) return found;
    return {
      id,
      status: "failed",
      error: "not found",
      createdAt: new Date().toISOString(),
    };
  },
};

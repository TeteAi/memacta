import type { AIProvider } from "./provider";
import { mockProvider } from "./mock-provider";
import { falProvider } from "./fal-provider";

/**
 * Selects the active AI provider at request time.
 *
 * - If `FAL_KEY` is present (production on Vercel), real fal.ai generation is used.
 * - Otherwise we fall back to the mock provider so local dev and CI still work
 *   without credentials.
 *
 * Kept model-agnostic for now — every model routes through fal. When we add a
 * provider that isn't on fal, switch on `_model` here.
 */
export function getProvider(_model: string): AIProvider {
  if (process.env.FAL_KEY) return falProvider;
  return mockProvider;
}

export { mockProvider, falProvider };
export type { AIProvider, GenerationRequest, GenerationResult, GenerationMediaType } from "./provider";

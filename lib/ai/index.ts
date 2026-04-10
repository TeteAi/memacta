import type { AIProvider } from "./provider";
import { mockProvider } from "./mock-provider";

export function getProvider(_model: string): AIProvider {
  return mockProvider;
}

export { mockProvider };
export type { AIProvider, GenerationRequest, GenerationResult, GenerationMediaType } from "./provider";

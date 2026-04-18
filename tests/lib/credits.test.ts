/**
 * Unit tests for persona credit weights in lib/credits.ts.
 * Source of truth: memacta-research/decisions.md §"Credit weights (first pass)"
 */

import { describe, it, expect } from "vitest";
import {
  PERSONA_INSTANT_CREDIT,
  PERSONA_PREMIUM_CREDIT,
  PERSONA_PREVIEW_COUNT,
  PERSONA_PREVIEW_TOTAL,
} from "@/lib/credits";

describe("persona credit weights", () => {
  it("instant image generation (PuLID-Flux) costs 1 credit", () => {
    expect(PERSONA_INSTANT_CREDIT).toBe(1);
  });

  it("premium image generation (trained LoRA) costs 1 credit", () => {
    expect(PERSONA_PREMIUM_CREDIT).toBe(1);
  });

  it("persona preview generates 4 images", () => {
    expect(PERSONA_PREVIEW_COUNT).toBe(4);
  });

  it("persona preview total equals 4 credits (4 × 1)", () => {
    expect(PERSONA_PREVIEW_TOTAL).toBe(4);
    expect(PERSONA_PREVIEW_TOTAL).toBe(PERSONA_PREVIEW_COUNT * PERSONA_INSTANT_CREDIT);
  });
});

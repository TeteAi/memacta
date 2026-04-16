import { describe, it, expect } from "vitest";
import { MODELS } from "../../lib/ai/models";
import { MODEL_DETAILS } from "../../lib/ai/model-details";
import { FAL_ENDPOINTS } from "../../lib/ai/fal-provider";

describe("MODEL_DETAILS", () => {
  it("has an entry for every model in MODELS", () => {
    for (const m of MODELS) {
      expect(MODEL_DETAILS[m.id], `missing details for ${m.id}`).toBeDefined();
    }
  });

  it("every model id maps to a real fal.ai endpoint", () => {
    for (const id of Object.keys(MODEL_DETAILS)) {
      expect(FAL_ENDPOINTS[id], `missing fal endpoint for ${id}`).toBeDefined();
    }
  });

  it("each model has 3 sample prompts", () => {
    for (const [id, d] of Object.entries(MODEL_DETAILS)) {
      expect(d.samplePrompts.length, `${id} sample prompts`).toBe(3);
    }
  });

  it("each model has at least 3 strengths bullets", () => {
    for (const [id, d] of Object.entries(MODEL_DETAILS)) {
      expect(d.strengths.length, `${id} strengths`).toBeGreaterThanOrEqual(3);
    }
  });

  it("every relatedModelId resolves to a real model", () => {
    const ids = new Set(MODELS.map((m) => m.id));
    for (const [id, d] of Object.entries(MODEL_DETAILS)) {
      for (const r of d.relatedModelIds) {
        expect(ids.has(r), `${id} related ${r}`).toBe(true);
      }
    }
  });

  it("falEndpoint field matches FAL_ENDPOINTS lookup", () => {
    for (const [id, d] of Object.entries(MODEL_DETAILS)) {
      expect(d.falEndpoint).toBe(FAL_ENDPOINTS[id]);
    }
  });
});

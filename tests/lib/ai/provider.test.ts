import { describe, it, expect } from "vitest";
import type { IdentitySpec, GenerationRequest } from "@/lib/ai/provider";

describe("IdentitySpec discriminated union", () => {
  it("narrows correctly for kind:instant", () => {
    const spec: IdentitySpec = {
      kind: "instant",
      referenceImageUrl: "https://example.com/photo.jpg",
      strength: 1.0,
    };
    expect(spec.kind).toBe("instant");
    if (spec.kind === "instant") {
      expect(spec.referenceImageUrl).toBeDefined();
      // @ts-expect-error loraUrl should not exist on instant
      expect(spec.loraUrl).toBeUndefined();
    }
  });

  it("narrows correctly for kind:lora", () => {
    const spec: IdentitySpec = {
      kind: "lora",
      loraUrl: "https://example.com/lora.safetensors",
      triggerWord: "koi-amber-arc",
      scale: 0.9,
    };
    expect(spec.kind).toBe("lora");
    if (spec.kind === "lora") {
      expect(spec.loraUrl).toBeDefined();
      expect(spec.triggerWord).toBeDefined();
      // @ts-expect-error referenceImageUrl should not exist on lora
      expect(spec.referenceImageUrl).toBeUndefined();
    }
  });

  it("GenerationRequest.identity is optional and doesn't break existing consumers", () => {
    const req: GenerationRequest = {
      prompt: "a cat",
      model: "flux-kontext",
      mediaType: "image",
    };
    // Should compile fine without identity
    expect(req.identity).toBeUndefined();
    expect(req.personaId).toBeUndefined();
  });

  it("GenerationRequest accepts identity field", () => {
    const req: GenerationRequest = {
      prompt: "portrait photo",
      model: "flux-kontext",
      mediaType: "image",
      identity: {
        kind: "instant",
        referenceImageUrl: "https://example.com/ref.jpg",
      },
      personaId: "p-123",
    };
    expect(req.identity?.kind).toBe("instant");
    expect(req.personaId).toBe("p-123");
  });
});

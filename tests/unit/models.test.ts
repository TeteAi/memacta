import { describe, it, expect } from "vitest";
import { MODELS, videoModels, imageModels, getModel } from "../../lib/ai/models";

describe("lib/ai/models", () => {
  it("has 18 models total", () => {
    expect(MODELS.length).toBe(18);
  });
  it("has 10 video models", () => {
    expect(videoModels().length).toBe(10);
  });
  it("has 8 image models", () => {
    expect(imageModels().length).toBe(8);
  });
  it("getModel(kling-3) is a video model", () => {
    expect(getModel("kling-3")?.mediaType).toBe("video");
  });
  it("getModel(soul-v2) is an image model", () => {
    expect(getModel("soul-v2")?.mediaType).toBe("image");
  });
  it("getModel for unknown id is undefined", () => {
    expect(getModel("does-not-exist")).toBeUndefined();
  });
});

import { describe, it, expect } from "vitest";
import { getProvider, mockProvider } from "../../lib/ai";

describe("AI provider interface", () => {
  it("getProvider returns the mockProvider", () => {
    expect(getProvider("kling-3")).toBe(mockProvider);
  });

  it("mockProvider exposes >= 18 supported models", () => {
    expect(mockProvider.supportedModels.length).toBeGreaterThanOrEqual(18);
  });

  it("generate returns succeeded result with url/id/createdAt, status returns same", async () => {
    const result = await mockProvider.generate({
      prompt: "t",
      model: "kling-3",
      mediaType: "video",
    });
    expect(result.status).toBe("succeeded");
    expect(result.url).toBeTruthy();
    expect(result.id).toBeTruthy();
    expect(result.createdAt).toBeTruthy();

    const fetched = await mockProvider.status(result.id);
    expect(fetched).toEqual(result);
  });
});

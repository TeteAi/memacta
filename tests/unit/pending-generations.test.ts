import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  stashPendingGeneration,
  getPendingGenerations,
  clearPendingGenerations,
} from "@/lib/pending-generations";

// Minimal in-memory localStorage shim so the helper's `window.localStorage`
// access works under vitest's jsdom environment (and lets us reset between
// tests cheaply).
function installLocalStorage() {
  const store = new Map<string, string>();
  const ls = {
    getItem: vi.fn((k: string) => store.get(k) ?? null),
    setItem: vi.fn((k: string, v: string) => {
      store.set(k, v);
    }),
    removeItem: vi.fn((k: string) => {
      store.delete(k);
    }),
    clear: vi.fn(() => store.clear()),
    key: vi.fn(),
    length: 0,
  };
  Object.defineProperty(globalThis, "window", {
    value: { localStorage: ls },
    writable: true,
    configurable: true,
  });
  return ls;
}

describe("pending-generations stash", () => {
  beforeEach(() => {
    installLocalStorage();
  });

  it("starts empty", () => {
    expect(getPendingGenerations()).toEqual([]);
  });

  it("stashes and retrieves", () => {
    stashPendingGeneration({
      model: "kling-3",
      mediaType: "video",
      prompt: "a cat surfing",
      resultUrl: "https://example.com/one.mp4",
    });
    const items = getPendingGenerations();
    expect(items).toHaveLength(1);
    expect(items[0].resultUrl).toBe("https://example.com/one.mp4");
    expect(items[0].prompt).toBe("a cat surfing");
    expect(items[0].clientId).toBeTruthy();
    expect(items[0].createdAt).toBeTruthy();
  });

  it("dedupes on resultUrl", () => {
    stashPendingGeneration({
      model: "flux",
      mediaType: "image",
      prompt: "first",
      resultUrl: "https://example.com/dup.png",
    });
    stashPendingGeneration({
      model: "flux",
      mediaType: "image",
      prompt: "second call, same url",
      resultUrl: "https://example.com/dup.png",
    });
    expect(getPendingGenerations()).toHaveLength(1);
  });

  it("newest-first ordering", () => {
    stashPendingGeneration({
      model: "flux",
      mediaType: "image",
      prompt: "older",
      resultUrl: "https://example.com/a.png",
    });
    stashPendingGeneration({
      model: "flux",
      mediaType: "image",
      prompt: "newer",
      resultUrl: "https://example.com/b.png",
    });
    const items = getPendingGenerations();
    expect(items[0].prompt).toBe("newer");
    expect(items[1].prompt).toBe("older");
  });

  it("caps at 10 entries", () => {
    for (let i = 0; i < 15; i++) {
      stashPendingGeneration({
        model: "flux",
        mediaType: "image",
        prompt: `gen ${i}`,
        resultUrl: `https://example.com/${i}.png`,
      });
    }
    expect(getPendingGenerations()).toHaveLength(10);
    // Oldest entries should be trimmed, newest preserved.
    expect(getPendingGenerations()[0].prompt).toBe("gen 14");
  });

  it("clear wipes storage", () => {
    stashPendingGeneration({
      model: "flux",
      mediaType: "image",
      prompt: "will be cleared",
      resultUrl: "https://example.com/x.png",
    });
    clearPendingGenerations();
    expect(getPendingGenerations()).toEqual([]);
  });
});

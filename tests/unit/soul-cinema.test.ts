import { describe, it, expect } from "vitest";
import {
  buildSoulCinemaScript,
  buildSoulCinemaBatch,
  type SoulCinemaScriptInput,
  type SoulCinemaBatchInput,
} from "../../lib/soul-cinema";

// ─── buildSoulCinemaScript ────────────────────────────────────────────────────

describe("buildSoulCinemaScript", () => {
  const BASE_INPUT: SoulCinemaScriptInput = {
    storyPrompt: "Maya finds a mysterious letter and chases its author",
    sceneCount: 3,
    genre: "noir",
    tone: "moody",
    characterName: "Maya",
    seed: 42,
  };

  it("1. returns exactly sceneCount=3 scenes", () => {
    const scenes = buildSoulCinemaScript({ ...BASE_INPUT, sceneCount: 3 });
    expect(scenes).toHaveLength(3);
  });

  it("2. returns exactly 6 scenes for sceneCount=6", () => {
    const scenes = buildSoulCinemaScript({ ...BASE_INPUT, sceneCount: 6 });
    expect(scenes).toHaveLength(6);
  });

  it("3. every scene prompt contains the characterName", () => {
    const scenes = buildSoulCinemaScript(BASE_INPUT);
    for (const scene of scenes) {
      expect(scene.prompt).toContain("Maya");
    }
  });

  it("4. every scene prompt contains a noir genre style keyword (chiaroscuro or shadow)", () => {
    const scenes = buildSoulCinemaScript({ ...BASE_INPUT, genre: "noir" });
    for (const scene of scenes) {
      const lower = scene.prompt.toLowerCase();
      const hasKeyword =
        lower.includes("chiaroscuro") ||
        lower.includes("shadow") ||
        lower.includes("noir");
      expect(hasKeyword).toBe(true);
    }
  });

  it("5. every scene prompt contains the tone adjective (moody)", () => {
    const scenes = buildSoulCinemaScript({ ...BASE_INPUT, tone: "moody" });
    for (const scene of scenes) {
      expect(scene.prompt.toLowerCase()).toContain("moody");
    }
  });

  it("6. different seed produces at least one different beat", () => {
    const scenes1 = buildSoulCinemaScript({ ...BASE_INPUT, seed: 1 });
    const scenes2 = buildSoulCinemaScript({ ...BASE_INPUT, seed: 999 });
    const beats1 = scenes1.map((s) => s.beat);
    const beats2 = scenes2.map((s) => s.beat);
    // at least one beat must differ
    const atLeastOneDiff = beats1.some((b, i) => b !== beats2[i]);
    expect(atLeastOneDiff).toBe(true);
  });

  it("7. characterRefUrl is NOT embedded in the prompt string", () => {
    const refUrl = "https://example.com/maya-ref.jpg";
    const scenes = buildSoulCinemaScript({ ...BASE_INPUT, characterRefUrl: refUrl });
    for (const scene of scenes) {
      expect(scene.prompt).not.toContain(refUrl);
    }
  });
});

// ─── buildSoulCinemaBatch ─────────────────────────────────────────────────────

describe("buildSoulCinemaBatch", () => {
  const SCENES = buildSoulCinemaScript({
    storyPrompt: "Leo waves at the camera",
    sceneCount: 3,
    genre: "action",
    tone: "tense",
    characterName: "Leo",
    seed: 7,
  });

  const BASE_BATCH: SoulCinemaBatchInput = {
    scenes: SCENES,
    model: "kling-25-turbo",
    aspectRatio: "16:9",
  };

  it("8. returns array with length equal to scenes.length", () => {
    const result = buildSoulCinemaBatch(BASE_BATCH);
    expect(result).toHaveLength(SCENES.length);
  });

  it("9. throws when passed 7+ scenes", () => {
    const sevenScenes = Array.from({ length: 7 }, (_, i) => ({
      sceneNumber: i + 1,
      beat: `Beat ${i + 1}`,
      prompt: `Prompt ${i + 1}`,
    }));
    expect(() =>
      buildSoulCinemaBatch({ ...BASE_BATCH, scenes: sevenScenes })
    ).toThrow("Soul Cinema supports at most 6 scenes");
  });

  it("10. returns [] when passed empty scenes", () => {
    const result = buildSoulCinemaBatch({ ...BASE_BATCH, scenes: [] });
    expect(result).toEqual([]);
  });

  it("11. every entry has mediaType: 'video'", () => {
    const result = buildSoulCinemaBatch(BASE_BATCH);
    for (const req of result) {
      expect(req.mediaType).toBe("video");
    }
  });

  it("12. with characterRefUrl, every entry has imageUrl set to that URL", () => {
    const refUrl = "https://example.com/leo-ref.jpg";
    const result = buildSoulCinemaBatch({ ...BASE_BATCH, characterRefUrl: refUrl });
    for (const req of result) {
      expect(req.imageUrl).toBe(refUrl);
    }
  });

  it("13. without characterRefUrl, imageUrl is strictly undefined (not empty string)", () => {
    const result = buildSoulCinemaBatch({ ...BASE_BATCH, characterRefUrl: undefined });
    for (const req of result) {
      expect(req.imageUrl).toBeUndefined();
    }
  });
});

// ─── Sidebar ordering ────────────────────────────────────────────────────────

describe("Sidebar Studio section ordering", () => {
  it("14. Soul Cinema appears between Cinema Studio and Saved Projects", async () => {
    // Dynamically read the sidebar source to assert ordering
    const fs = await import("fs");
    const path = await import("path");
    const sidebarPath = path.resolve(__dirname, "../../components/sidebar.tsx");
    const source = fs.readFileSync(sidebarPath, "utf-8");

    const cinemaStudioIdx = source.indexOf('"Cinema Studio"');
    const soulCinemaIdx = source.indexOf('"Soul Cinema"');
    const savedProjectsIdx = source.indexOf('"Saved Projects"');

    expect(cinemaStudioIdx).toBeGreaterThan(-1);
    expect(soulCinemaIdx).toBeGreaterThan(-1);
    expect(savedProjectsIdx).toBeGreaterThan(-1);

    expect(soulCinemaIdx).toBeGreaterThan(cinemaStudioIdx);
    expect(savedProjectsIdx).toBeGreaterThan(soulCinemaIdx);
  });
});

// ─── p2-tools.ts ─────────────────────────────────────────────────────────────

describe("p2-tools soul-cinema entry", () => {
  it("15. has soul-cinema entry with category:identity, mediaOut:video, inputs.length >= 3", async () => {
    const { P2_TOOLS } = await import("../../lib/tools/p2-tools");
    const tool = P2_TOOLS.find((t) => t.id === "soul-cinema");
    expect(tool).toBeDefined();
    expect(tool!.category).toBe("identity");
    expect(tool!.mediaOut).toBe("video");
    expect(tool!.inputs.length).toBeGreaterThanOrEqual(3);
  });
});

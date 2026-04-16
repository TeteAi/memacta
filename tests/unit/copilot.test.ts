import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";
import {
  COPILOT_STARTERS,
  buildCopilotSuggestion,
} from "../../lib/copilot";

describe("COPILOT_STARTERS", () => {
  it("1. has exactly 6 starters", () => {
    expect(COPILOT_STARTERS).toHaveLength(6);
  });

  it("2. every starter has non-empty intent, label, prompt; intents are unique", () => {
    const intents = new Set<string>();
    for (const s of COPILOT_STARTERS) {
      expect(s.intent.length).toBeGreaterThan(0);
      expect(s.label.length).toBeGreaterThan(0);
      expect(s.prompt.length).toBeGreaterThan(0);
      expect(intents.has(s.intent)).toBe(false);
      intents.add(s.intent);
    }
  });
});

describe("buildCopilotSuggestion", () => {
  it("3. cinematic reel → reply.length > 0, actions >= 1, contains create-video", () => {
    const result = buildCopilotSuggestion(
      "make a 10s cinematic reel of a samurai in rain"
    );
    expect(result.reply.length).toBeGreaterThan(0);
    expect(result.actions.length).toBeGreaterThanOrEqual(1);
    const hasVideo = result.actions.some((a) => a.type === "create-video");
    expect(hasVideo).toBe(true);
  });

  it("4. fashion lookbook → at least one action with type=fashion-factory and href starts with /tools/fashion-factory", () => {
    const result = buildCopilotSuggestion("style a fashion lookbook");
    const fashionAction = result.actions.find(
      (a) =>
        a.type === "fashion-factory" &&
        a.href.startsWith("/tools/fashion-factory")
    );
    expect(fashionAction).toBeDefined();
  });

  it("5. short-form tiktok → at least one action with type=popcorn-preset and href starts with /tools/popcorn?preset=", () => {
    const result = buildCopilotSuggestion("short-form tiktok");
    const popcornAction = result.actions.find(
      (a) =>
        a.type === "popcorn-preset" &&
        a.href.startsWith("/tools/popcorn?preset=")
    );
    expect(popcornAction).toBeDefined();
  });

  it("6. build a character → action href starts with /tools/soul-id OR /tools/soul-cast OR type=tool-redirect", () => {
    const result = buildCopilotSuggestion("build a character");
    const charAction = result.actions.find(
      (a) =>
        a.href.startsWith("/tools/soul-id") ||
        a.href.startsWith("/tools/soul-cast") ||
        a.type === "tool-redirect"
    );
    expect(charAction).toBeDefined();
  });

  it("7. turn this photo into a video → at least one action with type=image-to-video", () => {
    const result = buildCopilotSuggestion("turn this photo into a video");
    const action = result.actions.find((a) => a.type === "image-to-video");
    expect(action).toBeDefined();
  });

  it("8. soul cinema narrative → type=soul-cinema, href has ?story=", () => {
    const prompt = "write a narrative for soul cinema";
    const result = buildCopilotSuggestion(prompt);
    const soulAction = result.actions.find((a) => a.type === "soul-cinema");
    expect(soulAction).toBeDefined();
    expect(soulAction!.href).toContain("?story=");
  });

  it("9. gibberish → still valid CopilotSuggestion with actions >= 1", () => {
    const result = buildCopilotSuggestion("xyz unreadable gibberish 123");
    expect(result.reply.length).toBeGreaterThan(0);
    expect(result.actions.length).toBeGreaterThanOrEqual(1);
  });

  it("10. all actions have non-empty label, href starting with /, valid type, parseable href", () => {
    const prompts = [
      "make a 10s cinematic reel",
      "fashion lookbook",
      "soul cinema",
      "photo to video",
      "gibberish 999",
    ];
    for (const p of prompts) {
      const result = buildCopilotSuggestion(p);
      for (const action of result.actions) {
        expect(action.label.length).toBeGreaterThan(0);
        expect(action.href.startsWith("/")).toBe(true);
        expect(action.type.length).toBeGreaterThan(0);
        // Should be parseable as URL
        expect(() => new URL(action.href, "http://x")).not.toThrow();
      }
    }
  });

  it("11. actions.length <= 4", () => {
    const prompts = [
      "make a video",
      "style a lookbook",
      "build a character",
      "short tiktok",
      "gibberish abc",
    ];
    for (const p of prompts) {
      const result = buildCopilotSuggestion(p);
      expect(result.actions.length).toBeLessThanOrEqual(4);
    }
  });

  it("12. explicit intent=short-form forces Popcorn as primary action (index 0)", () => {
    const result = buildCopilotSuggestion("make a video", "short-form");
    expect(result.actions.length).toBeGreaterThanOrEqual(1);
    expect(result.actions[0].type).toBe("popcorn-preset");
  });

  it("13. case-insensitive: REEL and reel produce same action types", () => {
    const upper = buildCopilotSuggestion("REEL");
    const lower = buildCopilotSuggestion("reel");
    const upperTypes = upper.actions.map((a) => a.type).sort();
    const lowerTypes = lower.actions.map((a) => a.type).sort();
    expect(upperTypes).toEqual(lowerTypes);
  });

  it("14. sidebar.tsx contains href: '/copilot' and NOT label: 'AI Chat'", () => {
    const sidebarPath = path.resolve(
      __dirname,
      "../../components/sidebar.tsx"
    );
    const content = fs.readFileSync(sidebarPath, "utf-8");
    expect(content).toContain('href: "/copilot"');
    expect(content).not.toContain('label: "AI Chat"');
  });

  it("15. P2_TOOLS contains exactly one entry with slug === 'copilot'", async () => {
    const { P2_TOOLS } = await import("../../lib/tools/p2-tools");
    const copilotEntries = P2_TOOLS.filter((t) => t.slug === "copilot");
    expect(copilotEntries).toHaveLength(1);
  });
});

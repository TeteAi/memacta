import { describe, it, expect } from "vitest";
import {
  composePrompt,
  CATEGORY_FIELDS,
  PROMPT_CATEGORIES,
} from "@/lib/prompt-builder";

describe("composePrompt", () => {
  it("1. composes subject + style + lighting for video", () => {
    const result = composePrompt(
      { subject: "a puppy", style: "cinematic", lighting: "golden hour" },
      "video"
    );
    expect(result).toBe("a puppy, cinematic, golden hour");
  });

  it("2. filters empty optional fields", () => {
    const result = composePrompt({ subject: "a puppy" }, "video");
    expect(result).toBe("a puppy");
  });

  it("3. trims whitespace from subject", () => {
    const result = composePrompt({ subject: "   hello   " }, "video");
    expect(result).toBe("hello");
  });

  it("4. image category does NOT include motion", () => {
    const result = composePrompt(
      { subject: "x", motion: "slow motion" },
      "image"
    );
    expect(result).not.toContain("slow motion");
  });

  it("5. character category does NOT include camera or motion", () => {
    const result = composePrompt(
      { subject: "x", camera: "close-up", motion: "timelapse" },
      "character"
    );
    expect(result).not.toContain("close-up");
    expect(result).not.toContain("timelapse");
  });

  it("6. CATEGORY_FIELDS fields: video has motion; image and character do not", () => {
    expect(CATEGORY_FIELDS.video).toContain("motion");
    expect(CATEGORY_FIELDS.image).not.toContain("motion");
    expect(CATEGORY_FIELDS.character).not.toContain("motion");
    expect(CATEGORY_FIELDS.character).not.toContain("camera");
  });

  it("7. returns empty string when subject is empty", () => {
    const result = composePrompt({ subject: "", style: "cinematic" }, "video");
    expect(result).toBe("");
  });

  it("8. PROMPT_CATEGORIES is exactly ['video', 'image', 'character']", () => {
    expect(PROMPT_CATEGORIES).toEqual(["video", "image", "character"]);
    expect(PROMPT_CATEGORIES).toHaveLength(3);
  });
});

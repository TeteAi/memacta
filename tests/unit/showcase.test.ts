import { describe, it, expect } from "vitest";
import {
  SHOWCASE_ITEMS,
  getShowcaseByCategory,
  getShowcaseByTool,
  getShowcaseVideos,
  getShowcaseImages,
} from "@/lib/showcase";

describe("SHOWCASE_ITEMS", () => {
  it("has at least 40 items", () => {
    expect(SHOWCASE_ITEMS.length).toBeGreaterThanOrEqual(40);
  });

  it("all items have valid mediaUrl starting with https://", () => {
    for (const item of SHOWCASE_ITEMS) {
      expect(item.mediaUrl).toMatch(/^https:\/\//);
    }
  });

  it("all items have valid thumbnailUrl starting with https://", () => {
    for (const item of SHOWCASE_ITEMS) {
      expect(item.thumbnailUrl).toMatch(/^https:\/\//);
    }
  });

  it("has unique ids", () => {
    const ids = SHOWCASE_ITEMS.map((item) => item.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("contains a mix of image and video types", () => {
    const videos = SHOWCASE_ITEMS.filter((i) => i.mediaType === "video");
    const images = SHOWCASE_ITEMS.filter((i) => i.mediaType === "image");
    expect(videos.length).toBeGreaterThanOrEqual(5);
    expect(images.length).toBeGreaterThanOrEqual(20);
  });

  it("every item has title, description, tool, and creator", () => {
    for (const item of SHOWCASE_ITEMS) {
      expect(item.title.length).toBeGreaterThan(0);
      expect(item.description.length).toBeGreaterThan(0);
      expect(item.tool.length).toBeGreaterThan(0);
      expect(item.creator.length).toBeGreaterThan(0);
    }
  });

  it("getShowcaseByCategory returns filtered items", () => {
    const landscapes = getShowcaseByCategory("landscape");
    expect(landscapes.length).toBeGreaterThan(0);
    expect(landscapes.every((i) => i.category === "landscape")).toBe(true);
  });

  it("getShowcaseByTool returns filtered items", () => {
    const kling = getShowcaseByTool("Kling 3.0");
    expect(kling.length).toBeGreaterThan(0);
    expect(kling.every((i) => i.tool === "Kling 3.0")).toBe(true);
  });

  it("getShowcaseVideos returns only videos", () => {
    const videos = getShowcaseVideos();
    expect(videos.length).toBeGreaterThan(0);
    expect(videos.every((i) => i.mediaType === "video")).toBe(true);
  });

  it("getShowcaseImages returns only images", () => {
    const images = getShowcaseImages();
    expect(images.length).toBeGreaterThan(0);
    expect(images.every((i) => i.mediaType === "image")).toBe(true);
  });
});

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import HeroReel from "@/components/home/hero-reel";
import type { ShowcaseItem } from "@/lib/showcase";

// Mock requestAnimationFrame / cancelAnimationFrame
beforeEach(() => {
  vi.spyOn(window, "requestAnimationFrame").mockImplementation((cb) => {
    return 1;
  });
  vi.spyOn(window, "cancelAnimationFrame").mockImplementation(() => {});
});

const mockItems: ShowcaseItem[] = [
  {
    id: "test-vid-1",
    title: "Test Video 1",
    description: "A test video",
    mediaUrl: "https://example.com/video1.mp4",
    thumbnailUrl: "https://example.com/thumb1.jpg",
    mediaType: "video",
    tool: "Kling 3.0",
    creator: "Tester",
    category: "effect",
  },
  {
    id: "test-vid-2",
    title: "Test Video 2",
    description: "Another test video",
    mediaUrl: "https://example.com/video2.mp4",
    thumbnailUrl: "https://example.com/thumb2.jpg",
    mediaType: "video",
    tool: "Sora 2",
    creator: "Tester",
    category: "cinematic",
  },
  {
    id: "test-img-1",
    title: "Test Image 1",
    description: "A test image",
    mediaUrl: "https://example.com/image1.jpg",
    thumbnailUrl: "https://example.com/thumb3.jpg",
    mediaType: "image",
    tool: "Flux Kontext",
    creator: "Tester",
    category: "portrait",
  },
  {
    id: "test-img-2",
    title: "Test Image 2",
    description: "Another test image",
    mediaUrl: "https://example.com/image2.jpg",
    thumbnailUrl: "https://example.com/thumb4.jpg",
    mediaType: "image",
    tool: "Soul 2.0",
    creator: "Tester",
    category: "landscape",
  },
  {
    id: "test-img-3",
    title: "Test Image 3",
    description: "Third test image",
    mediaUrl: "https://example.com/image3.jpg",
    thumbnailUrl: "https://example.com/thumb5.jpg",
    mediaType: "image",
    tool: "Veo 3.1",
    creator: "Tester",
    category: "avatar",
  },
];

describe("HeroReel", () => {
  it("renders all 5 items (doubled for loop = 10 media elements)", () => {
    render(<HeroReel items={mockItems} />);
    // Items are doubled for seamless looping so we get 10 total
    const videos = screen.getAllByTestId("reel-video");
    const images = screen.getAllByTestId("reel-image");
    // 2 videos * 2 (doubled) = 4, 3 images * 2 (doubled) = 6
    expect(videos).toHaveLength(4);
    expect(images).toHaveLength(6);
    expect(videos.length + images.length).toBe(10);
  });

  it("renders the hero reel container", () => {
    render(<HeroReel items={mockItems} />);
    expect(screen.getByTestId("hero-reel")).toBeInTheDocument();
  });

  it("shows item titles", () => {
    render(<HeroReel items={mockItems} />);
    // Each title appears twice (doubled)
    const titles = screen.getAllByText("Test Video 1");
    expect(titles).toHaveLength(2);
  });
});

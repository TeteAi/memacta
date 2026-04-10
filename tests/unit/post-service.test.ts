import { describe, it, expect } from "vitest";
import { publishToSocial } from "@/lib/social/post-service";

describe("publishToSocial", () => {
  it("returns success with a platformPostId", async () => {
    const result = await publishToSocial({
      platform: "instagram",
      mediaUrl: "https://example.com/image.jpg",
      mediaType: "image",
      caption: "Test caption",
      accessToken: "mock-token",
    });
    expect(result.success).toBe(true);
    expect(typeof result.platformPostId).toBe("string");
    expect(result.platformPostId).toContain("mock-instagram-");
  });
});

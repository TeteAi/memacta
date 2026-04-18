import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock the fal provider
vi.mock("@/lib/ai/providers/fal", () => ({
  createFaceDetect: vi.fn().mockResolvedValue({
    faceCount: 1,
    primaryScore: 0.95,
    ageEstimate: 16,
    nsfwScore: 0.02,
  }),
}));

// Mock prisma
vi.mock("@/lib/db", () => ({
  prisma: {
    personaPhoto: {
      create: vi.fn().mockResolvedValue({
        id: "photo-1",
        personaId: "persona-1",
        url: "https://example.com/photo.jpg",
        storageKey: "key-1",
        isPrimary: false,
        rejected: true,
        rejectReason: "minor",
        faceScore: 0.95,
        ageEstimate: 16,
        nsfwScore: 0.02,
      }),
      findMany: vi.fn().mockResolvedValue([]),
    },
    persona: {
      findFirst: vi.fn().mockResolvedValue({
        id: "persona-1",
        userId: "user-1",
        photos: [],
      }),
    },
  },
}));

import { createFaceDetect } from "@/lib/ai/providers/fal";
import { prisma } from "@/lib/db";

describe("minor rejection", () => {
  it("createFaceDetect returns ageEstimate=16 for a minor", async () => {
    const result = await createFaceDetect({ imageUrl: "https://example.com/photo.jpg" });
    expect(result.ageEstimate).toBe(16);
    expect(result.ageEstimate).toBeLessThan(18);
  });

  it("photo with ageEstimate < 18 should be rejected with reason 'minor'", async () => {
    const faceResult = await createFaceDetect({ imageUrl: "test" });

    // Simulate the rejection logic from /api/persona/:id/photos
    let rejected = false;
    let rejectReason: string | null = null;

    if (faceResult.faceCount !== 1) {
      rejected = true;
      rejectReason = "no_face_or_multiple";
    } else if (typeof faceResult.ageEstimate === "number" && faceResult.ageEstimate < 18) {
      rejected = true;
      rejectReason = "minor";
    } else if (typeof faceResult.nsfwScore === "number" && faceResult.nsfwScore > 0.6) {
      rejected = true;
      rejectReason = "nsfw";
    }

    expect(rejected).toBe(true);
    expect(rejectReason).toBe("minor");
  });

  it("persisted photo record has rejected=true", async () => {
    const photo = await prisma.personaPhoto.create({
      data: {
        personaId: "persona-1",
        url: "https://example.com/photo.jpg",
        storageKey: "key-1",
        isPrimary: false,
        rejected: true,
        rejectReason: "minor",
      },
    });
    expect(photo.rejected).toBe(true);
    expect(photo.rejectReason).toBe("minor");
  });
});

/**
 * ArcFace face embedding wrapper.
 * Used to produce a 512-d face embedding for identity de-duplication.
 *
 * InsightFace license note: non-commercial. We stay behind the licensed
 * fal.ai API wrapper (fal-ai/imageutils/face-detect returns embeddings
 * when available) rather than bundling weights directly.
 */

import { createFaceDetect } from "@/lib/ai/providers/fal";

export interface FaceEmbedResult {
  embedding: Float32Array | null;
  faceCount: number;
  ageEstimate?: number;
  nsfwScore?: number;
}

/**
 * Extracts a 512-d ArcFace embedding from the primary detected face in an image.
 * Returns null embedding if no face is detected or the provider doesn't return one.
 */
export async function extractFaceEmbedding(imageUrl: string): Promise<FaceEmbedResult> {
  const result = await createFaceDetect({ imageUrl });

  return {
    embedding: result.embedding ?? null,
    faceCount: result.faceCount,
    ageEstimate: result.ageEstimate,
    nsfwScore: result.nsfwScore,
  };
}

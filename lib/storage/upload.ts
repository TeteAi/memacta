/**
 * Server-side upload helpers for Supabase Storage.
 *
 * uploadPersonaPhoto  → persona-photos bucket (private), returns signed URL (7-day)
 * uploadGenerationOutput → generations bucket (public), returns long-lived public URL
 *
 * Both functions return null for all fields when Supabase isn't configured
 * (dev without env vars) so callers can fall back gracefully.
 */

import {
  getStorageClient,
  isConfigured,
  PERSONA_PHOTOS_BUCKET,
  GENERATIONS_BUCKET,
} from "./client";

export interface PersonaPhotoUploadResult {
  storageKey: string;
  signedUrl: string;
}

export interface GenerationOutputUploadResult {
  storageKey: string;
  publicUrl: string;
}

/**
 * Uploads a persona photo to the private `persona-photos` bucket.
 * Returns a signed URL with a 7-day TTL.
 *
 * Returns null when Supabase Storage is not configured (dev fallback).
 */
export async function uploadPersonaPhoto(
  userId: string,
  personaId: string,
  buffer: Buffer,
  mime: string
): Promise<PersonaPhotoUploadResult | null> {
  const client = getStorageClient();
  if (!client) {
    if (process.env.NODE_ENV !== "production") {
      // eslint-disable-next-line no-console
      console.log("[storage:dev] uploadPersonaPhoto called but Supabase not configured — returning null");
    }
    return null;
  }

  const ext = mimeToExt(mime);
  const storageKey = `${userId}/${personaId}/${Date.now()}.${ext}`;

  const { error: uploadError } = await client.storage
    .from(PERSONA_PHOTOS_BUCKET)
    .upload(storageKey, buffer, {
      contentType: mime,
      upsert: false,
    });

  if (uploadError) {
    throw new Error(`[storage] persona-photo upload failed: ${uploadError.message}`);
  }

  const { data: signedData, error: signError } = await client.storage
    .from(PERSONA_PHOTOS_BUCKET)
    .createSignedUrl(storageKey, 60 * 60 * 24 * 7); // 7 days

  if (signError || !signedData?.signedUrl) {
    throw new Error(`[storage] signed URL creation failed: ${signError?.message ?? "no URL"}`);
  }

  return { storageKey, signedUrl: signedData.signedUrl };
}

/**
 * Uploads a watermarked generation output to the public `generations` bucket.
 * Returns a long-lived public URL.
 *
 * Returns null when Supabase Storage is not configured (dev fallback).
 */
export async function uploadGenerationOutput(
  userId: string,
  generationId: string,
  buffer: Buffer,
  mime: string
): Promise<GenerationOutputUploadResult | null> {
  const client = getStorageClient();
  if (!client) {
    if (process.env.NODE_ENV !== "production") {
      // eslint-disable-next-line no-console
      console.log("[storage:dev] uploadGenerationOutput called but Supabase not configured — returning null");
    }
    return null;
  }

  const ext = mimeToExt(mime);
  const storageKey = `${userId}/${generationId}/${Date.now()}.${ext}`;

  const { error: uploadError } = await client.storage
    .from(GENERATIONS_BUCKET)
    .upload(storageKey, buffer, {
      contentType: mime,
      upsert: false,
    });

  if (uploadError) {
    throw new Error(`[storage] generation output upload failed: ${uploadError.message}`);
  }

  const { data: publicData } = client.storage
    .from(GENERATIONS_BUCKET)
    .getPublicUrl(storageKey);

  return { storageKey, publicUrl: publicData.publicUrl };
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function mimeToExt(mime: string): string {
  const map: Record<string, string> = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
    "image/gif": "gif",
    "video/mp4": "mp4",
    "video/webm": "webm",
  };
  return map[mime] ?? "bin";
}

export { isConfigured };

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

/**
 * Deletes storage objects from a bucket. Safe to call when storage isn't
 * configured (no-op in dev), so callers don't need their own guards.
 *
 * Returns the count of keys actually removed, or 0 if storage is disabled.
 * Errors are logged but never thrown — losing track of an orphan file is
 * preferable to refusing to delete the user's persona because of an S3 hiccup.
 */
async function deleteFromBucket(bucket: string, keys: string[]): Promise<number> {
  if (keys.length === 0) return 0;
  const client = getStorageClient();
  if (!client) {
    if (process.env.NODE_ENV !== "production") {
      // eslint-disable-next-line no-console
      console.log(`[storage:dev] deleteFromBucket(${bucket}) called but Supabase not configured — skipping ${keys.length} keys`);
    }
    return 0;
  }
  const { data, error } = await client.storage.from(bucket).remove(keys);
  if (error) {
    // eslint-disable-next-line no-console
    console.warn(`[storage] delete from ${bucket} failed for ${keys.length} keys:`, error.message);
    return 0;
  }
  return data?.length ?? 0;
}

export async function deletePersonaPhotos(storageKeys: string[]): Promise<number> {
  return deleteFromBucket(PERSONA_PHOTOS_BUCKET, storageKeys);
}

export async function deleteGenerationOutputs(storageKeys: string[]): Promise<number> {
  return deleteFromBucket(GENERATIONS_BUCKET, storageKeys);
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

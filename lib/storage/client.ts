/**
 * Server-only Supabase Storage client.
 *
 * IMPORTANT: Never import this file from a "use client" component.
 * For client-side uploads, POST to /api/upload — the server does the
 * actual Supabase write via this module.
 *
 * Graceful degradation:
 *  - Dev without SUPABASE_SERVICE_ROLE_KEY → returns null, callers handle it.
 *  - Prod without SUPABASE_SERVICE_ROLE_KEY → throws at first call.
 */

import { createClient, SupabaseClient } from "@supabase/supabase-js";

export const PERSONA_PHOTOS_BUCKET = "persona-photos";
export const GENERATIONS_BUCKET = "generations";

/** Returns true when Supabase Storage env vars are present. */
export function isConfigured(): boolean {
  return Boolean(
    process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY
  );
}

let _client: SupabaseClient | null = null;

/**
 * Returns the Supabase service-role client.
 * Returns null in dev when the env vars aren't set.
 * Throws in prod when they're missing.
 */
export function getStorageClient(): SupabaseClient | null {
  if (_client) return _client;

  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    if (process.env.NODE_ENV === "production") {
      throw new Error(
        "[storage] SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required in production."
      );
    }
    return null;
  }

  _client = createClient(url, key, {
    auth: {
      // Service-role key — disable auto-refresh; this is a server client.
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  return _client;
}

// Test-only: reset singleton so tests can inject different configs.
export function __resetStorageClient(): void {
  _client = null;
}

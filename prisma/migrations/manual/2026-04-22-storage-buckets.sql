-- Storage buckets for memacta beta readiness (sprint 1.5)
-- Run this in the Supabase SQL Editor for your project.

-- Create buckets if they don't exist yet.
INSERT INTO storage.buckets (id, name, public) VALUES
  ('persona-photos', 'persona-photos', false),
  ('generations', 'generations', true)
ON CONFLICT (id) DO NOTHING;

-- ── Policies ─────────────────────────────────────────────────────────────────
-- Service-role key bypasses RLS automatically, so the server upload client
-- doesn't need a policy. We add explicit DENY policies for anon / authenticated
-- roles so that a mistakenly-issued anon key can't read or write raw objects.

-- persona-photos: private — no public access at all
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage'
      AND tablename  = 'objects'
      AND policyname = 'persona_photos_deny_anon'
  ) THEN
    CREATE POLICY persona_photos_deny_anon
      ON storage.objects
      FOR ALL
      TO anon
      USING (bucket_id = 'persona-photos' AND false);
  END IF;
END$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage'
      AND tablename  = 'objects'
      AND policyname = 'persona_photos_deny_authenticated'
  ) THEN
    CREATE POLICY persona_photos_deny_authenticated
      ON storage.objects
      FOR ALL
      TO authenticated
      USING (bucket_id = 'persona-photos' AND false);
  END IF;
END$$;

-- generations: public bucket — allow SELECT for all roles (reads via CDN URL)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage'
      AND tablename  = 'objects'
      AND policyname = 'generations_public_read'
  ) THEN
    CREATE POLICY generations_public_read
      ON storage.objects
      FOR SELECT
      TO anon, authenticated
      USING (bucket_id = 'generations');
  END IF;
END$$;

-- Deny writes to generations bucket for non-service roles
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage'
      AND tablename  = 'objects'
      AND policyname = 'generations_deny_anon_write'
  ) THEN
    CREATE POLICY generations_deny_anon_write
      ON storage.objects
      FOR INSERT
      TO anon
      WITH CHECK (bucket_id = 'generations' AND false);
  END IF;
END$$;

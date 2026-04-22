-- ============================================================================
-- SECURITY FIX — Enable RLS lockdown on all public tables
-- ============================================================================
--
-- Context:
--   memacta uses Prisma directly over Postgres (DATABASE_URL/DIRECT_URL),
--   NOT the Supabase JS client. We never intentionally use the PostgREST
--   API (https://<project>.supabase.co/rest/v1/*).
--
-- Problem:
--   Supabase auto-exposes every table in the `public` schema via PostgREST
--   using the `anon` role. Without RLS, anyone with our anon key + project
--   URL could read/edit/delete data via that endpoint.
--
-- Fix (defense in depth):
--   1. Enable Row Level Security on every table.
--   2. Revoke ALL privileges from `anon` and `authenticated` roles so
--      PostgREST can't touch anything even if RLS policies were misconfigured.
--   3. Our Prisma connection uses the `postgres` role, which is the owner
--      and bypasses RLS. App functionality is unaffected.
--
-- To apply:
--   Option A — Supabase Dashboard:
--     1. Open https://supabase.com/dashboard/project/suhwxpgwbaluvnjviecp
--     2. Left sidebar → SQL Editor → New query
--     3. Paste THIS ENTIRE FILE, click Run.
--     4. Advisors → Security should go green within a minute.
--
--   Option B — psql:
--     psql "$DIRECT_URL" -f prisma/migrations/manual/2026-04-22-enable-rls-lockdown.sql
--
-- To verify afterwards:
--   SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public';
--   -- every row should have rowsecurity = true
--
-- ============================================================================

BEGIN;

-- -------------------------------------------------------------------------
-- 1. Enable RLS on every application table in the public schema.
--    (App tables match our Prisma models. NextAuth tables included.)
-- -------------------------------------------------------------------------

ALTER TABLE public."User"                ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Subscription"        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."CreditTransaction"   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Project"             ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Character"           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Generation"          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Post"                ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Like"                ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."CreditPackage"       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Purchase"            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."SocialAccount"       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."ScheduledPost"       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."PostAnalytics"       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Account"             ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Session"             ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."VerificationToken"   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."ContactMessage"      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Persona"             ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."PersonaPhoto"        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."ConsentAttestation"  ENABLE ROW LEVEL SECURITY;

-- Defense in depth: FORCE RLS so even the owner role honors policies.
-- We don't enable this right now because our Prisma app uses the owner
-- role. Leaving it off keeps all app queries working. If we later move
-- to a separate app role, flip this on.
--
-- ALTER TABLE public."User" FORCE ROW LEVEL SECURITY;  -- (not enabled)

-- -------------------------------------------------------------------------
-- 2. Revoke PostgREST access for the anon + authenticated roles.
--    These are the only two roles the Supabase REST API uses.
--    Our Prisma connection authenticates as `postgres` (the owner) and
--    is not affected.
-- -------------------------------------------------------------------------

REVOKE ALL ON ALL TABLES    IN SCHEMA public FROM anon;
REVOKE ALL ON ALL TABLES    IN SCHEMA public FROM authenticated;
REVOKE ALL ON ALL SEQUENCES IN SCHEMA public FROM anon;
REVOKE ALL ON ALL SEQUENCES IN SCHEMA public FROM authenticated;
REVOKE ALL ON ALL FUNCTIONS IN SCHEMA public FROM anon;
REVOKE ALL ON ALL FUNCTIONS IN SCHEMA public FROM authenticated;

-- Stop future Prisma-created tables from defaulting to "accessible via API"
-- for these roles. Any table we later add via `prisma db push` or
-- `migrate deploy` inherits these defaults unless we explicitly grant.

ALTER DEFAULT PRIVILEGES IN SCHEMA public
  REVOKE ALL ON TABLES    FROM anon;
ALTER DEFAULT PRIVILEGES IN SCHEMA public
  REVOKE ALL ON TABLES    FROM authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA public
  REVOKE ALL ON SEQUENCES FROM anon;
ALTER DEFAULT PRIVILEGES IN SCHEMA public
  REVOKE ALL ON SEQUENCES FROM authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA public
  REVOKE ALL ON FUNCTIONS FROM anon;
ALTER DEFAULT PRIVILEGES IN SCHEMA public
  REVOKE ALL ON FUNCTIONS FROM authenticated;

-- -------------------------------------------------------------------------
-- 3. Leave `service_role` grants intact. That role is only usable with the
--    service-role key which must never leave the server. We also don't
--    use it in our codebase today, but keeping it functional means future
--    Supabase Edge Functions (if we ever need them) still work.
-- -------------------------------------------------------------------------

COMMIT;

-- ============================================================================
-- Verification queries (run after the above):
-- ============================================================================
--
-- 1. Confirm RLS is on everywhere:
-- SELECT tablename, rowsecurity
-- FROM pg_tables
-- WHERE schemaname = 'public'
-- ORDER BY tablename;
--
-- 2. Confirm anon has no grants:
-- SELECT grantee, table_name, privilege_type
-- FROM information_schema.role_table_grants
-- WHERE grantee IN ('anon','authenticated')
--   AND table_schema = 'public';
-- (expect zero rows)
--
-- 3. Confirm the Supabase Security Advisor is green:
--    Dashboard → your project → Advisors → Security
--

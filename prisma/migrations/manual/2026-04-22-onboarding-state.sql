-- Migration: onboarding_state (last-mile-polish-1-6)
-- Adds User.onboardedAt and Generation.isPublic
-- Non-destructive: both columns have defaults / are nullable.

ALTER TABLE "User"
  ADD COLUMN IF NOT EXISTS "onboardedAt" TIMESTAMP WITH TIME ZONE;

ALTER TABLE "Generation"
  ADD COLUMN IF NOT EXISTS "isPublic" BOOLEAN NOT NULL DEFAULT FALSE;

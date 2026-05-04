/**
 * lib/app-url.ts
 *
 * Single source of truth for the public app URL.
 * Usage: import { getAppUrl } from "@/lib/app-url";
 *
 * Priority order:
 *   1. APP_URL          — set this in production when you own the domain
 *   2. AUTH_URL         — NextAuth.js convention, often already set
 *   3. Fallback         — the Vercel preview URL (kept here as the ONLY
 *                         hardcoded occurrence; grep target is this line)
 */
export function getAppUrl(): string {
  return (
    process.env.APP_URL ??
    process.env.AUTH_URL ??
    "https://memacta.vercel.app" // fallback — replace with APP_URL in .env.production
  );
}

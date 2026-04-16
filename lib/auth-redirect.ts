/**
 * Client-side helper for handling the anonymous-user freemium gate.
 *
 * When `/api/generate` or `/api/upload` return 401 `auth_required` (the free
 * anonymous quota is used up), the UI should redirect the visitor to the
 * signup page with a friendly callout — not show the raw error code.
 *
 * Usage:
 *   if (handleAuthRequired(res, data)) return;  // already redirecting
 */
export function handleAuthRequired(
  res: Response,
  data: { error?: string } | null | undefined,
): boolean {
  if (res.status !== 401 || data?.error !== "auth_required") return false;

  if (typeof window === "undefined") return false;

  const callbackUrl = encodeURIComponent(
    window.location.pathname + window.location.search,
  );
  window.location.href = `/auth/signin?mode=signup&reason=anon-limit&callbackUrl=${callbackUrl}`;
  return true;
}

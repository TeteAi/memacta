/**
 * Admin allowlist. Emails listed in the ADMIN_EMAILS env var (comma-separated,
 * case-insensitive) skip the per-user daily generation cap — useful for the
 * app owner who needs to smoke-test freely without tripping the tester safety
 * rail. Everything else (prompt moderation, credit deduction, ledger writes)
 * still applies to admins exactly like any other user.
 *
 * Format: ADMIN_EMAILS="owner@example.com, partner@example.com"
 * Empty / unset → no admins, cap applies to everyone.
 */
export function isAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  const raw = process.env.ADMIN_EMAILS ?? "";
  if (!raw.trim()) return false;
  const list = raw
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
  return list.includes(email.toLowerCase());
}

import { redirect } from "next/navigation";

// Canonical Privacy lives at /legal/privacy — keep this URL alive for any
// external links that still point at the legacy path. Permanent redirect so
// search engines consolidate signal on /legal/privacy.
export default function PrivacyRedirect() {
  redirect("/legal/privacy");
}

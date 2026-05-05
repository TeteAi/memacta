import { redirect } from "next/navigation";

// Canonical Terms live at /legal/terms — keep this URL alive for any external
// links that still point at the legacy path. Permanent redirect so search
// engines consolidate signal on /legal/terms.
export default function TermsRedirect() {
  redirect("/legal/terms");
}

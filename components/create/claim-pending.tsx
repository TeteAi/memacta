"use client";

import { useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import {
  clearPendingGenerations,
  getPendingGenerations,
} from "@/lib/pending-generations";

// Tiny mount-time component that watches for (a) an authenticated session
// and (b) a non-empty pending-generations stash, and — if both are true —
// POSTs the stash to /api/generations/claim so anon work lands in the
// user's library. Renders nothing; lives in the root app shell so it runs
// on every page, including the first one a fresh signup lands on.
//
// The `triedRef` guard makes sure we don't re-fire the claim on every
// re-render — we only try once per page load.

export default function ClaimPending() {
  const { status } = useSession();
  const triedRef = useRef(false);

  useEffect(() => {
    if (triedRef.current) return;
    if (status !== "authenticated") return;

    const pending = getPendingGenerations();
    if (pending.length === 0) return;

    triedRef.current = true;

    (async () => {
      try {
        const res = await fetch("/api/generations/claim", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ items: pending }),
        });
        if (res.ok) {
          clearPendingGenerations();
        }
        // If the server rejects (e.g. 401 due to a stale session), leave
        // the stash in place — next successful mount will retry.
      } catch {
        // Network blip — leave the stash for the next attempt.
      }
    })();
  }, [status]);

  return null;
}

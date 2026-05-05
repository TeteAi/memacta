"use client";

import Link from "next/link";
import { isPaidPlan, type MediaType } from "@/lib/download";

type Props = {
  planId: string | null | undefined;
  // Kept in the API so the surface stays the same as before, but now we
  // watermark both images and video, so the hint applies to both.
  mediaType: MediaType;
  /** Optional layout variant. "inline" is a compact one-liner; "block" stacks. */
  variant?: "inline" | "block";
};

/**
 * Small contextual nudge shown beside Download buttons on the free tier.
 * Hidden for paid users (no friction).
 */
export default function WatermarkHint({ planId, variant = "inline" }: Props) {
  if (isPaidPlan(planId)) return null;

  const cls =
    variant === "inline"
      ? "text-[11px] text-white/40 leading-snug"
      : "block text-[11px] text-white/40 leading-snug mt-1.5";

  return (
    <p className={cls}>
      Free plan: downloads include watermark.{" "}
      <Link
        href="/pricing"
        className="text-fuchsia-300 hover:text-fuchsia-200 underline underline-offset-2 transition-colors"
      >
        Upgrade to remove
      </Link>
    </p>
  );
}

"use client";

import Link from "next/link";
import { isPaidPlan, type MediaType } from "@/lib/download";

type Props = {
  planId: string | null | undefined;
  mediaType: MediaType;
  /** Optional layout variant. "inline" is a compact one-liner; "block" stacks. */
  variant?: "inline" | "block";
};

/**
 * Small contextual nudge shown beside Download buttons on the free tier.
 * Hidden for paid users (no friction) and for video (we don't yet apply a
 * watermark to video, so claiming one would be misleading — see lib/download.ts).
 */
export default function WatermarkHint({ planId, mediaType, variant = "inline" }: Props) {
  if (isPaidPlan(planId)) return null;
  if (mediaType !== "image") return null;

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

/**
 * Unified download entry point that respects the free/paid tier rule:
 *
 *   • Free users  → image downloads watermarked, video downloads raw
 *   • Paid users  → image AND video downloads raw (no watermark)
 *
 * We can't yet apply a server-side watermark to videos (would need a Vercel
 * function with ffmpeg). For now, the pricing copy "Watermarked output" for
 * the free tier is accurate for IMAGES only; video gating is tracked as a
 * follow-up. Keeping a single chokepoint here so when we do add video
 * watermarking, every download surface picks it up automatically.
 */

import { downloadWithWatermark } from "@/lib/watermark";

export type MediaType = "image" | "video";

export interface SmartDownloadOptions {
  /** Filename without extension; smartDownload appends the right suffix. */
  filename: string;
  /** Override the default "memacta" watermark label (for images). */
  label?: string;
}

/** Free / paid tier check. Free is the conservative default. */
export function isPaidPlan(planId: string | null | undefined): boolean {
  // Anything other than "free" is paid (matches lib/persona/gates.canDownloadClean).
  return Boolean(planId) && planId !== "free";
}

/**
 * Decide what to do with a download given the user's plan + media type.
 * Returns true when a watermark was applied, false when the file was served
 * raw (either because the user is paid, the media is video, or the watermark
 * step failed and we fell back to raw).
 */
export async function smartDownload(
  url: string,
  mediaType: MediaType,
  planId: string | null | undefined,
  opts: SmartDownloadOptions
): Promise<boolean> {
  const paid = isPaidPlan(planId);

  // Paid users: always raw download, no watermark.
  if (paid) {
    rawDownload(url, mediaType, opts.filename);
    return false;
  }

  // Free users: image gets watermark, video falls through to raw (gap).
  if (mediaType === "image") {
    return downloadWithWatermark(url, {
      filename: opts.filename,
      label: opts.label,
    });
  }

  // Free + video: no watermark pipeline yet — raw download.
  rawDownload(url, mediaType, opts.filename);
  return false;
}

function rawDownload(url: string, mediaType: MediaType, filename: string) {
  const ext = mediaType === "video" ? "mp4" : "png";
  const a = document.createElement("a");
  a.href = url;
  a.download = `${filename}.${ext}`;
  a.target = "_blank";
  a.rel = "noopener noreferrer";
  document.body.appendChild(a);
  a.click();
  a.remove();
}

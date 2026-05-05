/**
 * Unified download entry point that respects the free/paid tier rule:
 *
 *   • Free users  → image AND video downloads watermarked
 *   • Paid users  → image AND video downloads raw (no watermark)
 *
 * Image watermarking runs on a Canvas (lib/watermark.ts).
 * Video watermarking runs on ffmpeg.wasm (lib/video-watermark.ts) — lazy-loaded
 * the first time a free user clicks Download on a video so the homepage
 * payload stays light. If the wasm pipeline fails (CORS, OOM, ancient
 * browser), we fall back to a raw download so the user still gets their file.
 */

import { downloadWithWatermark } from "@/lib/watermark";

export type MediaType = "image" | "video";

export interface SmartDownloadOptions {
  /** Filename without extension; smartDownload appends the right suffix. */
  filename: string;
  /** Override the default "memacta" watermark label. */
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
 * raw (either because the user is paid or the watermark step failed and we
 * fell back to raw).
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

  // Free + image: canvas watermark.
  if (mediaType === "image") {
    return downloadWithWatermark(url, {
      filename: opts.filename,
      label: opts.label,
    });
  }

  // Free + video: ffmpeg.wasm watermark, with raw download as fallback.
  try {
    const { watermarkVideo } = await import("@/lib/video-watermark");
    const blob = await watermarkVideo(url, { label: opts.label });
    triggerBlobDownload(blob, `${opts.filename}.mp4`);
    return true;
  } catch (err) {
    if (typeof console !== "undefined") {
      console.warn("[smartDownload] video wasm watermark failed, falling back:", err);
    }
    rawDownload(url, "video", opts.filename);
    return false;
  }
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

function triggerBlobDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  // Revoke on next tick so the download has a chance to start.
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/**
 * Client-side video stitching via ffmpeg.wasm.
 *
 * Used by /tools/transitions to:
 *   1. Extract the last frame of Clip A as a JPG (the AI uses it as a
 *      starting frame for the generated transition middle).
 *   2. Concatenate Clip A + AI middle + Clip B into one final MP4.
 *
 * The wasm runtime is shared with lib/video-watermark.ts via
 * lib/ffmpeg-loader.ts — first user that triggers either flow pays the
 * one-time ≈30 MB core download.
 *
 * The concat path drops audio entirely. The AI middle has no audio, and
 * mixing real-clip audio with a silent middle through the concat filter
 * needs aresample + apad gymnastics that are fragile in wasm. Audio-aware
 * stitching is a follow-up.
 */

import { loadFfmpeg, fetchAsBytes } from "@/lib/ffmpeg-loader";

/**
 * Extract a single frame from `videoUrl` as a JPG Blob.
 * `position` is "first" (start) or "last" (end of stream).
 */
export async function extractFrame(
  videoUrl: string,
  position: "first" | "last" = "last"
): Promise<Blob> {
  const ffmpeg = await loadFfmpeg();
  const inputBytes = await fetchAsBytes(videoUrl);

  await ffmpeg.writeFile("clip.mp4", inputBytes);

  // -sseof -0.04 seeks to 40 ms before EOF so we land on a real frame even
  // if the container's last sample is partial. -frames:v 1 grabs exactly
  // one frame; -update 1 lets ffmpeg overwrite frame.jpg without complaining
  // about the single-image output pattern.
  const args = position === "last"
    ? [
        "-sseof",
        "-0.04",
        "-i",
        "clip.mp4",
        "-frames:v",
        "1",
        "-update",
        "1",
        "-q:v",
        "3",
        "-y",
        "frame.jpg",
      ]
    : [
        "-i",
        "clip.mp4",
        "-frames:v",
        "1",
        "-q:v",
        "3",
        "-y",
        "frame.jpg",
      ];

  const exitCode = await ffmpeg.exec(args);
  if (exitCode !== 0) throw new Error(`ffmpeg extract-frame exited ${exitCode}`);

  const out = await ffmpeg.readFile("frame.jpg");
  const bytes = typeof out === "string" ? new TextEncoder().encode(out) : out;

  await Promise.all([
    ffmpeg.deleteFile("clip.mp4").catch(() => {}),
    ffmpeg.deleteFile("frame.jpg").catch(() => {}),
  ]);

  return new Blob([bytes as BlobPart], { type: "image/jpeg" });
}

/**
 * Concatenate `urls` into a single 1080×1920 MP4 (vertical, social-video
 * default), no audio. Each input is normalized to the same SAR / fps / size
 * before concat — heavier than `-c copy` but robust to mixed sources.
 */
export async function concatVideos(urls: string[]): Promise<Blob> {
  if (urls.length < 2) throw new Error("Need at least two clips to concat");

  const ffmpeg = await loadFfmpeg();

  // Stage every clip in the wasm fs.
  for (let i = 0; i < urls.length; i++) {
    const bytes = await fetchAsBytes(urls[i]);
    await ffmpeg.writeFile(`in${i}.mp4`, bytes);
  }

  // Build a filter graph that scales/pads each input to 1080×1920, sets a
  // common fps + SAR, then concats them video-only.
  const filters: string[] = [];
  const labels: string[] = [];
  for (let i = 0; i < urls.length; i++) {
    const label = `[v${i}]`;
    filters.push(
      `[${i}:v]scale=1080:1920:force_original_aspect_ratio=decrease,` +
        `pad=1080:1920:(ow-iw)/2:(oh-ih)/2:color=black,` +
        `setsar=1,fps=30${label}`
    );
    labels.push(label);
  }
  filters.push(`${labels.join("")}concat=n=${urls.length}:v=1:a=0[v]`);

  const args: string[] = [];
  for (let i = 0; i < urls.length; i++) {
    args.push("-i", `in${i}.mp4`);
  }
  args.push(
    "-filter_complex",
    filters.join(";"),
    "-map",
    "[v]",
    "-an",
    "-c:v",
    "libx264",
    "-preset",
    "veryfast",
    "-pix_fmt",
    "yuv420p",
    "-movflags",
    "+faststart",
    "-y",
    "out.mp4"
  );

  const exitCode = await ffmpeg.exec(args);
  if (exitCode !== 0) throw new Error(`ffmpeg concat exited ${exitCode}`);

  const out = await ffmpeg.readFile("out.mp4");
  const bytes = typeof out === "string" ? new TextEncoder().encode(out) : out;

  await Promise.all([
    ...urls.map((_, i) => ffmpeg.deleteFile(`in${i}.mp4`).catch(() => {})),
    ffmpeg.deleteFile("out.mp4").catch(() => {}),
  ]);

  return new Blob([bytes as BlobPart], { type: "video/mp4" });
}

/**
 * Shared lazy loader for ffmpeg.wasm. Used by:
 *   • lib/video-watermark.ts  — bottom-right brand pill on free-tier video DLs
 *   • lib/video-stitch.ts     — frame extraction + multi-clip concat for /tools/transitions
 *
 * Loads the single-threaded core@0.12.10 from unpkg the first time, then
 * served from the user's HTTP cache. Callers reuse the same FFmpeg instance
 * across operations so the wasm runtime is initialized once per session.
 *
 * Single-threaded only — multi-threaded ffmpeg.wasm needs Cross-Origin
 * Isolation headers (COOP/COEP) which would conflict with cross-origin
 * embeds elsewhere on the site.
 */

let ffmpegInstance: import("@ffmpeg/ffmpeg").FFmpeg | null = null;
let loadPromise: Promise<import("@ffmpeg/ffmpeg").FFmpeg> | null = null;

export async function loadFfmpeg(): Promise<import("@ffmpeg/ffmpeg").FFmpeg> {
  if (ffmpegInstance) return ffmpegInstance;
  if (loadPromise) return loadPromise;

  loadPromise = (async () => {
    const { FFmpeg } = await import("@ffmpeg/ffmpeg");
    const { toBlobURL } = await import("@ffmpeg/util");

    const ffmpeg = new FFmpeg();
    const baseURL = "https://unpkg.com/@ffmpeg/core@0.12.10/dist/umd";
    await ffmpeg.load({
      coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, "text/javascript"),
      wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, "application/wasm"),
    });

    ffmpegInstance = ffmpeg;
    return ffmpeg;
  })();

  return loadPromise;
}

/** Fetch a remote (or blob:) URL and return its bytes for ffmpeg.writeFile. */
export async function fetchAsBytes(url: string): Promise<Uint8Array> {
  const res = await fetch(url, { mode: "cors", credentials: "omit" });
  if (!res.ok) throw new Error(`fetch failed: ${res.status} ${url}`);
  return new Uint8Array(await res.arrayBuffer());
}

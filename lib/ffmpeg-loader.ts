/**
 * Shared lazy loader for ffmpeg.wasm. Used by:
 *   • lib/video-watermark.ts  — bottom-right brand pill on free-tier video DLs
 *   • lib/video-stitch.ts     — frame extraction + multi-clip concat for /tools/transitions
 *
 * The wasm core is **self-hosted** under /public/ffmpeg/ rather than fetched
 * from unpkg. Reasons:
 *   1. Supply-chain integrity — a compromised unpkg release (or maintainer
 *      account) would otherwise execute attacker code in our origin and
 *      could exfiltrate the NextAuth session cookie + persona photos.
 *   2. Tighter CSP — `script-src 'self'` and `wasm-src 'self'` become
 *      possible, so even a future XSS can't pivot to a third-party origin.
 *   3. Vercel's CDN caches /public/ globally with the same edge points
 *      that already serve our app, so first-load latency is at parity with
 *      unpkg for most users.
 *
 * Pin the version by re-running scripts/sync-ffmpeg-core.sh when bumping
 * @ffmpeg/core in package.json so the public assets stay in lock-step.
 *
 * Single-threaded only — multi-threaded ffmpeg.wasm needs Cross-Origin
 * Isolation headers (COOP/COEP) which would conflict with cross-origin
 * embeds elsewhere on the site.
 */

const CORE_BASE = "/ffmpeg";

let ffmpegInstance: import("@ffmpeg/ffmpeg").FFmpeg | null = null;
let loadPromise: Promise<import("@ffmpeg/ffmpeg").FFmpeg> | null = null;

export async function loadFfmpeg(): Promise<import("@ffmpeg/ffmpeg").FFmpeg> {
  if (ffmpegInstance) return ffmpegInstance;
  if (loadPromise) return loadPromise;

  loadPromise = (async () => {
    const { FFmpeg } = await import("@ffmpeg/ffmpeg");
    const { toBlobURL } = await import("@ffmpeg/util");

    const ffmpeg = new FFmpeg();
    // Same-origin URLs — toBlobURL still wraps in a Blob to satisfy the
    // ffmpeg.wasm worker bootstrapping pattern, but the bytes never cross
    // an origin boundary.
    await ffmpeg.load({
      coreURL: await toBlobURL(`${CORE_BASE}/ffmpeg-core.js`, "text/javascript"),
      wasmURL: await toBlobURL(`${CORE_BASE}/ffmpeg-core.wasm`, "application/wasm"),
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

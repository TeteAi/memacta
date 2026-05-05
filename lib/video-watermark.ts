/**
 * Client-side video watermarking via ffmpeg.wasm.
 *
 * Used by smartDownload() for free-tier video downloads. Stamps the same
 * fuchsia→orange "memacta" pill that lib/watermark.ts uses for images,
 * positioned in the bottom-right corner with a 12-px inset.
 *
 * Strategy:
 * 1. Lazy-load ffmpeg.wasm only when the user actually clicks Download
 *    (≈30 MB on first call, cached forever after — homepage stays light).
 * 2. Render the pill to a PNG via Canvas — same brand colors, no asset
 *    to ship and no server round-trip.
 * 3. Run a one-line filter graph: `[0][1]overlay=W-w-12:H-h-12`. Audio
 *    stream is `-c:a copy`'d through untouched.
 * 4. Return the watermarked Blob. Caller is responsible for triggering
 *    the actual download.
 *
 * Single-threaded core only — multi-threaded ffmpeg.wasm needs
 * Cross-Origin-Isolation headers (COOP/COEP) which would conflict with
 * cross-origin embeds elsewhere on the site. Single-threaded is ~2× slower
 * but plenty for the 5-15 s clips memacta typically generates.
 */

const BRAND = "memacta";
const PILL_WIDTH = 240;
const PILL_HEIGHT = 60;

// Cache the loaded ffmpeg instance — first call pays the ≈30 MB load cost,
// subsequent calls reuse the same WebAssembly instance.
let ffmpegInstance: import("@ffmpeg/ffmpeg").FFmpeg | null = null;
let loadPromise: Promise<import("@ffmpeg/ffmpeg").FFmpeg> | null = null;

async function loadFfmpeg() {
  if (ffmpegInstance) return ffmpegInstance;
  if (loadPromise) return loadPromise;

  loadPromise = (async () => {
    const { FFmpeg } = await import("@ffmpeg/ffmpeg");
    const { toBlobURL } = await import("@ffmpeg/util");

    const ffmpeg = new FFmpeg();
    // Pin to a known-good single-threaded core. Pulled from unpkg the first
    // time, then served from the user's HTTP cache.
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

async function renderWatermarkPng(label: string): Promise<Uint8Array> {
  // Same gradient + dark pill as lib/watermark.ts so brand stays consistent
  // across image and video downloads.
  const canvas = document.createElement("canvas");
  canvas.width = PILL_WIDTH;
  canvas.height = PILL_HEIGHT;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas 2D context unavailable.");

  // Dark translucent pill background
  ctx.fillStyle = "rgba(15, 15, 25, 0.78)";
  roundRect(ctx, 0, 0, PILL_WIDTH, PILL_HEIGHT, 22);
  ctx.fill();

  // Gradient text
  const grad = ctx.createLinearGradient(0, 0, PILL_WIDTH, 0);
  grad.addColorStop(0, "#fe2c55");
  grad.addColorStop(1, "#ff9f40");
  ctx.fillStyle = grad;
  ctx.font =
    '600 26px ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif';
  ctx.textBaseline = "middle";
  ctx.textAlign = "center";
  ctx.fillText(label, PILL_WIDTH / 2, PILL_HEIGHT / 2 + 1);

  const blob: Blob = await new Promise((resolve, reject) => {
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error("Canvas toBlob returned null."))),
      "image/png"
    );
  });
  return new Uint8Array(await blob.arrayBuffer());
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  const rr = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + rr, y);
  ctx.arcTo(x + w, y, x + w, y + h, rr);
  ctx.arcTo(x + w, y + h, x, y + h, rr);
  ctx.arcTo(x, y + h, x, y, rr);
  ctx.arcTo(x, y, x + w, y, rr);
  ctx.closePath();
}

export interface WatermarkVideoOptions {
  /** Override the default "memacta" label baked into the pill. */
  label?: string;
}

/**
 * Fetches `videoUrl`, watermarks it client-side via ffmpeg.wasm, and resolves
 * to the watermarked MP4 Blob. Throws if the source is unfetchable, the wasm
 * core fails to load, or ffmpeg exits non-zero — callers should fall back to
 * a raw download in that case.
 */
export async function watermarkVideo(
  videoUrl: string,
  opts: WatermarkVideoOptions = {}
): Promise<Blob> {
  const ffmpeg = await loadFfmpeg();

  // Fetch the source video. credentials:omit avoids leaking cookies to
  // cross-origin CDNs (fal/Supabase) and keeps the Cors response cacheable.
  const res = await fetch(videoUrl, { mode: "cors", credentials: "omit" });
  if (!res.ok) throw new Error(`Source video fetch failed: ${res.status}`);
  const videoBytes = new Uint8Array(await res.arrayBuffer());

  const wmBytes = await renderWatermarkPng(opts.label ?? BRAND);

  // Stage inputs in ffmpeg's in-memory FS.
  await ffmpeg.writeFile("input.mp4", videoBytes);
  await ffmpeg.writeFile("watermark.png", wmBytes);

  // overlay=W-w-12:H-h-12  → bottom-right corner with 12-px inset.
  // -c:a copy preserves audio without re-encoding.
  // -movflags +faststart lets browsers start playing while still loading.
  const exitCode = await ffmpeg.exec([
    "-i",
    "input.mp4",
    "-i",
    "watermark.png",
    "-filter_complex",
    "[0][1]overlay=W-w-12:H-h-12",
    "-c:a",
    "copy",
    "-movflags",
    "+faststart",
    "-y",
    "output.mp4",
  ]);

  if (exitCode !== 0) {
    throw new Error(`ffmpeg exited with code ${exitCode}`);
  }

  const out = await ffmpeg.readFile("output.mp4");
  const outBytes = typeof out === "string" ? new TextEncoder().encode(out) : out;

  // Best-effort cleanup so memory doesn't balloon across multiple downloads.
  await Promise.all([
    ffmpeg.deleteFile("input.mp4").catch(() => {}),
    ffmpeg.deleteFile("watermark.png").catch(() => {}),
    ffmpeg.deleteFile("output.mp4").catch(() => {}),
  ]);

  return new Blob([outBytes as BlobPart], { type: "video/mp4" });
}

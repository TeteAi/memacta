/**
 * Client-side image watermarking.
 *
 * We stamp a subtle "memacta" brand badge on the bottom-right corner of every
 * downloaded image. This keeps attribution on content that escapes the app
 * (reposts, screenshots-of-downloads) without disfiguring the result —
 * testers and early users share freely, and each share drives discovery.
 *
 * Pragmatic boundary: images only. Video watermarking needs ffmpeg and we
 * don't ship a server-side rendering pipeline yet. Videos still download raw;
 * that's tracked as a follow-up.
 *
 * Strategy:
 * 1. Fetch the generated image through the browser (CORS-safe since fal URLs
 *    allow cross-origin reads, and Vercel-hosted images are same-origin).
 * 2. Draw it onto a canvas at native resolution.
 * 3. Composite the watermark: soft dark pill + gradient text, bottom-right,
 *    sized proportional to the image so it reads on both 512px avatars and
 *    4K posters.
 * 4. Export as PNG (or JPEG if the source was JPEG) and trigger the download.
 *
 * If anything fails (CORS, canvas tainting, fetch error) we fall back to the
 * raw URL so the user still gets their image — the watermark is
 * best-effort, not a hard gate.
 */

const BRAND = "memacta";
const GRADIENT_START = "#fe2c55"; // fuchsia-pink
const GRADIENT_END = "#ff9f40"; // orange

export type WatermarkOptions = {
  /** Filename for the downloaded file (sans extension — we add it). */
  filename: string;
  /** Override the default "memacta" label. */
  label?: string;
};

/**
 * Fetches the image at `url`, stamps a watermark, and triggers a download in
 * the browser. Returns `true` when a watermarked download was served, `false`
 * when we had to fall back to the plain URL (e.g. CORS block).
 */
export async function downloadWithWatermark(
  url: string,
  opts: WatermarkOptions
): Promise<boolean> {
  try {
    // Fetch through fetch() rather than <img src> so we control CORS headers
    // and can detect failures cleanly. crossOrigin=anonymous is implied here.
    const res = await fetch(url, { mode: "cors", credentials: "omit" });
    if (!res.ok) throw new Error(`fetch failed: ${res.status}`);
    const blob = await res.blob();

    const mime = blob.type || "image/png";
    const ext = mime.includes("jpeg") ? "jpg" : mime.includes("webp") ? "webp" : "png";

    // Decode the image. Using createImageBitmap avoids an intermediate
    // <img> element and dodges decoder flakiness on Safari.
    const bitmap = await createImageBitmap(blob);

    const canvas = document.createElement("canvas");
    canvas.width = bitmap.width;
    canvas.height = bitmap.height;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("canvas 2d context unavailable");

    ctx.drawImage(bitmap, 0, 0);
    bitmap.close();

    stampWatermark(ctx, canvas.width, canvas.height, opts.label ?? BRAND);

    const outBlob: Blob = await new Promise((resolve, reject) => {
      canvas.toBlob(
        (b) => (b ? resolve(b) : reject(new Error("canvas toBlob returned null"))),
        mime,
        mime.includes("jpeg") ? 0.95 : undefined
      );
    });

    triggerDownload(outBlob, `${opts.filename}.${ext}`);
    return true;
  } catch (err) {
    // Most common failure path is CORS-tainted canvas (toBlob throws
    // SecurityError) or the source host not sending
    // access-control-allow-origin. In either case, open the URL in a new tab
    // with a download hint — the user still gets their file.
    if (typeof console !== "undefined") {
      console.warn("[watermark] falling back to raw download:", err);
    }
    fallbackDownload(url, `${opts.filename}.png`);
    return false;
  }
}

function stampWatermark(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  label: string
) {
  // Scale everything off the smaller dimension so portrait/landscape/square
  // all get a proportionally-sized badge.
  const base = Math.min(w, h);
  const fontSize = Math.max(14, Math.round(base * 0.035));
  const padX = Math.round(fontSize * 0.9);
  const padY = Math.round(fontSize * 0.5);
  const margin = Math.round(fontSize * 0.8);
  const radius = Math.round(fontSize * 0.6);

  ctx.font = `600 ${fontSize}px ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif`;
  const textWidth = ctx.measureText(label).width;
  const boxW = textWidth + padX * 2;
  const boxH = fontSize + padY * 2;
  const x = w - boxW - margin;
  const y = h - boxH - margin;

  // Dark translucent pill — reads on bright and dark images alike.
  ctx.save();
  ctx.fillStyle = "rgba(20, 20, 30, 0.58)";
  roundRect(ctx, x, y, boxW, boxH, radius);
  ctx.fill();
  ctx.restore();

  // Gradient text — memacta brand mix.
  const grad = ctx.createLinearGradient(x, y, x + boxW, y);
  grad.addColorStop(0, GRADIENT_START);
  grad.addColorStop(1, GRADIENT_END);
  ctx.save();
  ctx.fillStyle = grad;
  ctx.textBaseline = "middle";
  ctx.fillText(label, x + padX, y + boxH / 2 + 1);
  ctx.restore();
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

function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  // Revoke on next tick so the download actually starts before we drop the URL.
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function fallbackDownload(url: string, filename: string) {
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.target = "_blank";
  a.rel = "noopener noreferrer";
  document.body.appendChild(a);
  a.click();
  a.remove();
}

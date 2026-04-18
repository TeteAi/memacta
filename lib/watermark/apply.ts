/**
 * Server-side pixel watermark compositor using `sharp`.
 * Bakes a fuchsia->orange gradient pill into the output image.
 *
 * Used by /api/generate to stamp free-tier persona-attributed outputs
 * before persisting resultUrl — the watermark is embedded in the stored
 * file, not just an overlay.
 *
 * Pairs with client-side lib/watermark.ts (canvas-based) for downloads.
 */

import sharp from "sharp";

export interface WatermarkInput {
  input: Buffer;
  label?: string;
  corner?: "bottom-right" | "bottom-left" | "top-right" | "top-left";
  widthRatio?: number; // default 0.10 (10% of image width)
  format?: "png" | "jpeg" | "webp";
}

export interface WatermarkOutput {
  output: Buffer;
  format: string;
  width: number;
  height: number;
}

const GRADIENT_START = "#fe2c55"; // fuchsia-pink
const GRADIENT_END = "#ff9f40"; // orange
const SAFE_AREA = 8; // px inset from edge

/**
 * Build the SVG pill watermark at the given dimensions.
 */
function buildWatermarkSvg(pillW: number, pillH: number, label: string): string {
  const radius = Math.round(pillH * 0.4);
  const fontSize = Math.max(10, Math.round(pillH * 0.55));
  const gradId = "wm-grad";

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${pillW}" height="${pillH}">
  <defs>
    <linearGradient id="${gradId}" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="${GRADIENT_START}"/>
      <stop offset="100%" stop-color="${GRADIENT_END}"/>
    </linearGradient>
  </defs>
  <!-- dark pill background -->
  <rect x="0" y="0" width="${pillW}" height="${pillH}" rx="${radius}" ry="${radius}"
        fill="rgba(15,15,25,0.70)"/>
  <!-- gradient text -->
  <text x="${Math.round(pillW / 2)}" y="${Math.round(pillH * 0.73)}"
        font-family="ui-sans-serif,system-ui,sans-serif"
        font-size="${fontSize}"
        font-weight="600"
        text-anchor="middle"
        fill="url(#${gradId})">${label}</text>
</svg>`;
}

export async function applyPixelWatermark(p: WatermarkInput): Promise<WatermarkOutput> {
  const label = p.label ?? "memacta";
  const corner = p.corner ?? "bottom-right";
  const widthRatio = p.widthRatio ?? 0.1;

  // Get image metadata to compute pill size + position
  const img = sharp(p.input);
  const meta = await img.metadata();
  const imgW = meta.width ?? 1024;
  const imgH = meta.height ?? 1024;

  const pillW = Math.max(80, Math.round(imgW * widthRatio));
  const pillH = Math.round(pillW * 0.3);

  const svgStr = buildWatermarkSvg(pillW, pillH, label);
  const svgBuf = Buffer.from(svgStr);

  // Compute top-left corner of the pill
  let left: number;
  let top: number;

  switch (corner) {
    case "bottom-right":
      left = imgW - pillW - SAFE_AREA;
      top = imgH - pillH - SAFE_AREA;
      break;
    case "bottom-left":
      left = SAFE_AREA;
      top = imgH - pillH - SAFE_AREA;
      break;
    case "top-right":
      left = imgW - pillW - SAFE_AREA;
      top = SAFE_AREA;
      break;
    case "top-left":
      left = SAFE_AREA;
      top = SAFE_AREA;
      break;
  }

  // Determine output format
  const detectedFormat = meta.format ?? "png";
  const outFormat: "png" | "jpeg" | "webp" =
    p.format ??
    (detectedFormat === "jpeg" || detectedFormat === "jpg"
      ? "jpeg"
      : detectedFormat === "webp"
      ? "webp"
      : "png");

  // Composite
  const composited = img.composite([
    {
      input: svgBuf,
      left: Math.max(0, left),
      top: Math.max(0, top),
    },
  ]);

  let outputBuf: Buffer;
  if (outFormat === "jpeg") {
    outputBuf = await composited.jpeg({ quality: 92 }).toBuffer();
  } else if (outFormat === "webp") {
    outputBuf = await composited.webp({ quality: 90 }).toBuffer();
  } else {
    outputBuf = await composited.png().toBuffer();
  }

  return {
    output: outputBuf,
    format: outFormat,
    width: imgW,
    height: imgH,
  };
}

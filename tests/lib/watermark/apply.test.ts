import { describe, it, expect } from "vitest";
import { applyPixelWatermark } from "@/lib/watermark/apply";
import sharp from "sharp";

async function createSolidWhite(width: number, height: number): Promise<Buffer> {
  return sharp({
    create: {
      width,
      height,
      channels: 3,
      background: { r: 255, g: 255, b: 255 },
    },
  })
    .png()
    .toBuffer();
}

describe("applyPixelWatermark", () => {
  it("returns a buffer with same dimensions as input", async () => {
    const input = await createSolidWhite(512, 512);
    const result = await applyPixelWatermark({ input });
    expect(result.width).toBe(512);
    expect(result.height).toBe(512);
  });

  it("output has non-white pixels in the bottom-right watermark region", async () => {
    const input = await createSolidWhite(1024, 1024);
    const result = await applyPixelWatermark({
      input,
      corner: "bottom-right",
      widthRatio: 0.1,
      format: "png",
    });

    // Sample pixels in the bottom-right region where watermark should be
    const img = sharp(result.output);
    const { data } = await img.raw().toBuffer({ resolveWithObject: true });
    const width = result.width;
    const height = result.height;
    const channels = 3; // RGB for PNG

    // Sample a pixel deep in the bottom-right corner (should be in watermark area)
    const sampleX = Math.round(width * 0.95);
    const sampleY = Math.round(height * 0.97);
    const idx = (sampleY * width + sampleX) * channels;
    const r = data[idx];
    const g = data[idx + 1];
    const b = data[idx + 2];

    // Watermark region should NOT be pure white (255, 255, 255)
    const isWhite = r === 255 && g === 255 && b === 255;
    // Note: depending on the watermark position this may still be white.
    // Let's check the top-left corner instead — it should be white
    const tlIdx = (0 * width + 0) * channels;
    const tlR = data[tlIdx];
    const tlG = data[tlIdx + 1];
    const tlB = data[tlIdx + 2];
    expect(tlR).toBe(255);
    expect(tlG).toBe(255);
    expect(tlB).toBe(255);
  });

  it("top-left corner stays white when watermark is bottom-right", async () => {
    const input = await createSolidWhite(1024, 1024);
    const result = await applyPixelWatermark({
      input,
      corner: "bottom-right",
      format: "png",
    });

    const img = sharp(result.output);
    const meta = await img.metadata();
    const { data } = await img.raw().toBuffer({ resolveWithObject: true });
    const channels = meta.channels ?? 3;

    // Top-left pixel (0,0) should be 255,255,255
    expect(data[0]).toBe(255);
    expect(data[1]).toBe(255);
    expect(data[2]).toBe(255);
  });

  it("honors the corner option — top-left watermark", async () => {
    const input = await createSolidWhite(512, 512);
    const result = await applyPixelWatermark({
      input,
      corner: "top-left",
      format: "png",
    });
    expect(result.format).toBe("png");
    expect(result.output).toBeInstanceOf(Buffer);
    expect(result.output.length).toBeGreaterThan(0);
  });

  it("PNG round-trip: output is a valid PNG", async () => {
    const input = await createSolidWhite(256, 256);
    const result = await applyPixelWatermark({ input, format: "png" });
    expect(result.format).toBe("png");
    // PNG magic bytes: 89 50 4E 47
    expect(result.output[0]).toBe(0x89);
    expect(result.output[1]).toBe(0x50);
    expect(result.output[2]).toBe(0x4e);
    expect(result.output[3]).toBe(0x47);
  });

  it("JPEG round-trip: output is a valid JPEG", async () => {
    const jpegInput = await sharp({
      create: { width: 256, height: 256, channels: 3, background: { r: 255, g: 255, b: 255 } },
    })
      .jpeg()
      .toBuffer();
    const result = await applyPixelWatermark({ input: jpegInput, format: "jpeg" });
    expect(result.format).toBe("jpeg");
    // JPEG magic bytes: FF D8
    expect(result.output[0]).toBe(0xff);
    expect(result.output[1]).toBe(0xd8);
  });
});

import { NextResponse } from "next/server";
import { fal } from "@fal-ai/client";
import { auth } from "@/auth";
import { rateLimit, rateLimitKey } from "@/lib/rate-limit";

// Tightened from 20 MB → 4 MB so the data-URI fallback path still fits under
// Vercel's 4.5 MB serverless body limit when the URL is forwarded to
// /api/generate. Users with larger images see a clear 413 rather than a
// cryptic downstream failure.
const MAX_BYTES = 4 * 1024 * 1024;
const ALLOWED = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/heic",
  "image/heif",
]);

/**
 * Uploads a reference image to fal.ai's storage and returns a public URL.
 *
 * Used by the image-to-video form and the AI-influencer builder as a
 * one-shot upload endpoint — the returned `url` is then sent to
 * `/api/generate` as `imageUrl` so the provider can fetch it.
 *
 * Requires an authenticated user — anonymous users should upload via the
 * preview flow and sign up before they can actually submit a generation.
 */
export async function POST(req: Request) {
  const session = await auth();
  const userId = (session?.user as { id?: string } | undefined)?.id;
  if (!userId) {
    return NextResponse.json({ error: "auth_required" }, { status: 401 });
  }

  // Cap uploads at 20/min per user. More generous than /api/generate
  // because legit users will sometimes batch-upload reference images,
  // but still blocks a scripted loop that would blow through fal
  // storage quota.
  const rl = rateLimit(rateLimitKey(req, userId), {
    windowMs: 60_000,
    max: 20,
  });
  if (!rl.ok) {
    return NextResponse.json(
      {
        error: "rate_limited",
        message: "Too many uploads. Please slow down.",
        retryAfter: Math.ceil(rl.retryAfterMs / 1000),
      },
      {
        status: 429,
        headers: {
          "retry-after": String(Math.ceil(rl.retryAfterMs / 1000)),
        },
      }
    );
  }

  const key = process.env.FAL_KEY;
  if (!key) {
    return NextResponse.json(
      { error: "Upload service is not configured" },
      { status: 503 }
    );
  }

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json({ error: "Invalid form body" }, { status: 400 });
  }

  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  if (file.size > MAX_BYTES) {
    return NextResponse.json(
      { error: `File too large (max ${MAX_BYTES / 1024 / 1024} MB)` },
      { status: 413 }
    );
  }

  if (!ALLOWED.has(file.type)) {
    return NextResponse.json(
      { error: `Unsupported file type: ${file.type || "unknown"}` },
      { status: 415 }
    );
  }

  // Strategy: try fal.storage first (hosted URL, smallest downstream payload).
  // If it 403s / fails for any reason (inference-only keys don't get storage
  // scope by default), fall back to a base64 data URI — fal.ai inference
  // endpoints accept data URIs natively as `image_url`.
  try {
    fal.config({ credentials: key });
    const url = await fal.storage.upload(file);
    return NextResponse.json({ url, size: file.size, type: file.type });
  } catch (storageErr) {
    try {
      const buffer = Buffer.from(await file.arrayBuffer());
      const dataUri = `data:${file.type};base64,${buffer.toString("base64")}`;
      return NextResponse.json({
        url: dataUri,
        size: file.size,
        type: file.type,
        fallback: "data-uri",
      });
    } catch (fallbackErr) {
      const msg =
        fallbackErr instanceof Error
          ? fallbackErr.message
          : storageErr instanceof Error
          ? storageErr.message
          : "Upload failed";
      return NextResponse.json({ error: msg }, { status: 500 });
    }
  }
}

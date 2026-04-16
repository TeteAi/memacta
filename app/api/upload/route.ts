import { NextResponse } from "next/server";
import { fal } from "@fal-ai/client";
import { auth } from "@/auth";

const MAX_BYTES = 20 * 1024 * 1024; // 20 MB
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

  try {
    fal.config({ credentials: key });
    const url = await fal.storage.upload(file);
    return NextResponse.json({ url, size: file.size, type: file.type });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Upload failed";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

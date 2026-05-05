import { NextResponse } from "next/server";
import { fal } from "@fal-ai/client";
import { auth } from "@/auth";
import { rateLimit, rateLimitKey } from "@/lib/rate-limit";
import { uploadPersonaPhoto } from "@/lib/storage/upload";

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
 * Uploads a reference image or persona photo.
 *
 * Standard (no context): uploads to fal.ai storage, returns public URL.
 * context=persona-photo: uploads to our private persona-photos Supabase bucket,
 *   returns signed URL + storageKey. personaId must be provided in the form.
 *
 * Requires an authenticated user.
 */
export async function POST(req: Request) {
  const session = await auth();
  const userId = (session?.user as { id?: string } | undefined)?.id;
  if (!userId) {
    return NextResponse.json({ error: "auth_required" }, { status: 401 });
  }

  // Cap uploads at 20/min per user.
  const rl = await rateLimit(rateLimitKey(req, userId), {
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

  const context = form.get("context");

  // ── Persona photo path: upload to Supabase private bucket ──────────────────
  if (context === "persona-photo") {
    const personaId = form.get("personaId");
    if (typeof personaId !== "string" || !personaId) {
      return NextResponse.json({ error: "personaId required for persona-photo context" }, { status: 400 });
    }

    try {
      const buffer = Buffer.from(await file.arrayBuffer());
      const result = await uploadPersonaPhoto(userId, personaId, buffer, file.type);

      if (!result) {
        // Persona photos are biometric likeness data (BIPA / GDPR Art.9) —
        // they MUST land in the private Supabase bucket. In production a
        // missing storage client is a hard failure, not a silent fall-through
        // to fal.ai's globally-readable URL space. In dev we still warn but
        // continue so local hacking can use the fal upload path.
        if (process.env.NODE_ENV === "production") {
          // eslint-disable-next-line no-console
          console.error(
            "[upload] persona-photo: Supabase storage missing in production — refusing fall-through."
          );
          return NextResponse.json(
            {
              error: "storage_unavailable",
              message:
                "Photo storage is temporarily unavailable. Please try again in a few minutes.",
            },
            { status: 503 }
          );
        }
        // eslint-disable-next-line no-console
        console.warn(
          "[upload] persona-photo: Supabase not configured (dev only); falling back to fal.ai."
        );
      } else {
        return NextResponse.json({
          url: result.signedUrl,
          key: result.storageKey,
          size: file.size,
          type: file.type,
          bucket: "persona-photos",
        });
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      return NextResponse.json({ error: `Storage upload failed: ${msg}` }, { status: 500 });
    }
  }

  // ── Standard path: upload to fal.ai storage ────────────────────────────────
  const key = process.env.FAL_KEY;
  if (!key) {
    return NextResponse.json(
      { error: "Upload service is not configured" },
      { status: 503 }
    );
  }

  // Strategy: try fal.storage first (hosted URL, smallest downstream payload).
  // If it fails for any reason, fall back to a base64 data URI.
  try {
    fal.config({ credentials: key });
    const url = await fal.storage.upload(file);
    let storageKey: string;
    try {
      storageKey = new URL(url).pathname.replace(/^\//, "");
    } catch {
      storageKey = url;
    }
    return NextResponse.json({ url, key: storageKey, size: file.size, type: file.type });
  } catch (storageErr) {
    try {
      const buffer = Buffer.from(await file.arrayBuffer());
      const dataUri = `data:${file.type};base64,${buffer.toString("base64")}`;
      return NextResponse.json({
        url: dataUri,
        key: null,
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

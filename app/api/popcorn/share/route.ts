import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { rateLimit, rateLimitKey } from "@/lib/rate-limit";

const Body = z.object({
  clips: z.array(z.string().url()).min(1).max(8),
  presetId: z.string().min(1).max(64),
});

export async function POST(req: Request) {
  // Rate limit BEFORE auth so a leaked session token can't be used to spam
  // the gallery. 1 share per minute is plenty for a real user.
  const burstCheck = await rateLimit(rateLimitKey(req, null), {
    windowMs: 60_000,
    max: 1,
  });
  if (!burstCheck.ok) {
    return NextResponse.json(
      {
        error: "rate_limited",
        message: "You can share once per minute. Try again shortly.",
        retryAfter: Math.ceil(burstCheck.retryAfterMs / 1000),
      },
      {
        status: 429,
        headers: {
          "retry-after": String(Math.ceil(burstCheck.retryAfterMs / 1000)),
        },
      }
    );
  }

  const session = await auth();
  const userId = (session?.user as { id?: string } | undefined)?.id;
  if (!userId) {
    return NextResponse.json({ error: "auth_required" }, { status: 401 });
  }

  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid" }, { status: 400 });
  }

  const parsed = Body.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid", details: parsed.error.flatten() }, { status: 400 });
  }

  const { clips, presetId } = parsed.data;
  const [primaryUrl, ...extraUrls] = clips;

  // Ownership check — every URL the user is publishing must already exist as
  // a Generation row owned by them. Prevents sharing other users' content,
  // posting arbitrary external URLs as "their" creation, and embed-injection
  // by way of the public gallery.
  const owned = await prisma.generation.findMany({
    where: {
      userId,
      OR: [{ resultUrl: { in: clips } }, { imageUrl: { in: clips } }],
    },
    select: { resultUrl: true, imageUrl: true },
  });
  const ownedSet = new Set<string>();
  for (const g of owned) {
    if (g.resultUrl) ownedSet.add(g.resultUrl);
    if (g.imageUrl) ownedSet.add(g.imageUrl);
  }
  const missing = clips.filter((c) => !ownedSet.has(c));
  if (missing.length > 0) {
    return NextResponse.json(
      {
        error: "ownership_check_failed",
        message:
          "Every clip you share must come from your own library. " +
          "Generate the missing clips first, then try again.",
        missing,
      },
      { status: 403 }
    );
  }

  try {
    const post = await prisma.post.create({
      data: {
        userId,
        title: `Popcorn pack — ${presetId}`,
        description: JSON.stringify({ presetId, extraClips: extraUrls }),
        mediaUrl: primaryUrl,
        mediaType: "video",
        toolUsed: "popcorn",
      },
    });
    return NextResponse.json({ postId: post.id }, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: "server", detail: String(e) }, { status: 500 });
  }
}

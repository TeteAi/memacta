import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { auth } from "@/auth";
import { moderatePrompt, moderationMessage } from "@/lib/moderation";

const CreateBody = z.object({
  title: z.string().min(1).max(120),
  description: z.string().max(500).optional(),
  mediaUrl: z.string().url().min(1),
  mediaType: z.enum(["image", "video"]),
  toolUsed: z.string().max(80).optional(),
});

// Community-post rate limit: one submission per POST_COOLDOWN_MS per user.
// Keeps a single user from flooding the gallery with spam posts, and gives
// the trust & safety story a simple backstop until we add a real queue.
const POST_COOLDOWN_MS = 60_000;

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const page = Math.max(1, Number(url.searchParams.get("page") ?? "1"));
    const take = 20;
    const skip = (page - 1) * take;

    const posts = await prisma.post.findMany({
      orderBy: { createdAt: "desc" },
      take,
      skip,
      include: { user: { select: { name: true } } },
    });
    return NextResponse.json({ posts, page });
  } catch {
    return NextResponse.json({ posts: [], page: 1 });
  }
}

export async function POST(req: Request) {
  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid" }, { status: 400 });
  }
  const parsed = CreateBody.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid", details: parsed.error.flatten() }, { status: 400 });
  }

  // Require auth — anonymous posting was a spam/abuse vector (any unauth
  // client could drop arbitrary URLs into the public gallery).
  const session = await auth();
  const userId = (session?.user as { id?: string } | undefined)?.id ?? null;
  if (!userId) {
    return NextResponse.json(
      {
        error: "auth_required",
        message: "Sign in to share to the community gallery.",
      },
      { status: 401 }
    );
  }

  // Run the same moderation filter we apply to generation prompts against
  // the user-provided title + description. Stops slurs, self-harm content,
  // non-consensual deepfake solicitations, etc. from landing in the public
  // feed. The mediaUrl itself is validated below (must be one of the
  // user's own generations), so no need to content-moderate the image
  // bytes — it already passed prompt moderation at generation time.
  const textToScreen = [parsed.data.title, parsed.data.description ?? ""]
    .filter(Boolean)
    .join("\n");
  const moderation = moderatePrompt(textToScreen);
  if (!moderation.allowed) {
    // eslint-disable-next-line no-console
    console.warn(
      JSON.stringify({
        event: "community.post_blocked",
        reason: moderation.reason,
        userId,
        titlePreview: parsed.data.title.slice(0, 80),
      })
    );
    return NextResponse.json(
      {
        error: "post_blocked",
        reason: moderation.reason,
        message: moderationMessage(moderation.reason),
      },
      { status: 400 }
    );
  }

  // Rate-limit posts per user. Cheap check against most-recent post.
  const lastPost = await prisma.post.findFirst({
    where: { userId },
    orderBy: { createdAt: "desc" },
    select: { createdAt: true },
  });
  if (lastPost) {
    const elapsed = Date.now() - lastPost.createdAt.getTime();
    if (elapsed < POST_COOLDOWN_MS) {
      const waitSec = Math.ceil((POST_COOLDOWN_MS - elapsed) / 1000);
      return NextResponse.json(
        {
          error: "rate_limited",
          message: `Please wait ${waitSec}s before posting again.`,
          retryAfterSec: waitSec,
        },
        { status: 429 }
      );
    }
  }

  // Ownership check: only let users post media THEY generated. We match
  // against the Generation table's resultUrl + imageUrl. This stops users
  // from hotlinking arbitrary URLs (including other people's content or
  // malware) into our public gallery. If we later add a Creator role or
  // an explicit "upload to library" path, extend this check there.
  const owned = await prisma.generation.findFirst({
    where: {
      userId,
      OR: [
        { resultUrl: parsed.data.mediaUrl },
        { imageUrl: parsed.data.mediaUrl },
      ],
    },
    select: { id: true },
  });
  if (!owned) {
    return NextResponse.json(
      {
        error: "not_your_media",
        message: "You can only share things you generated on memacta.",
      },
      { status: 403 }
    );
  }

  try {
    const post = await prisma.post.create({
      data: {
        userId,
        title: parsed.data.title,
        description: parsed.data.description ?? null,
        mediaUrl: parsed.data.mediaUrl,
        mediaType: parsed.data.mediaType,
        toolUsed: parsed.data.toolUsed ?? null,
      },
    });
    return NextResponse.json(post, { status: 201 });
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error(
      JSON.stringify({
        event: "community.post_failed",
        userId,
        error: e instanceof Error ? e.message : String(e),
      })
    );
    return NextResponse.json(
      { error: "server", message: "Couldn't post. Please try again." },
      { status: 500 }
    );
  }
}

import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";

const Body = z.object({
  clips: z.array(z.string()).min(1),
  presetId: z.string().min(1),
});

export async function POST(req: Request) {
  const session = await auth();
  const userId = (session?.user as { id?: string } | undefined)?.id ?? null;

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

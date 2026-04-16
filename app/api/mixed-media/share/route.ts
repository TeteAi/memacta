import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";

const ItemSchema = z.object({
  prompt: z.string().min(1),
  styleIds: z.array(z.string()).min(1),
  mediaUrl: z.string().url(),
  mediaType: z.enum(["image", "video"]),
});

const Body = z.object({
  items: z.array(ItemSchema).min(1),
  isPublic: z.boolean().optional().default(true), // stored in featured field (true = public)
});

export async function POST(req: Request) {
  const session = await auth();
  const userId = (session?.user as { id?: string } | undefined)?.id ?? null;

  if (!userId) {
    return NextResponse.json(
      {
        error: "auth_required",
        redirect: "/auth/signin?callbackUrl=/tools/mixed-media",
      },
      { status: 401 },
    );
  }

  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid" }, { status: 400 });
  }

  const parsed = Body.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "invalid", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const { items, isPublic } = parsed.data;

  try {
    const posts = await Promise.all(
      items.map((item) =>
        prisma.post.create({
          data: {
            userId,
            title: `Mixed Media — ${item.styleIds.join(" x ")}`,
            description: item.prompt,
            mediaUrl: item.mediaUrl,
            mediaType: item.mediaType,
            toolUsed: "mixed-media",
            featured: isPublic,
          },
        }),
      ),
    );
    return NextResponse.json(
      { success: true, postIds: posts.map((p) => p.id) },
      { status: 201 },
    );
  } catch (e) {
    return NextResponse.json({ error: "server", detail: String(e) }, { status: 500 });
  }
}

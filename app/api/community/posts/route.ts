import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { auth } from "@/auth";

const CreateBody = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  mediaUrl: z.string().min(1),
  mediaType: z.enum(["image", "video"]),
  toolUsed: z.string().optional(),
});

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
  try {
    const session = await auth();
    const userId = (session?.user as { id?: string } | undefined)?.id ?? null;
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
    return NextResponse.json({ error: "server", detail: String(e) }, { status: 500 });
  }
}

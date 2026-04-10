import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { auth } from "@/auth";

const Body = z.object({ postId: z.string().min(1) });

export async function POST(req: Request) {
  const session = await auth();
  const userId = (session?.user as { id?: string } | undefined)?.id;
  if (!userId) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid" }, { status: 400 });
  }
  const parsed = Body.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid" }, { status: 400 });
  }

  const { postId } = parsed.data;

  try {
    const existing = await prisma.like.findUnique({
      where: { userId_postId: { userId, postId } },
    });

    if (existing) {
      await prisma.like.delete({ where: { id: existing.id } });
      await prisma.post.update({
        where: { id: postId },
        data: { likes: { decrement: 1 } },
      });
      return NextResponse.json({ liked: false });
    } else {
      await prisma.like.create({ data: { userId, postId } });
      await prisma.post.update({
        where: { id: postId },
        data: { likes: { increment: 1 } },
      });
      return NextResponse.json({ liked: true });
    }
  } catch (e) {
    return NextResponse.json({ error: "server", detail: String(e) }, { status: 500 });
  }
}

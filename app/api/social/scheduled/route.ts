import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";

export async function GET() {
  const session = await auth();
  const userId = (session?.user as { id?: string } | undefined)?.id;
  if (!userId) {
    return NextResponse.json({ posts: [] });
  }

  const posts = await prisma.scheduledPost.findMany({
    where: { userId },
    orderBy: { scheduledFor: "asc" },
  });

  return NextResponse.json({ posts });
}

export async function DELETE(req: NextRequest) {
  const session = await auth();
  const userId = (session?.user as { id?: string } | undefined)?.id;
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 });
  }

  // Only delete if it belongs to the user and is pending
  await prisma.scheduledPost.deleteMany({
    where: { id, userId, status: "pending" },
  });

  return NextResponse.json({ ok: true });
}

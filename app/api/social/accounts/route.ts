import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";

export async function GET() {
  const session = await auth();
  const userId = (session?.user as { id?: string } | undefined)?.id;
  if (!userId) {
    return NextResponse.json({ accounts: [] });
  }

  const accounts = await prisma.socialAccount.findMany({
    where: { userId },
    select: { id: true, platform: true, username: true },
  });

  return NextResponse.json({ accounts });
}

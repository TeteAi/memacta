import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { publishToSocial } from "@/lib/social/post-service";

export async function POST(req: NextRequest) {
  const session = await auth();
  const userId = (session?.user as { id?: string } | undefined)?.id;
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { platforms, mediaUrl, mediaType, caption, scheduledFor } = body as {
    platforms: string[];
    mediaUrl: string;
    mediaType: string;
    caption?: string;
    scheduledFor?: string;
  };

  if (!platforms?.length || !mediaUrl || !mediaType) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  // If scheduling for the future
  if (scheduledFor) {
    const scheduledDate = new Date(scheduledFor);
    if (scheduledDate > new Date()) {
      const created = await Promise.all(
        platforms.map((platform) =>
          prisma.scheduledPost.create({
            data: {
              userId,
              platform,
              mediaUrl,
              mediaType,
              caption: caption ?? null,
              scheduledFor: scheduledDate,
            },
          })
        )
      );
      return NextResponse.json({ scheduled: true, count: created.length });
    }
  }

  // Post now
  const results = await Promise.all(
    platforms.map(async (platform) => {
      const account = await prisma.socialAccount.findUnique({
        where: { userId_platform: { userId, platform } },
      });
      if (!account) {
        return { platform, success: false, error: "Account not connected" };
      }
      const result = await publishToSocial({
        platform,
        mediaUrl,
        mediaType: mediaType as "image" | "video",
        caption,
        accessToken: account.accessToken,
      });
      return { platform, ...result };
    })
  );

  return NextResponse.json({ results });
}

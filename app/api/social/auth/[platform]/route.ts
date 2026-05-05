import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { getPlatform } from "@/lib/social/platforms";
import { getAppUrl } from "@/lib/app-url";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ platform: string }> }
) {
  // This route is a development stub that mints fake tokens. Real OAuth
  // flows need a `state` (HMAC of userId + nonce, validated on callback)
  // to prevent CSRF account linking; until that's wired in, refuse to
  // run in production so a deploy can never quietly accept fake tokens.
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json(
      {
        error: "not_available",
        message: "Social account linking is not yet enabled.",
      },
      { status: 503 }
    );
  }

  const session = await auth();
  const userId = (session?.user as { id?: string } | undefined)?.id;
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { platform: platformId } = await params;
  const platform = getPlatform(platformId);
  if (!platform) {
    return NextResponse.json({ error: "Unknown platform" }, { status: 400 });
  }

  const mockUsername = `user_${userId.slice(0, 6)}`;
  const mockToken = `mock_token_${platformId}_${Date.now()}`;

  await prisma.socialAccount.upsert({
    where: { userId_platform: { userId, platform: platformId } },
    update: {
      accessToken: mockToken,
      username: mockUsername,
      platformUserId: `mock-${platformId}-${userId}`,
    },
    create: {
      userId,
      platform: platformId,
      accessToken: mockToken,
      username: mockUsername,
      platformUserId: `mock-${platformId}-${userId}`,
    },
  });

  return NextResponse.redirect(`${getAppUrl()}/account?connected=${platformId}`);
}

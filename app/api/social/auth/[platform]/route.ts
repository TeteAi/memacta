import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { getPlatform } from "@/lib/social/platforms";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ platform: string }> }
) {
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

  // Stub OAuth: In production, redirect to platform.oauthUrl with client_id + redirect_uri + scopes.
  // For now, create a mock SocialAccount and redirect back.
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

  const baseUrl = process.env.AUTH_URL || "http://localhost:3000";
  return NextResponse.redirect(`${baseUrl}/account?connected=${platformId}`);
}

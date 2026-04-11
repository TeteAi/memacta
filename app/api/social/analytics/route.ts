import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";

export async function GET() {
  const session = await auth();
  const userId = (session?.user as { id?: string } | undefined)?.id;
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Get all posted social posts with analytics
  const posts = await prisma.scheduledPost.findMany({
    where: { userId, status: "posted" },
    include: { analytics: true },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  // Aggregate stats
  const totalPosts = posts.length;
  const totalViews = posts.reduce((sum, p) => sum + (p.analytics?.views ?? 0), 0);
  const totalLikes = posts.reduce((sum, p) => sum + (p.analytics?.likes ?? 0), 0);
  const totalComments = posts.reduce((sum, p) => sum + (p.analytics?.comments ?? 0), 0);
  const totalShares = posts.reduce((sum, p) => sum + (p.analytics?.shares ?? 0), 0);
  const avgEngagement = totalPosts > 0
    ? posts.reduce((sum, p) => sum + (p.analytics?.engagementRate ?? 0), 0) / totalPosts
    : 0;

  // Per-platform stats
  const platforms = ["instagram", "tiktok", "x", "youtube"];
  const platformStats = platforms.map((platform) => {
    const platformPosts = posts.filter((p) => p.platform === platform);
    return {
      platform,
      posts: platformPosts.length,
      views: platformPosts.reduce((sum, p) => sum + (p.analytics?.views ?? 0), 0),
      likes: platformPosts.reduce((sum, p) => sum + (p.analytics?.likes ?? 0), 0),
      engagement: platformPosts.length > 0
        ? platformPosts.reduce((sum, p) => sum + (p.analytics?.engagementRate ?? 0), 0) / platformPosts.length
        : 0,
    };
  }).filter((s) => s.posts > 0);

  return NextResponse.json({
    summary: { totalPosts, totalViews, totalLikes, totalComments, totalShares, avgEngagement },
    platformStats,
    recentPosts: posts.slice(0, 10).map((p) => ({
      id: p.id,
      platform: p.platform,
      caption: p.caption,
      mediaUrl: p.mediaUrl,
      mediaType: p.mediaType,
      postedAt: p.scheduledFor.toISOString(),
      analytics: p.analytics ? {
        views: p.analytics.views,
        likes: p.analytics.likes,
        comments: p.analytics.comments,
        shares: p.analytics.shares,
        engagementRate: p.analytics.engagementRate,
      } : null,
    })),
  });
}

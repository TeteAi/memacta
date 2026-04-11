import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import Link from "next/link";
import DashboardClient from "./dashboard-client";

export const metadata = { title: "memacta – Dashboard" };
export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const session = await auth();
  const userId = (session?.user as { id?: string } | undefined)?.id;

  if (!userId) {
    return (
      <main className="mx-auto max-w-5xl px-6 py-16 text-center">
        <h1 className="text-3xl font-bold bg-brand-gradient bg-clip-text text-transparent mb-4">Dashboard</h1>
        <p className="text-white/70 mb-6">Sign in to view your content performance</p>
        <Link
          href="/api/auth/signin"
          className="inline-block px-6 py-3 rounded-xl bg-brand-gradient text-white font-semibold glow-btn"
        >
          Sign In
        </Link>
      </main>
    );
  }

  const [user, generations, postedPosts, scheduledPosts, socialAccounts] = await Promise.all([
    prisma.user.findUnique({ where: { id: userId }, select: { credits: true, name: true } }),
    prisma.generation.findMany({ where: { userId }, orderBy: { createdAt: "desc" }, take: 10 }),
    prisma.scheduledPost.findMany({
      where: { userId, status: "posted" },
      include: { analytics: true },
      orderBy: { createdAt: "desc" },
      take: 20,
    }),
    prisma.scheduledPost.findMany({
      where: { userId, status: "pending" },
      orderBy: { scheduledFor: "asc" },
      take: 10,
    }),
    prisma.socialAccount.findMany({
      where: { userId },
      select: { platform: true, username: true },
    }),
  ]);

  // Compute summary stats
  const totalViews = postedPosts.reduce((sum, p) => sum + (p.analytics?.views ?? 0), 0);
  const totalLikes = postedPosts.reduce((sum, p) => sum + (p.analytics?.likes ?? 0), 0);
  const totalComments = postedPosts.reduce((sum, p) => sum + (p.analytics?.comments ?? 0), 0);
  const totalShares = postedPosts.reduce((sum, p) => sum + (p.analytics?.shares ?? 0), 0);
  const avgEngagement = postedPosts.length > 0
    ? postedPosts.reduce((sum, p) => sum + (p.analytics?.engagementRate ?? 0), 0) / postedPosts.length
    : 0;

  const stats = {
    credits: user?.credits ?? 0,
    totalGenerations: generations.length,
    totalPosted: postedPosts.length,
    totalScheduled: scheduledPosts.length,
    totalViews,
    totalLikes,
    totalComments,
    totalShares,
    avgEngagement,
  };

  const recentPosts = postedPosts.slice(0, 8).map((p) => ({
    id: p.id,
    platform: p.platform,
    caption: p.caption ?? "",
    mediaUrl: p.mediaUrl,
    mediaType: p.mediaType,
    postedAt: p.scheduledFor.toISOString(),
    views: p.analytics?.views ?? 0,
    likes: p.analytics?.likes ?? 0,
    comments: p.analytics?.comments ?? 0,
    shares: p.analytics?.shares ?? 0,
    engagementRate: p.analytics?.engagementRate ?? 0,
  }));

  const upcoming = scheduledPosts.map((p) => ({
    id: p.id,
    platform: p.platform,
    caption: p.caption ?? "",
    mediaType: p.mediaType,
    scheduledFor: p.scheduledFor.toISOString(),
  }));

  const recentCreations = generations.map((g) => ({
    id: g.id,
    prompt: g.prompt.slice(0, 80),
    mediaType: g.mediaType,
    resultUrl: g.resultUrl,
    status: g.status,
    createdAt: g.createdAt.toISOString(),
  }));

  return (
    <DashboardClient
      userName={user?.name ?? "Creator"}
      stats={stats}
      recentPosts={recentPosts}
      upcoming={upcoming}
      recentCreations={recentCreations}
      connectedPlatforms={socialAccounts.map((a) => ({ platform: a.platform, username: a.username ?? "" }))}
    />
  );
}

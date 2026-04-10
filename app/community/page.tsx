import { prisma } from "@/lib/db";
import { SHOWCASE_ITEMS } from "@/lib/showcase";
import PostCard, { type PostCardData } from "@/components/community/post-card";
import Link from "next/link";

export const metadata = { title: "memacta \u2013 Community" };
export const dynamic = "force-dynamic";

export default async function CommunityPage() {
  const posts = await prisma.post.findMany({
    orderBy: { createdAt: "desc" },
    take: 20,
    include: { user: { select: { name: true } } },
  });

  const cards: PostCardData[] = posts.map((p) => ({
    id: p.id,
    title: p.title,
    mediaUrl: p.mediaUrl,
    mediaType: p.mediaType,
    creatorName: p.user?.name ?? null,
    likes: p.likes,
    liked: false,
  }));

  // Supplement with showcase items if fewer than 6 user posts
  const featuredCards: PostCardData[] =
    cards.length < 6
      ? SHOWCASE_ITEMS.slice(0, 8).map((item) => ({
          id: `featured-${item.id}`,
          title: item.title,
          mediaUrl: item.mediaUrl,
          mediaType: item.mediaType,
          creatorName: item.creator,
          likes: Math.floor(Math.random() * 150) + 20,
          liked: false,
        }))
      : [];

  const allCards = [...cards, ...featuredCards];

  return (
    <main className="p-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Community</h1>
        <div className="flex gap-3">
          <Link
            href="/community/contests"
            className="text-sm text-brand-cyan hover:underline"
          >
            Contests
          </Link>
          <Link
            href="/community/submit"
            className="px-4 py-2 rounded-lg bg-brand-gradient text-white text-sm font-medium hover:opacity-90 transition-opacity"
          >
            Submit Project
          </Link>
        </div>
      </div>

      {featuredCards.length > 0 && cards.length > 0 && (
        <p className="text-xs text-muted-foreground mb-4">
          Showing community posts and featured showcase content
        </p>
      )}

      {allCards.length === 0 ? (
        <p className="text-muted-foreground text-center py-12">
          No posts yet. Be the first to share your creation!
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {allCards.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      )}
    </main>
  );
}

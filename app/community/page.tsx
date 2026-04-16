import { prisma } from "@/lib/db";
import { SHOWCASE_ITEMS } from "@/lib/showcase";
import PostCard, { type PostCardData } from "@/components/community/post-card";
import Link from "next/link";
import { userToUsername } from "@/lib/profile";

export const metadata = { title: "memacta \u2013 Community" };
export const dynamic = "force-dynamic";

export default async function CommunityPage() {
  const posts = await prisma.post.findMany({
    orderBy: { createdAt: "desc" },
    take: 20,
    include: { user: { select: { id: true, name: true } } },
  });

  const cards: PostCardData[] = posts.map((p) => ({
    id: p.id,
    title: p.title,
    mediaUrl: p.mediaUrl,
    mediaType: p.mediaType,
    creatorName: p.user?.name ?? null,
    creatorUsername: p.user
      ? userToUsername({ id: p.user.id, name: p.user.name })
      : null,
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
          creatorUsername: userToUsername({ id: item.creator, name: item.creator }),
          likes: Math.floor(Math.random() * 150) + 20,
          liked: false,
          externalHref: item.mediaUrl,
        }))
      : [];

  const allCards = [...cards, ...featuredCards];

  return (
    <main className="p-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-brand-gradient">Community</h1>
        <div className="flex gap-3">
          <Link
            href="/community/contests"
            className="text-sm font-medium px-4 py-2 rounded-xl bg-white/15 text-white hover:bg-white/25 transition-colors"
          >
            Contests
          </Link>
          <Link
            href="/community/submit"
            className="px-5 py-2 rounded-xl bg-brand-gradient text-white text-sm font-semibold hover:opacity-90 transition-all glow-btn"
          >
            Submit Project
          </Link>
        </div>
      </div>

      {featuredCards.length > 0 && cards.length > 0 && (
        <p className="text-xs text-white/60 mb-4">
          Showing community posts and featured showcase content
        </p>
      )}

      {allCards.length === 0 ? (
        <p className="text-white/60 text-center py-16">
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

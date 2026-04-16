import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { prisma } from "@/lib/db";
import { SHOWCASE_ITEMS } from "@/lib/showcase";
import {
  userToUsername,
  matchUsernameToUser,
  computeProfileStats,
  computeTopModels,
} from "@/lib/profile";
import type { PostCardData } from "@/components/community/post-card";
import ProfileHeader from "@/components/profile/profile-header";
import ProfileStats from "@/components/profile/profile-stats";
import ProfileTopModels from "@/components/profile/profile-top-models";
import ProfileGrid from "@/components/profile/profile-grid";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 48;

type Props = {
  params: Promise<{ username: string }>;
  searchParams: Promise<{ page?: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { username } = await params;

  // Try DB user first
  const allUsers = await prisma.user.findMany({
    select: { id: true, name: true },
  });
  const matched = matchUsernameToUser(decodeURIComponent(username), allUsers);
  if (matched) {
    const displayName = matched.name ?? username;
    return {
      title: `${displayName} on memacta`,
      description: `${displayName}'s creations on memacta`,
    };
  }

  // Showcase fallback
  const showcaseSlug = decodeURIComponent(username).toLowerCase().replace(/[^a-z0-9]/g, "");
  const showcaseMatch = SHOWCASE_ITEMS.find(
    (item) => item.creator.toLowerCase().replace(/[^a-z0-9]/g, "") === showcaseSlug
  );
  if (showcaseMatch) {
    return {
      title: `${showcaseMatch.creator} on memacta`,
      description: `${showcaseMatch.creator}'s creations on memacta`,
    };
  }

  return { title: "Creator not found — memacta" };
}

export default async function CreatorProfilePage({ params, searchParams }: Props) {
  const { username } = await params;
  const { page: pageParam } = await searchParams;
  const page = Math.max(1, parseInt(pageParam ?? "1", 10) || 1);
  const decodedUsername = decodeURIComponent(username);

  // 1. Try matching to a real DB user
  const allUsers = await prisma.user.findMany({
    select: { id: true, name: true },
  });

  const matchedUser = matchUsernameToUser(decodedUsername, allUsers);

  if (matchedUser) {
    // Fetch real user's posts
    const totalCount = await prisma.post.count({ where: { userId: matchedUser.id } });
    const allPostsForStats = await prisma.post.findMany({
      where: { userId: matchedUser.id },
      select: { likes: true, toolUsed: true },
    });
    const paginatedPosts = await prisma.post.findMany({
      where: { userId: matchedUser.id },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    });

    const userFull = await prisma.user.findUnique({
      where: { id: matchedUser.id },
      select: { name: true, image: true, createdAt: true, email: true },
    });

    const stats = computeProfileStats(allPostsForStats);
    const topModels = computeTopModels(allPostsForStats);
    const derivedUsername = userToUsername(matchedUser);

    const cards: PostCardData[] = paginatedPosts.map((p) => ({
      id: p.id,
      title: p.title,
      mediaUrl: p.mediaUrl,
      mediaType: p.mediaType,
      creatorName: userFull?.name ?? null,
      creatorUsername: derivedUsername,
      likes: p.likes,
      liked: false,
    }));

    const hasMore = totalCount > page * PAGE_SIZE;

    return (
      <main className="p-8 max-w-7xl mx-auto">
        <ProfileHeader
          name={userFull?.name ?? derivedUsername}
          username={derivedUsername}
          imageUrl={userFull?.image}
          isFeatured={false}
        />
        <ProfileStats
          totalPosts={stats.totalPosts}
          totalLikes={stats.totalLikes}
          uniqueModels={stats.uniqueModels}
          joinedAt={userFull?.createdAt?.toISOString() ?? null}
          isFeatured={false}
        />
        <ProfileTopModels models={topModels} />
        <ProfileGrid
          posts={cards}
          hasMore={hasMore}
          currentPage={page}
          username={derivedUsername}
        />
      </main>
    );
  }

  // 2. Showcase fallback — strip all non-alphanumeric for comparison
  const slugNorm = decodedUsername.toLowerCase().replace(/[^a-z0-9]/g, "");
  const showcaseItems = SHOWCASE_ITEMS.filter(
    (item) => item.creator.toLowerCase().replace(/[^a-z0-9]/g, "") === slugNorm
  );

  if (showcaseItems.length > 0) {
    const creatorName = showcaseItems[0].creator;
    const showcaseUsername = userToUsername({ id: creatorName, name: creatorName });

    const allShowcasePosts = showcaseItems.map((item) => ({
      likes: Math.floor(Math.random() * 200) + 20,
      toolUsed: item.tool,
    }));

    const stats = computeProfileStats(allShowcasePosts);
    const topModels = computeTopModels(allShowcasePosts);

    // Paginate
    const start = (page - 1) * PAGE_SIZE;
    const paginatedItems = showcaseItems.slice(start, start + PAGE_SIZE);
    const hasMore = showcaseItems.length > page * PAGE_SIZE;

    const cards: PostCardData[] = paginatedItems.map((item, i) => ({
      id: `featured-${item.id}`,
      title: item.title,
      mediaUrl: item.mediaUrl,
      mediaType: item.mediaType,
      creatorName: creatorName,
      creatorUsername: showcaseUsername,
      likes: allShowcasePosts[start + i]?.likes ?? 0,
      liked: false,
      externalHref: item.mediaUrl,
    }));

    return (
      <main className="p-8 max-w-7xl mx-auto">
        <ProfileHeader
          name={creatorName}
          username={showcaseUsername}
          isFeatured={true}
          bio={`Visual storyteller — ${[...new Set(showcaseItems.map((i) => i.tool))].join(" · ")}`}
        />
        <ProfileStats
          totalPosts={stats.totalPosts}
          totalLikes={stats.totalLikes}
          uniqueModels={stats.uniqueModels}
          isFeatured={true}
        />
        <ProfileTopModels models={topModels} />
        <ProfileGrid
          posts={cards}
          hasMore={hasMore}
          currentPage={page}
          username={showcaseUsername}
        />
      </main>
    );
  }

  // 3. Not found
  notFound();
}

import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import Link from "next/link";
import PostCard, { type PostCardData } from "@/components/community/post-card";

export const dynamic = "force-dynamic";

export default async function PostDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const post = await prisma.post.findUnique({
    where: { id },
    include: { user: { select: { name: true } } },
  });
  if (!post) notFound();

  const card: PostCardData = {
    id: post.id,
    title: post.title,
    mediaUrl: post.mediaUrl,
    mediaType: post.mediaType,
    creatorName: post.user?.name ?? null,
    likes: post.likes,
    liked: false,
  };

  return (
    <main className="p-8 max-w-4xl mx-auto">
      <Link
        href="/community"
        className="text-sm text-muted-foreground hover:text-foreground mb-4 inline-block"
      >
        &larr; Back to Community
      </Link>

      <div className="rounded-xl border border-border bg-white/5 overflow-hidden">
        <div className="aspect-video bg-white/10 flex items-center justify-center">
          {post.mediaType === "video" ? (
            <video
              src={post.mediaUrl}
              controls
              className="w-full h-full object-contain"
            />
          ) : (
            <img
              src={post.mediaUrl}
              alt={post.title}
              className="w-full h-full object-contain"
            />
          )}
        </div>

        <div className="p-6 space-y-3">
          <h1 className="text-2xl font-bold">{post.title}</h1>
          {post.description && (
            <p className="text-muted-foreground">{post.description}</p>
          )}
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span>By {post.user?.name ?? "Anonymous"}</span>
            {post.toolUsed && <span>Made with {post.toolUsed}</span>}
            <span>{post.createdAt.toISOString().split("T")[0]}</span>
          </div>
          <div className="pt-2">
            <PostCard post={card} />
          </div>
        </div>
      </div>
    </main>
  );
}

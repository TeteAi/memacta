import PostCard, { type PostCardData } from "@/components/community/post-card";
import ProfileEmpty from "./profile-empty";

interface ProfileGridProps {
  posts: PostCardData[];
  hasMore?: boolean;
  currentPage?: number;
  username: string;
}

export default function ProfileGrid({
  posts,
  hasMore = false,
  currentPage = 1,
  username,
}: ProfileGridProps) {
  if (posts.length === 0) {
    return <ProfileEmpty />;
  }

  return (
    <div data-testid="profile-grid">
      <h2 className="text-sm font-semibold text-white/60 uppercase tracking-wider mb-4">
        Featured Work
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
        {posts.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>

      {hasMore && (
        <div className="flex justify-center mt-6">
          <a
            href={`/u/${encodeURIComponent(username)}?page=${currentPage + 1}`}
            className="px-6 py-2 rounded-xl border border-white/20 text-sm font-medium text-white hover:bg-white/10 transition-colors"
          >
            Load more
          </a>
        </div>
      )}
    </div>
  );
}

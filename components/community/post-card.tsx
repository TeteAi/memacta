"use client";

import { useState } from "react";
import Link from "next/link";

export type PostCardData = {
  id: string;
  title: string;
  mediaUrl: string;
  mediaType: string;
  creatorName: string | null;
  creatorUsername?: string | null; // derived slug for /u/[username] link
  likes: number;
  liked: boolean;
  externalHref?: string | null; // if set, media tile links here (new tab) instead of /community/[id]
};

export default function PostCard({ post }: { post: PostCardData }) {
  const [likes, setLikes] = useState(post.likes);
  const [liked, setLiked] = useState(post.liked);

  async function toggleLike() {
    const prev = liked;
    setLiked(!liked);
    setLikes((l) => (prev ? l - 1 : l + 1));
    try {
      await fetch("/api/community/likes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postId: post.id }),
      });
    } catch {
      setLiked(prev);
      setLikes((l) => (prev ? l + 1 : l - 1));
    }
  }

  const mediaTile = (
    <div className="aspect-video bg-white/10 flex items-center justify-center relative overflow-hidden">
      {post.mediaType === "video" ? (
        <video
          src={post.mediaUrl}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          muted
        />
      ) : (
        <img
          src={post.mediaUrl}
          alt={post.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
      )}
    </div>
  );

  return (
    <div
      data-testid="post-card"
      className="rounded-xl border border-white/15 bg-[#181828] overflow-hidden group hover:border-purple-500/40 hover:shadow-lg hover:shadow-purple-500/10 transition-all"
    >
      {post.externalHref ? (
        <a
          href={post.externalHref}
          target="_blank"
          rel="noopener noreferrer"
        >
          {mediaTile}
        </a>
      ) : (
        <Link href={`/community/${post.id}`}>{mediaTile}</Link>
      )}

      <div className="p-3 flex items-center justify-between">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-white truncate">{post.title}</p>
          {post.creatorUsername ? (
            <Link
              href={`/u/${encodeURIComponent(post.creatorUsername)}`}
              className="text-xs text-white/60 hover:text-white/90 transition-colors"
              onClick={(e) => e.stopPropagation()}
            >
              {post.creatorName ?? "Anonymous"}
            </Link>
          ) : (
            <p className="text-xs text-white/60">
              {post.creatorName ?? "Anonymous"}
            </p>
          )}
        </div>
        <button
          onClick={toggleLike}
          aria-label={liked ? "Unlike" : "Like"}
          className="flex items-center gap-1 text-sm shrink-0"
        >
          <span className={liked ? "text-[#FE2C55]" : "text-white/60 hover:text-white/80"}>
            {liked ? "\u2665" : "\u2661"}
          </span>
          <span data-testid="like-count">{likes}</span>
        </button>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import Link from "next/link";

export type PostCardData = {
  id: string;
  title: string;
  mediaUrl: string;
  mediaType: string;
  creatorName: string | null;
  likes: number;
  liked: boolean;
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

  return (
    <div className="rounded-xl border border-border bg-white/5 overflow-hidden group">
      <Link href={`/community/${post.id}`}>
        <div className="aspect-video bg-white/10 flex items-center justify-center">
          {post.mediaType === "video" ? (
            <video
              src={post.mediaUrl}
              className="w-full h-full object-cover"
              muted
            />
          ) : (
            <img
              src={post.mediaUrl}
              alt={post.title}
              className="w-full h-full object-cover"
            />
          )}
        </div>
      </Link>
      <div className="p-3 flex items-center justify-between">
        <div className="min-w-0">
          <p className="text-sm font-medium truncate">{post.title}</p>
          <p className="text-xs text-muted-foreground">
            {post.creatorName ?? "Anonymous"}
          </p>
        </div>
        <button
          onClick={toggleLike}
          aria-label={liked ? "Unlike" : "Like"}
          className="flex items-center gap-1 text-sm shrink-0"
        >
          <span className={liked ? "text-brand-pink" : "text-muted-foreground"}>
            {liked ? "\u2665" : "\u2661"}
          </span>
          <span data-testid="like-count">{likes}</span>
        </button>
      </div>
    </div>
  );
}

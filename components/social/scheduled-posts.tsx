"use client";

import { useState } from "react";
import { getPlatform } from "@/lib/social/platforms";
import { Button } from "@/components/ui/button";

type ScheduledPostInfo = {
  id: string;
  platform: string;
  caption: string | null;
  scheduledFor: string;
  status: string;
  mediaType: string;
};

type Props = {
  posts: ScheduledPostInfo[];
};

export default function ScheduledPosts({ posts: initialPosts }: Props) {
  const [posts, setPosts] = useState<ScheduledPostInfo[]>(initialPosts);

  async function handleCancel(id: string) {
    const res = await fetch(`/api/social/scheduled?id=${id}`, {
      method: "DELETE",
    });
    if (res.ok) {
      setPosts((prev) => prev.filter((p) => p.id !== id));
    }
  }

  return (
    <div data-testid="scheduled-posts">
      <h2 className="text-xl font-bold mb-4">Scheduled Posts</h2>
      {posts.length === 0 ? (
        <p className="text-muted-foreground">No scheduled posts.</p>
      ) : (
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-secondary/50">
                <th className="text-left p-3 font-medium">Platform</th>
                <th className="text-left p-3 font-medium">Caption</th>
                <th className="text-left p-3 font-medium">Scheduled For</th>
                <th className="text-left p-3 font-medium">Status</th>
                <th className="text-left p-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {posts.map((post) => {
                const platform = getPlatform(post.platform);
                return (
                  <tr
                    key={post.id}
                    className="border-b border-border last:border-0"
                    data-testid="scheduled-post-row"
                  >
                    <td className="p-3">
                      <span
                        className="inline-block w-3 h-3 rounded-full mr-2"
                        style={{ backgroundColor: platform?.color ?? "#888" }}
                      />
                      {platform?.name ?? post.platform}
                    </td>
                    <td className="p-3 max-w-[200px] truncate">
                      {post.caption || "-"}
                    </td>
                    <td className="p-3">
                      {new Date(post.scheduledFor).toLocaleString()}
                    </td>
                    <td className="p-3">
                      <span
                        className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
                          post.status === "posted"
                            ? "bg-green-500/20 text-green-400"
                            : post.status === "pending"
                            ? "bg-yellow-500/20 text-yellow-400"
                            : "bg-red-500/20 text-red-400"
                        }`}
                      >
                        {post.status}
                      </span>
                    </td>
                    <td className="p-3">
                      {post.status === "pending" && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleCancel(post.id)}
                          data-testid={`cancel-post-${post.id}`}
                        >
                          Cancel
                        </Button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

/**
 * Profile helpers — pure TypeScript, no DB dependency.
 * All profile data is derived from existing User + Post + SHOWCASE_ITEMS.
 */

/**
 * Converts a user object to a URL-safe username slug.
 * Spaces -> hyphens, lower-cased, non-alphanumerics stripped.
 * Repeated hyphens collapsed. Falls back to "user-<id-prefix>" when name is null.
 */
export function userToUsername(user: { id: string; name: string | null }): string {
  if (!user.name) {
    return `user-${user.id.slice(0, 6)}`;
  }
  return user.name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "") // strip non-alphanumeric (keep spaces/hyphens)
    .replace(/[\s-]+/g, "-")       // collapse spaces/hyphens -> single hyphen
    .replace(/^-+|-+$/g, "");      // trim leading/trailing hyphens
}

/**
 * Attempts to match a URL slug back to one of the provided users.
 * Accepts both the plain slug ("neon-creator") and the disambiguated form
 * ("neon-creator-<first-6-chars-of-id>").
 * Returns null when no user matches.
 */
export function matchUsernameToUser(
  username: string,
  users: Array<{ id: string; name: string | null }>
): { id: string; name: string | null } | null {
  // Try exact slug match first
  const exact = users.filter((u) => userToUsername(u) === username);
  if (exact.length === 1) return exact[0];

  // Try disambiguated match: strip trailing -<6chars> suffix and check id prefix
  // The suffix is the first 6 chars of the user's id
  const disambigMatch = users.find((u) => {
    const base = userToUsername(u);
    const idPrefix = u.id.slice(0, 6);
    return username === `${base}-${idPrefix}`;
  });
  if (disambigMatch) return disambigMatch;

  // If multiple exact slug matches (collision), none is unambiguous — return null
  if (exact.length > 1) return null;

  return null;
}

/**
 * Computes aggregate stats from a list of posts.
 */
export function computeProfileStats(
  posts: Array<{ likes: number; toolUsed: string | null }>
): { totalPosts: number; totalLikes: number; uniqueModels: number } {
  const totalPosts = posts.length;
  const totalLikes = posts.reduce((sum, p) => sum + p.likes, 0);
  const uniqueModels = new Set(posts.map((p) => p.toolUsed).filter(Boolean)).size;
  return { totalPosts, totalLikes, uniqueModels };
}

/**
 * Returns top models sorted by post count descending, with null toolUsed excluded.
 */
export function computeTopModels(
  posts: Array<{ toolUsed: string | null }>,
  limit = 6
): Array<{ name: string; count: number }> {
  const counts = new Map<string, number>();
  for (const post of posts) {
    if (post.toolUsed) {
      counts.set(post.toolUsed, (counts.get(post.toolUsed) ?? 0) + 1);
    }
  }
  return Array.from(counts.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
}

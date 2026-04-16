# Feature: creator-profiles

- **Name:** Creator Profiles
- **Category:** P6 — Library, Community & Profiles
- **Priority:** P1 (highest-conversion missing gap)
- **Source:** `.claude/state/feature-gap-analysis.md` ("Creator Profiles" — line 10, MISSING completely)
- **Reference:** https://higgsfield.ai/profile

## User story

> As a memacta creator, I want a public profile page at `/u/[username]` that showcases every piece of content I've submitted to the community, lists my stats (total posts, likes received, models used), and lets other visitors follow the link back from any community post to my profile — so I can build an audience, share one URL on social, and funnel discovery back into memacta.
>
> As a visitor, I want to click any creator name on the Community gallery or any post detail page and land on a profile with an avatar, bio, a grid of their work, and a "Start Creating" CTA that drives me to sign up and try the same models they used.

## Wireframe (ASCII)

```
+--------------------------------------------------------------------+
| HEADER (dark shell, credit pill)                                   |
+--------------------------------------------------------------------+
|                                                                    |
|   +-------+   NeonCreator                          [Share profile] |
|   |  NC   |   @neoncreator                                         |
|   |gradient|   Visual storyteller - Sora 2 - Kling 3.0              |
|   +-------+   ----------------------------------------------        |
|                                                                    |
|   [ 24 posts ]  [ 812 likes ]  [ 5 models used ]  [Joined Apr 26]  |
|                                                                    |
|   --- Top Models ---------------------------------------------     |
|   #Sora2  #Kling30  #Veo31  #NanoBananaPro                         |
|                                                                    |
|   --- Featured Work ------------------------------------------     |
|   +------+ +------+ +------+ +------+                              |
|   | vid  | | img  | | vid  | | img  |                              |
|   |      | |      | |      | |      |                              |
|   | 234  | | 189  | | 156  | | 99   |                              |
|   +------+ +------+ +------+ +------+                              |
|                                                                    |
|   --- All posts (grid 4-col -> 1-col responsive) -------------     |
|   +------+ +------+ +------+ +------+                              |
|   |  ... 20 more cards, paginated with 'Load more' ...             |
|                                                                    |
|   --- Empty state fallback -----------------------------------     |
|   "No work yet - be inspired by featured creators"                 |
|   [Browse community]  [Start creating]                             |
+--------------------------------------------------------------------+
| FOOTER                                                             |
+--------------------------------------------------------------------+
```

## Routes (Next.js app-router)

| Path | Type | Purpose |
|---|---|---|
| `app/u/[username]/page.tsx` | Server (dynamic) | Public creator profile page |
| `app/u/[username]/not-found.tsx` | Server | Custom 404 when username does not resolve |
| `app/account/page.tsx` | **edit only** | Add "View public profile" link (no new file) |

**Route choice rationale:** `/u/[username]` (single-letter prefix, like Twitter/Instagram) avoids collision with existing `/profile` semantics in NextAuth and keeps the URL shareable. Higgsfield uses `/profile` but we have a multi-tenant model, so `/u/[username]` is better.

**Username derivation** (no schema change): derive from `User.name` — slugify lowercase, replace spaces with hyphens, strip non-alphanumerics. Collisions disambiguated by appending the first 6 chars of `User.id`. The page accepts both the pure slug (`neon-creator`) and the disambiguated form (`neon-creator-a1b2c3`). Showcase items use the literal `creator` string from `SHOWCASE_ITEMS` as their username.

## Components (filenames under `components/`)

```
components/profile/
  profile-header.tsx         # avatar (gradient initials), name, @handle, bio, share btn
  profile-stats.tsx          # 4-stat row (posts, likes, models, joined)
  profile-top-models.tsx     # chip row of tools used, ranked by post count
  profile-grid.tsx           # responsive grid reusing PostCard
  profile-empty.tsx          # empty state with CTA
  profile-share-button.tsx   # client - copies profile URL to clipboard
```

Reuse existing:
- `components/community/post-card.tsx` — render each post tile (already brand-styled)
- `components/brand.tsx` BrandMark gradient for the avatar fallback initials

## Data model deltas

**No Prisma migration required.** The feature is fully derivable from existing models:

- `User.name`, `User.createdAt`, `User.image` — profile header
- `Post.userId`, `Post.likes`, `Post.toolUsed`, `Post.mediaUrl`, `Post.mediaType`, `Post.title` — grid + stats
- `SHOWCASE_ITEMS[*].creator` (string) — fallback when no real users match (e.g. "NeonCreator", "UrbanLens")

**Helper module** (pure TS, no DB change) — add `lib/profile.ts`:

```ts
export function userToUsername(user: { id: string; name: string | null }): string;

export function matchUsernameToUser(
  username: string,
  users: Array<{ id: string; name: string | null }>
): { id: string; name: string | null } | null;
// Returns null when no user matches (caller falls back to showcase lookup).

export function computeProfileStats(
  posts: Array<{ likes: number; toolUsed: string | null }>
): { totalPosts: number; totalLikes: number; uniqueModels: number };

export function computeTopModels(
  posts: Array<{ toolUsed: string | null }>,
  limit?: number
): Array<{ name: string; count: number }>;
```

## Provider adapter contract

**Not applicable.** Creator Profiles is a pure read/display surface over existing persisted data; it does not call any AI provider. It reuses `lib/db.ts` Prisma client directly from the RSC page.

## Acceptance criteria

1. Visiting `/u/neoncreator` (showcase creator `NeonCreator`) renders a profile page with header, stats, top models, and a grid of that creator's showcase items.
2. Visiting `/u/<slug-of-real-user-name>` for a seeded DB user renders their real `Post` rows ordered by `createdAt desc`, and the stats row reflects true counts from Prisma.
3. Visiting `/u/this-user-does-not-exist` returns a 404 (Next.js `notFound()`).
4. The profile grid reuses `PostCard` and keeps brand styling (`bg-[#181828]` tile, `border-white/15`, purple hover glow, `#FE2C55` heart-red on like).
5. Stats row shows exactly four stats: total posts, sum of likes, distinct `toolUsed` count, join date (ISO-day from `User.createdAt`; showcase users show a static "Featured creator" badge instead of a date).
6. Top Models component shows up to 6 chips derived from distinct `Post.toolUsed` values, sorted by post count descending; hidden entirely if the creator has zero posts with `toolUsed`.
7. Empty state renders when creator has 0 posts and includes two CTAs: "Browse community" -> `/community` and "Start creating" -> `/create`.
8. Each `PostCard` in the grid links to `/community/[id]` for real posts, and to the showcase media URL in a new tab (`target="_blank"`, `rel="noopener noreferrer"`) for showcase-only creators.
9. `components/community/post-card.tsx` gains a wrapping `<Link href="/u/{username}">` on the creator name line (using `encodeURIComponent`), so clicking the creator name on any existing community card navigates to that profile. The link is a sibling/inline element, not a nested `<a>` inside the existing tile link.
10. `app/community/[id]/page.tsx` shows "By <Name>" as a clickable link to the creator profile (same username rule).
11. `app/account/page.tsx` gains a "View public profile" link pointing at the signed-in user's derived username.
12. `metadata` on the profile route sets `title = "<Name> on memacta"` and `description` drawn from the creator's bio fallback ("<N> creations on memacta").
13. `npm run build` succeeds and `/u/[username]` appears in the build output (dynamic `ƒ`, since usernames are unbounded and DB-backed).
14. Design tokens: all colors on the new page come from `bg-brand-gradient`, `#181828`, `#111122`, `#0a0a16`, `#FE2C55`, `text-white/70`, `border-white/15`. No Higgsfield-neutral greys, no Tailwind default `slate/zinc`.
15. Sidebar `QUICK_LINKS` in `components/sidebar.tsx` is not modified (profiles are surfaced through community cards, not a top-level link — keeps sidebar uncluttered), **but** the user menu in `components/nav.tsx` must include a "My profile" entry linking to the signed-in user's profile when authenticated.

## Test cases

### Vitest unit (`tests/unit/profile.test.ts`)

```ts
import { describe, it, expect } from "vitest";
import { userToUsername, matchUsernameToUser } from "@/lib/profile";

describe("userToUsername", () => {
  it("slugifies display names (spaces -> hyphens, lowercased)", () => {
    expect(userToUsername({ id: "abc123", name: "Neon Creator" })).toBe("neon-creator");
  });
  it("strips non-alphanumerics", () => {
    expect(userToUsername({ id: "abc123", name: "A.I. Artist!" })).toBe("ai-artist");
  });
  it("falls back to id prefix when name is null", () => {
    expect(userToUsername({ id: "abcdef123456", name: null })).toBe("user-abcdef");
  });
  it("collapses repeated hyphens", () => {
    expect(userToUsername({ id: "x", name: "Foo   Bar --- Baz" })).toBe("foo-bar-baz");
  });
});

describe("matchUsernameToUser", () => {
  const users = [
    { id: "u1", name: "Neon Creator" },
    { id: "u2abcdef", name: "Neon Creator" }, // collision
    { id: "u3", name: "Ocean Lens" },
  ];
  it("returns a single unambiguous match by slug", () => {
    expect(matchUsernameToUser("ocean-lens", users)?.id).toBe("u3");
  });
  it("returns null for unknown username", () => {
    expect(matchUsernameToUser("nobody", users)).toBeNull();
  });
  it("disambiguates collisions with -<id-prefix> suffix", () => {
    const match = matchUsernameToUser("neon-creator-u2abcd", users);
    expect(match?.id).toBe("u2abcdef");
  });
});
```

### Vitest unit (`tests/unit/profile-stats.test.ts`)

```ts
import { describe, it, expect } from "vitest";
import { computeProfileStats, computeTopModels } from "@/lib/profile";

const posts = [
  { likes: 10, toolUsed: "Sora 2" },
  { likes: 20, toolUsed: "Sora 2" },
  { likes: 5,  toolUsed: "Kling 3.0" },
  { likes: 0,  toolUsed: null },
];

it("computeProfileStats sums likes, counts posts & unique tools", () => {
  const s = computeProfileStats(posts);
  expect(s.totalPosts).toBe(4);
  expect(s.totalLikes).toBe(35);
  expect(s.uniqueModels).toBe(2);
});

it("computeTopModels returns descending-ranked chips, nulls excluded", () => {
  const top = computeTopModels(posts);
  expect(top).toEqual([
    { name: "Sora 2", count: 2 },
    { name: "Kling 3.0", count: 1 },
  ]);
});
```

### Playwright E2E happy path (`tests/e2e/creator-profiles.spec.ts`)

```ts
import { test, expect } from "@playwright/test";

test("showcase creator profile renders header + grid", async ({ page }) => {
  await page.goto("/u/neoncreator");
  await expect(page.getByRole("heading", { level: 1, name: /NeonCreator/i })).toBeVisible();
  await expect(page.getByTestId("profile-stats")).toBeVisible();
  // At least one PostCard tile is rendered in the grid
  await expect(page.locator('[data-testid="profile-grid"] a').first()).toBeVisible();
});

test("community card creator-name links to profile", async ({ page }) => {
  await page.goto("/community");
  const firstCard = page.locator('[data-testid="post-card"]').first();
  const creatorLink = firstCard.locator('a[href^="/u/"]');
  await expect(creatorLink).toBeVisible();
  await creatorLink.click();
  await expect(page).toHaveURL(/\/u\/[a-z0-9-]+/);
  await expect(page.getByTestId("profile-header")).toBeVisible();
});

test("unknown username returns 404", async ({ page }) => {
  const res = await page.goto("/u/definitely-not-a-real-user-xyz");
  expect(res?.status()).toBe(404);
});

test("community post detail links creator name to profile", async ({ page }) => {
  await page.goto("/community");
  const firstCard = page.locator('[data-testid="post-card"]').first();
  const tileLink = firstCard.locator('a').first();
  await tileLink.click();
  // On post detail page
  await expect(page.getByText(/^By /i)).toBeVisible();
  const profileLink = page.locator('a[href^="/u/"]').first();
  await expect(profileLink).toBeVisible();
});

test("account page shows 'View public profile' link when signed in", async ({ page }) => {
  // Assumes test harness signs in via storageState or seeded credentials.
  await page.goto("/account");
  const profileLink = page.getByRole("link", { name: /view public profile/i });
  await expect(profileLink).toBeVisible();
  await expect(profileLink).toHaveAttribute("href", /\/u\//);
});
```

### Data-testid contract (add to components)

| testid | Component |
|---|---|
| `profile-header` | `profile-header.tsx` root |
| `profile-stats` | `profile-stats.tsx` root |
| `profile-top-models` | `profile-top-models.tsx` root |
| `profile-grid` | `profile-grid.tsx` root |
| `profile-empty` | `profile-empty.tsx` root |
| `post-card` | `post-card.tsx` root (add if missing — tested above) |

## Implementation notes for the builder

- Add `data-testid="post-card"` to the existing `post-card.tsx` root div (one-line tweak; does not alter behavior).
- When deriving the signed-in user's username on `/account`, reuse `userToUsername` with session's `user.id` + `user.name`.
- `profile-header.tsx` avatar: if `User.image` present render it, else render a square gradient block with the first 2 uppercase initials (reuse `bg-brand-gradient`).
- Profile grid should cap at 48 posts with a "Load more" affordance. Prefer server pagination via `?page=N` searchParam (no new API surface needed).
- Do **not** add a new Prisma migration. Do **not** touch Stripe. Do **not** add `username` as a column — it is always derived.
- Showcase fallback: when no DB user matches the slug, look up `SHOWCASE_ITEMS` with `userToUsername({ id: item.creator, name: item.creator })` equality — if any match, render a synthesized profile whose "posts" are those showcase items (map `SHOWCASE_ITEMS` -> `PostCardData`), stats derived from that list, `createdAt` replaced with a "Featured creator" badge.
- Custom 404: `app/u/[username]/not-found.tsx` should say "Creator not found" with a link back to `/community`, styled with the same brand gradient headline as other error pages.

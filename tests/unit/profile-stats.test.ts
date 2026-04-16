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

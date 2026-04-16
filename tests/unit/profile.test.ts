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

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

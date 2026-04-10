import { test, expect } from "@playwright/test";

test.describe("Homepage showcase content", () => {
  test("hero reel is visible with at least 5 media items", async ({ page }) => {
    await page.goto("/");
    const heroReel = page.locator("[data-testid='hero-reel']");
    await expect(heroReel).toBeVisible();

    const mediaItems = heroReel.locator("video, img");
    const count = await mediaItems.count();
    expect(count).toBeGreaterThanOrEqual(5);
  });

  test("Start Creating CTA is present and links to /create", async ({ page }) => {
    await page.goto("/");
    const cta = page.locator("[data-testid='cta-start-creating']");
    await expect(cta).toBeVisible();
    await expect(cta).toHaveAttribute("href", "/create");
  });

  test("tool categories section shows 6 cards", async ({ page }) => {
    await page.goto("/");
    const toolCategories = page.locator("[data-testid='tool-categories']");
    await expect(toolCategories).toBeVisible();

    const cards = page.locator("[data-testid='tool-category-card']");
    await expect(cards).toHaveCount(6);
  });

  test("trending section shows showcase cards", async ({ page }) => {
    await page.goto("/");
    const showcaseCards = page.locator("[data-testid='showcase-card']");
    const count = await showcaseCards.count();
    expect(count).toBeGreaterThanOrEqual(6);
  });
});

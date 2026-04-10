import { test, expect } from "@playwright/test";

test.describe("Community page", () => {
  test("shows post cards or featured showcase content", async ({ page }) => {
    await page.goto("/community");
    await expect(page.getByRole("heading", { name: "Community" })).toBeVisible();
    // The page should show either seed data posts or featured showcase cards
    // At minimum there should be some visible content cards
    const cards = page.locator(".rounded-xl.border");
    const count = await cards.count();
    expect(count).toBeGreaterThanOrEqual(1);
  });

  test("submit form works", async ({ page }) => {
    await page.goto("/community/submit");
    await expect(page.getByRole("heading", { name: "Submit Your Creation" })).toBeVisible();

    await page.fill("#title", "Test Creation");
    await page.fill("#mediaUrl", "https://example.com/test.png");
    await page.click("button[type=submit]");

    // Should show success or redirect
    await expect(
      page.getByText("Submitted successfully!").or(page.getByRole("heading", { name: "Community" }))
    ).toBeVisible({ timeout: 5000 });
  });

  test("contests page shows contest cards", async ({ page }) => {
    await page.goto("/community/contests");
    await expect(page.getByRole("heading", { name: "Creative Challenges" })).toBeVisible();
    const contestCards = page.locator("[data-testid='contest-card']");
    await expect(contestCards).toHaveCount(3);
  });
});

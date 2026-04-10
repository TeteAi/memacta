import { test, expect } from "@playwright/test";

test.describe("Blog page", () => {
  test("shows 3 blog cards", async ({ page }) => {
    await page.goto("/blog");
    await expect(page.getByRole("heading", { name: "Blog" })).toBeVisible();
    const cards = page.locator("[data-testid='blog-card']");
    await expect(cards).toHaveCount(3);
  });

  test("clicking first card navigates to blog post", async ({ page }) => {
    await page.goto("/blog");
    const firstCard = page.locator("[data-testid='blog-card']").first();
    await expect(firstCard).toBeVisible();
    await firstCard.click({ force: true });
    await page.waitForURL(/\/blog\/welcome-to-memacta/, { timeout: 10000 });
    await expect(page.getByText("Coming soon")).toBeVisible();
  });
});

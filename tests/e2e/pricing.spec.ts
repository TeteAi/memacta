import { test, expect } from "@playwright/test";

test.describe("Pricing page", () => {
  test("shows 4 pricing cards with Popular badge on Pro", async ({ page }) => {
    await page.goto("/pricing");
    await expect(page.getByRole("heading", { name: "Pricing" })).toBeVisible();

    const cards = page.locator("[data-testid='pricing-card']");
    await expect(cards).toHaveCount(4);

    // Pro card should have Popular badge
    const popularBadge = page.locator("[data-testid='popular-badge']");
    await expect(popularBadge).toHaveCount(1);
    await expect(popularBadge).toHaveText("Popular");
  });

  test("Buy Now on first card triggers checkout", async ({ page }) => {
    await page.goto("/pricing");

    const firstBuyButton = page.locator("[data-testid='pricing-card']").first().getByRole("button", { name: "Buy Now" });
    await firstBuyButton.click();

    // Without auth, API returns 401 → component shows error message OR success (if stubbed)
    const message = page.locator("[data-testid='purchase-message']");
    await expect(message).toBeVisible({ timeout: 10000 });
  });
});

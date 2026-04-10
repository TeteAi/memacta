import { test, expect } from "@playwright/test";

test("effects page shows at least 20 cards and navigates to detail", async ({ page }) => {
  await page.goto("/effects");
  await expect(page.getByRole("heading", { level: 1, name: "Effects" })).toBeVisible();
  const cards = page.locator('[data-testid^="effect-card-"]');
  expect(await cards.count()).toBeGreaterThanOrEqual(20);

  const first = cards.first();
  const name = (await first.locator("h3").textContent())?.trim() ?? "";
  await first.click();
  await expect(page).toHaveURL(/\/effects\/[a-z0-9-]+$/);
  await expect(page.locator("h1")).toHaveText(name);
});

test("effects Templates filter narrows the list", async ({ page }) => {
  await page.goto("/effects");
  const total = await page.locator('[data-testid^="effect-card-"]').count();
  await page.getByTestId("filter-template").click();
  const filtered = await page.locator('[data-testid^="effect-card-"]').count();
  expect(filtered).toBeLessThan(total);
  expect(filtered).toBeGreaterThan(0);
});

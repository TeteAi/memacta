import { test, expect } from "@playwright/test";

test("tools index includes editing category with at least 33 cards", async ({ page }) => {
  await page.goto("/tools");
  const cards = page.locator('[data-testid^="tool-card-"]');
  const count = await cards.count();
  expect(count).toBeGreaterThanOrEqual(33);
  await expect(page.getByTestId("tool-card-upscale")).toBeVisible();
  await expect(page.getByTestId("tool-card-inpaint")).toBeVisible();
  await expect(page.getByText("Category: Editing")).toBeVisible();
});

test("upscale tool page renders", async ({ page }) => {
  await page.goto("/tools/upscale");
  await expect(page.locator("h1")).toHaveText("Upscale");
  await expect(page.getByTestId("generate-button")).toBeVisible();
});

test("inpaint tool page renders", async ({ page }) => {
  await page.goto("/tools/inpaint");
  await expect(page.locator("h1")).toHaveText("Inpaint");
  await expect(page.getByTestId("generate-button")).toBeVisible();
});

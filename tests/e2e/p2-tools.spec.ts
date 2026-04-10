import { test, expect } from "@playwright/test";

test("tools index shows 9 distinct tool cards with expected names", async ({ page }) => {
  await page.goto("/tools");
  const cards = page.locator('[data-testid^="tool-card-"]');
  expect(await cards.count()).toBeGreaterThanOrEqual(9);
  await expect(page.getByText("Face Swap", { exact: true })).toBeVisible();
  await expect(page.getByText("Soul ID", { exact: true })).toBeVisible();
  await expect(page.getByText("Outfit Swap", { exact: true })).toBeVisible();
});

test("tool slug page renders h1 and Generate button", async ({ page }) => {
  await page.goto("/tools/face-swap");
  await expect(page.locator("h1")).toHaveText("Face Swap");
  await expect(page.getByTestId("generate-button")).toBeVisible();
});

test("unknown tool slug returns 404", async ({ page }) => {
  const res = await page.request.get("/tools/does-not-exist");
  expect(res.status()).toBe(404);
});

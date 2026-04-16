import { test, expect } from "@playwright/test";

test("models index shows 18 model cards split video/image", async ({ page }) => {
  await page.goto("/models");
  await expect(page.getByRole("heading", { name: /Video Models/i })).toBeVisible();
  await expect(page.getByRole("heading", { name: /Image Models/i })).toBeVisible();
  const cards = page.locator('[data-testid^="model-card-"]');
  await expect(cards).toHaveCount(18);
});

test("Sora 2 intro page renders and Try CTA preselects the model", async ({ page }) => {
  await page.goto("/models/sora-2");
  await expect(page.locator("h1")).toHaveText(/Sora 2/);
  await expect(page.getByText(/fal-ai\/sora-2\/text-to-video/)).toBeVisible();

  const tryCta = page.getByRole("link", { name: /Try Sora 2/i });
  await expect(tryCta).toHaveAttribute("href", "/create/video?model=sora-2");
  await tryCta.click();

  await expect(page).toHaveURL(/\/create\/video\?model=sora-2/);
  const picker = page.locator("select").first();
  await expect(picker).toHaveValue("sora-2");
});

test("Sample prompt link preselects model and seeds the prompt textarea", async ({ page }) => {
  await page.goto("/models/kling-3");
  const firstTryPrompt = page.getByRole("link", { name: /Try this prompt/i }).first();
  await firstTryPrompt.click();
  await expect(page).toHaveURL(/\/create\/video\?model=kling-3&prompt=/);
  const textarea = page.locator("textarea").first();
  await expect(textarea).not.toHaveValue("");
});

test("unknown model slug returns 404", async ({ page }) => {
  const res = await page.goto("/models/does-not-exist");
  expect(res?.status()).toBe(404);
});

test("sidebar Models quick link is present and active on /models", async ({ page }) => {
  await page.goto("/models");
  const link = page.getByRole("link", { name: "Models" }).first();
  await expect(link).toBeVisible();
  await expect(link).toHaveAttribute("href", "/models");
});

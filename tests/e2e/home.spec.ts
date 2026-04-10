import { test, expect } from "@playwright/test";

test("home page shows memacta", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("main").getByRole("heading", { name: "memacta" })).toBeVisible();
});

test("home page title is memacta", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveTitle("memacta");
});

test("home page uses dark background", async ({ page }) => {
  await page.goto("/");
  const bg = await page.evaluate(
    () => getComputedStyle(document.body).backgroundColor,
  );
  const m = bg.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
  expect(m).not.toBeNull();
  const [r, g, b] = [Number(m![1]), Number(m![2]), Number(m![3])];
  expect(r).toBeLessThan(40);
  expect(g).toBeLessThan(40);
  expect(b).toBeLessThan(40);
});

test("memacta text is horizontally centered", async ({ page }) => {
  await page.goto("/");
  const main = page.locator("main");
  await expect(main).toBeVisible();
  const hero = main.getByRole("heading", { name: "memacta" });
  await expect(hero).toBeVisible();
  const heroBox = await hero.boundingBox();
  const mainBox = await main.boundingBox();
  expect(heroBox).not.toBeNull();
  expect(mainBox).not.toBeNull();
  const heroCx = heroBox!.x + heroBox!.width / 2;
  const mainCx = mainBox!.x + mainBox!.width / 2;
  expect(Math.abs(heroCx - mainCx)).toBeLessThanOrEqual(5);
});

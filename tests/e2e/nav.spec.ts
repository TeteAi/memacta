import { test, expect } from "@playwright/test";

test("nav shell renders and navigates between pages", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("banner").getByRole("link", { name: "memacta" })).toBeVisible();
  for (const label of ["Home", "Create", "Effects", "Studio", "Chat", "Library", "Community", "Pricing"]) {
    await expect(page.getByRole("banner").getByRole("link", { name: label })).toBeVisible();
  }

  const navigateTo = async (
    linkName: string,
    urlPattern: RegExp | string,
    headingName: string,
  ) => {
    await page.waitForLoadState("domcontentloaded");
    const link = page.getByRole("banner").getByRole("link", { name: linkName, exact: true });
    await expect(link).toBeVisible();
    await link.click();
    if (typeof urlPattern === "string") {
      await expect(page).toHaveURL(urlPattern, { timeout: 10000 });
    } else {
      await expect(page).toHaveURL(urlPattern, { timeout: 10000 });
    }
    await expect(page.getByRole("heading", { level: 1, name: headingName })).toBeVisible();
  };

  await navigateTo("Studio", /\/studio$/, "Cinema Studio");
  await page.goto("/");
  await expect(page.getByRole("button", { name: "Sign In" })).toBeVisible();

  await navigateTo("Create", /\/create$/, "Create");
  await navigateTo("Effects", /\/effects$/, "Effects");
  await navigateTo("Chat", /\/chat$/, "Chat");
  await navigateTo("Library", /\/library$/, "My Library");
  await navigateTo("Community", /\/community$/, "Community");
  await navigateTo("Pricing", /\/pricing$/, "Pricing");

  await page.waitForLoadState("domcontentloaded");
  await page.getByRole("banner").getByRole("link", { name: "memacta" }).click();
  await expect(page).toHaveURL("http://localhost:3000/", { timeout: 10000 });
  await expect(page.getByRole("heading", { level: 1, name: "memacta" })).toBeVisible();
});

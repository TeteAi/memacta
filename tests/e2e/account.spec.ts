import { test, expect } from "@playwright/test";

test.describe("Account page", () => {
  test("shows sign in prompt without auth", async ({ page }) => {
    await page.goto("/account");
    await expect(page.getByText("Sign in to view your account")).toBeVisible();
    await expect(page.getByRole("main").getByRole("link", { name: "Sign In" })).toBeVisible();
  });
});

import { test, expect } from "@playwright/test";

test.describe("Legal and info pages", () => {
  test("About page has correct heading", async ({ page }) => {
    await page.goto("/about");
    await expect(page.getByRole("heading", { name: "About memacta" })).toBeVisible();
  });

  test("Privacy Policy page has correct heading", async ({ page }) => {
    await page.goto("/privacy");
    await expect(page.getByRole("heading", { name: "Privacy Policy" })).toBeVisible();
  });

  test("Terms of Service page has correct heading", async ({ page }) => {
    await page.goto("/terms");
    await expect(page.getByRole("heading", { name: "Terms of Service" })).toBeVisible();
  });

  test("Contact page form submits successfully", async ({ page }) => {
    await page.goto("/contact");
    await expect(page.getByRole("heading", { name: "Contact Us" })).toBeVisible();

    await page.fill("#name", "Test User");
    await page.fill("#email", "test@example.com");
    await page.fill("#message", "Hello, this is a test message.");
    await page.click("button[type=submit]");

    await expect(page.locator("[data-testid='contact-success']")).toBeVisible({ timeout: 5000 });
  });
});

import { test, expect } from "@playwright/test";

test("create video page generates a result", async ({ page }) => {
  await page.goto("/create/video");
  await expect(page.getByRole("heading", { level: 1, name: "Create Video" })).toBeVisible();
  await page.getByPlaceholder("Describe your scene...").fill("a running cat");
  await page.getByRole("button", { name: "Generate" }).click();
  const result = page.getByTestId("result");
  await expect(result.locator("video, img")).toHaveAttribute("src", /.+/, { timeout: 15000 });
});

test("create image page generates an image", async ({ page }) => {
  await page.goto("/create/image");
  await expect(page.getByRole("heading", { level: 1, name: "Create Image" })).toBeVisible();
  await page.getByPlaceholder("Describe your scene...").fill("a running cat");
  await page.getByRole("button", { name: "Generate" }).click();
  const result = page.getByTestId("result");
  await expect(result.locator("img")).toHaveAttribute("src", /.+/, { timeout: 15000 });
});

test("chat page shows assistant reply containing memacta", async ({ page }) => {
  await page.goto("/chat");
  await expect(page.getByRole("heading", { level: 1, name: "Chat" })).toBeVisible();
  await page.getByPlaceholder("Type a message...").fill("hello");
  await page.getByRole("button", { name: "Send" }).click();
  await expect(page.getByRole("main").getByText(/memacta/i)).toBeVisible({ timeout: 10000 });
});

import { test, expect } from "@playwright/test";

test("studio page lets user add clip and save project", async ({ page }) => {
  await page.goto("/studio");
  await expect(page.getByRole("heading", { level: 1, name: "Cinema Studio" })).toBeVisible();

  await page.getByLabel("Project name").fill("Test Project");
  await page.getByLabel("Clip prompt").fill("a dog");
  await page.getByRole("button", { name: "Add Clip" }).click();

  await expect(page.getByText("a dog")).toBeVisible();

  await page.getByRole("button", { name: "Save Project" }).click();
  await expect
    .poll(async () => {
      const url = page.url();
      const saved = await page.getByTestId("save-indicator").count();
      return url.includes("/studio/") || saved > 0;
    })
    .toBeTruthy();
});

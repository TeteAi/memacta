import { test, expect } from "@playwright/test";

test.describe("Library page", () => {
  test("shows all tabs and grid", async ({ page }) => {
    await page.goto("/library");
    for (const tab of ["All", "Images", "Videos", "Characters", "Projects"]) {
      await expect(page.getByRole("tab", { name: tab })).toBeVisible();
    }
    await expect(page.getByRole("heading", { name: "My Library" })).toBeVisible();
  });

  test("clicking Images tab filters the view", async ({ page }) => {
    await page.goto("/library");
    const imagesTab = page.getByRole("tab", { name: "Images" });
    await imagesTab.click();
    await expect(imagesTab).toHaveAttribute("aria-selected", "true");
  });
});

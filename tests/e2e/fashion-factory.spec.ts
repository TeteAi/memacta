import { test, expect } from "@playwright/test";

const PERSON_URL =
  "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a7/Camponotus_flavomarginatus_ant.jpg/400px-Camponotus_flavomarginatus_ant.jpg";
const OUTFIT_URL_1 =
  "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3f/Bikesgray.jpg/400px-Bikesgray.jpg";
const OUTFIT_URL_2 =
  "https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/PNG_transparency_demonstration_1.png/280px-PNG_transparency_demonstration_1.png";

test.describe("Fashion Factory", () => {
  test("page renders with correct heading", async ({ page }) => {
    await page.goto("/tools/fashion-factory");
    await expect(page.locator("h1")).toContainText("Fashion Factory");
    await expect(page.getByTestId("fashion-factory")).toBeVisible();
  });

  test("generate button is disabled until person + outfit provided", async ({ page }) => {
    await page.goto("/tools/fashion-factory");

    const btn = page.getByTestId("generate-lookbook-btn");
    await expect(btn).toBeDisabled();

    // Fill person URL
    const personDropzone = page.getByTestId("person-dropzone");
    await personDropzone.getByText("Or paste image URL").click();
    await page.getByPlaceholder("https://example.com/photo.jpg").fill(PERSON_URL);
    await page.getByPlaceholder("https://example.com/photo.jpg").press("Enter");

    // Still disabled without an outfit
    await expect(btn).toBeDisabled();
  });

  test("sidebar Identity section has Fashion Factory link", async ({ page }) => {
    await page.goto("/tools/fashion-factory");
    // On the fashion-factory page, the Identity section should be open (active child)
    // Find the Fashion Factory link in the sidebar
    const fashionLink = page.locator('aside a[href="/tools/fashion-factory"]').first();
    await expect(fashionLink).toBeVisible({ timeout: 10000 });
  });

  test("Fashion Factory appears on /apps page", async ({ page }) => {
    await page.goto("/apps");
    // The /apps page renders Link elements, not data-testid cards — find by text
    const fashionCard = page.locator('a[href="/tools/fashion-factory"]').filter({ hasText: "Fashion Factory" });
    await expect(fashionCard.first()).toBeVisible({ timeout: 10000 });
  });

  test("lookbook grid renders tiles after generation (mocked)", async ({ page }) => {
    // Intercept the generate API to return a mock URL
    await page.route("/api/generate", async (route) => {
      const body = JSON.parse(route.request().postData() ?? "{}");
      if (body.model === "flux-kontext") {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            url: "https://v3.fal.media/files/mock-lookbook.png",
            creditsRemaining: 45,
          }),
        });
      } else {
        await route.continue();
      }
    });

    await page.goto("/tools/fashion-factory");

    // Set person URL
    await page.getByText("Or paste image URL").click();
    await page.getByPlaceholder("https://example.com/photo.jpg").fill(PERSON_URL);
    await page.keyboard.press("Enter");

    // Wait a tick for state to update
    await page.waitForTimeout(100);

    // Fill outfit slot 0 via right-click dialog (use evaluate to simulate)
    // Instead, simulate URL input on outfit slot by directly calling onUpdate
    // We'll use the prompt dialog intercept approach:
    page.on("dialog", async (dialog) => {
      await dialog.accept(OUTFIT_URL_1);
    });
    await page.getByTestId("outfit-slot-0").click({ button: "right" });

    await page.waitForTimeout(100);

    // Now generate should be enabled
    const btn = page.getByTestId("generate-lookbook-btn");
    await expect(btn).toBeEnabled({ timeout: 5000 });

    await btn.click();

    // Wait for lookbook grid
    await expect(page.getByTestId("lookbook-grid")).toBeVisible({ timeout: 15000 });

    // Wait for tile to succeed
    await expect(
      page.getByTestId("lookbook-tile-0").filter({ hasText: "" })
    ).toHaveAttribute("data-status", "succeeded", { timeout: 15000 });
  });

  test("partial failure: failed tile shows retry button", async ({ page }) => {
    let callCount = 0;
    await page.route("/api/generate", async (route) => {
      callCount++;
      if (callCount === 1) {
        // First call: succeed
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({ url: "https://v3.fal.media/files/ok.png" }),
        });
      } else {
        // Subsequent calls: fail
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({ error: "Generation failed" }),
        });
      }
    });

    await page.goto("/tools/fashion-factory");

    // Person
    await page.getByText("Or paste image URL").click();
    await page.getByPlaceholder("https://example.com/photo.jpg").fill(PERSON_URL);
    await page.keyboard.press("Enter");
    await page.waitForTimeout(100);

    // Two outfits via right-click dialog
    let dialogCallCount = 0;
    const outfitUrls = [OUTFIT_URL_1, OUTFIT_URL_2];
    page.on("dialog", async (dialog) => {
      await dialog.accept(outfitUrls[dialogCallCount++ % 2]);
    });
    await page.getByTestId("outfit-slot-0").click({ button: "right" });
    await page.waitForTimeout(100);
    await page.getByTestId("outfit-slot-1").click({ button: "right" });
    await page.waitForTimeout(100);

    const btn = page.getByTestId("generate-lookbook-btn");
    await expect(btn).toBeEnabled({ timeout: 5000 });
    await btn.click();

    // Tile 0 should succeed, tile 1 should fail
    await expect(page.getByTestId("lookbook-tile-0")).toHaveAttribute("data-status", "succeeded", { timeout: 15000 });
    await expect(page.getByTestId("lookbook-tile-1")).toHaveAttribute("data-status", "failed", { timeout: 15000 });

    // Retry button visible on tile 1
    await expect(page.getByTestId("retry-1")).toBeVisible();
  });

  // Environment-gated real fal.ai test — skip when FAL_KEY is absent
  test("real fal.ai round-trip", async ({ page }) => {
    test.skip(!process.env.FAL_KEY, "Real fal.ai round-trip — requires FAL_KEY");
    await page.goto("/tools/fashion-factory");

    await page.getByText("Or paste image URL").click();
    await page.getByPlaceholder("https://example.com/photo.jpg").fill(PERSON_URL);
    await page.keyboard.press("Enter");
    await page.waitForTimeout(200);

    page.on("dialog", async (dialog) => {
      await dialog.accept(OUTFIT_URL_1);
    });
    await page.getByTestId("outfit-slot-0").click({ button: "right" });
    await page.waitForTimeout(200);

    await page.getByTestId("generate-lookbook-btn").click();

    await expect(page.getByTestId("lookbook-tile-0")).toHaveAttribute(
      "data-status",
      "succeeded",
      { timeout: 60000 }
    );

    const tile = page.getByTestId("lookbook-tile-0");
    const img = tile.locator("img");
    const src = await img.getAttribute("src");
    expect(src).toMatch(/cdn\.fal\.ai|v3\.fal\.media/);
  });
});

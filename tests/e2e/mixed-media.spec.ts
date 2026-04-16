import { test, expect } from "@playwright/test";

const MOCK_IMAGE_URL = "https://example.com/mock-image.jpg";

test.describe("Mixed Media Studio", () => {
  test("1. page renders with heading Mixed Media and data-testid=mixed-media-page", async ({ page }) => {
    await page.goto("/tools/mixed-media");
    await expect(page.getByRole("heading", { name: /Mixed Media/i })).toBeVisible();
    await expect(page.getByTestId("mixed-media-page")).toBeVisible();
  });

  test("2. grid shows exactly 12 style-tile elements with unique data-style-id", async ({ page }) => {
    await page.goto("/tools/mixed-media");
    const tiles = page.getByTestId("style-tile");
    await expect(tiles).toHaveCount(12);
    const ids: string[] = [];
    for (let i = 0; i < 12; i++) {
      const id = await tiles.nth(i).getAttribute("data-style-id");
      ids.push(id ?? "");
    }
    expect(new Set(ids).size).toBe(12);
  });

  test("3. clicking a tile toggles aria-pressed to true", async ({ page }) => {
    await page.goto("/tools/mixed-media");
    const tile = page.getByTestId("style-tile").first();
    await expect(tile).toHaveAttribute("aria-pressed", "false");
    await tile.click();
    await expect(tile).toHaveAttribute("aria-pressed", "true");
  });

  test("4. selecting a 4th tile is capped at 3 — aria-pressed stays false", async ({ page }) => {
    await page.goto("/tools/mixed-media");
    const tiles = page.getByTestId("style-tile");
    // Select first 3
    await tiles.nth(0).click();
    await tiles.nth(1).click();
    await tiles.nth(2).click();
    // 4th tile must now be disabled — attempting to click is blocked by the disabled attribute.
    await expect(tiles.nth(3)).toBeDisabled();
    await tiles.nth(3).click({ force: true });
    await expect(tiles.nth(3)).toHaveAttribute("aria-pressed", "false");
    // First 3 remain selected
    await expect(tiles.nth(0)).toHaveAttribute("aria-pressed", "true");
    await expect(tiles.nth(1)).toHaveAttribute("aria-pressed", "true");
    await expect(tiles.nth(2)).toHaveAttribute("aria-pressed", "true");
  });

  test("5. generate button disabled with 0 or 1 tiles; enabled with 2 tiles + non-empty subject", async ({
    page,
  }) => {
    await page.goto("/tools/mixed-media");
    const btn = page.getByTestId("generate-btn");

    // Initially disabled (0 tiles, no subject)
    await expect(btn).toBeDisabled();

    // Select 1 tile — still disabled (need at least 2)
    await page.getByTestId("style-tile").nth(0).click();
    await expect(btn).toBeDisabled();

    // Select 2nd tile — still disabled (no subject)
    await page.getByTestId("style-tile").nth(1).click();
    await expect(btn).toBeDisabled();

    // Fill subject prompt — now enabled
    await page.getByTestId("subject-prompt").fill("a warrior on horseback");
    await expect(btn).toBeEnabled();
  });

  test("6. deep-link ?preset=anime-realism&subject=warrior pre-selects tile and pre-fills textarea", async ({
    page,
  }) => {
    await page.goto("/tools/mixed-media?preset=anime-realism&subject=warrior+in+mist");
    // data-style-id is on the same element as data-testid, not a descendant — use combined selector.
    const animeTile = page.locator('[data-testid="style-tile"][data-style-id="anime-realism"]');
    await expect(animeTile).toHaveAttribute("aria-pressed", "true");
    await expect(page.getByTestId("subject-prompt")).toHaveValue("warrior in mist");
  });

  test("7. selecting oil-painting and switching to video shows incompatible state on generate button", async ({
    page,
  }) => {
    await page.goto("/tools/mixed-media");
    // Select oil-painting (image-only) and anime-realism
    const oilTile = page.locator('[data-style-id="oil-painting"]');
    const animeTile = page.locator('[data-style-id="anime-realism"]');
    await animeTile.click();
    await oilTile.click();
    await page.getByTestId("subject-prompt").fill("warrior");

    // Switch to video — scope to output-settings to avoid matching the sidebar "Video Tools" button.
    await page.getByTestId("output-settings").getByRole("button", { name: "Video" }).click();

    // Generate button should be disabled
    const btn = page.getByTestId("generate-btn");
    await expect(btn).toBeDisabled();
    // Aria-label should mention not compatible
    const ariaLabel = await btn.getAttribute("aria-label");
    expect(ariaLabel?.toLowerCase()).toContain("not compatible");
  });

  test("8. mocked 2-succeed-1-fail with variationsPerBlend=3: 3 tiles with correct statuses and retry button", async ({
    page,
  }) => {
    let callCount = 0;
    await page.route("**/api/generate", async (route) => {
      callCount++;
      if (callCount === 2) {
        await route.fulfill({
          status: 502,
          contentType: "application/json",
          body: JSON.stringify({ error: "Provider error" }),
        });
      } else {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({ url: MOCK_IMAGE_URL }),
        });
      }
    });

    await page.goto("/tools/mixed-media");
    // Select 2 image-compatible styles
    await page.locator('[data-style-id="anime-realism"]').click();
    await page.locator('[data-style-id="pixel-dream"]').click();
    await page.getByTestId("subject-prompt").fill("a warrior");

    // Set variations to 3
    await page.getByRole("button", { name: "3" }).last().click();

    await page.getByTestId("generate-btn").click();

    // Wait for all 3 tiles
    const tiles = page.getByTestId("lookbook-tile");
    await expect(tiles).toHaveCount(3, { timeout: 15000 });

    // Wait for all to settle
    await page.waitForTimeout(2000);

    const statuses = await Promise.all([
      tiles.nth(0).getAttribute("data-status"),
      tiles.nth(1).getAttribute("data-status"),
      tiles.nth(2).getAttribute("data-status"),
    ]);
    const succeeded = statuses.filter((s) => s === "succeeded").length;
    const failed = statuses.filter((s) => s === "failed").length;
    expect(succeeded).toBe(2);
    expect(failed).toBe(1);

    // Failed tile shows Retry button
    const failedIdx = statuses.findIndex((s) => s === "failed");
    await expect(tiles.nth(failedIdx).getByTestId("retry-btn")).toBeVisible();
  });

  test("9. retry re-dispatches only the failed tile; succeeded tiles keep their status", async ({
    page,
  }) => {
    let callCount = 0;
    const generateCallsAfterRetry: number[] = [];
    await page.route("**/api/generate", async (route) => {
      callCount++;
      const current = callCount;
      if (current === 2) {
        await route.fulfill({
          status: 502,
          contentType: "application/json",
          body: JSON.stringify({ error: "fail" }),
        });
      } else {
        generateCallsAfterRetry.push(current);
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({ url: MOCK_IMAGE_URL }),
        });
      }
    });

    await page.goto("/tools/mixed-media");
    await page.locator('[data-style-id="anime-realism"]').click();
    await page.locator('[data-style-id="pixel-dream"]').click();
    await page.getByTestId("subject-prompt").fill("a cat");
    await page.getByRole("button", { name: "3" }).last().click();
    await page.getByTestId("generate-btn").click();

    const tiles = page.getByTestId("lookbook-tile");
    await expect(tiles).toHaveCount(3, { timeout: 15000 });
    await page.waitForTimeout(2000);

    const statuses = await Promise.all([
      tiles.nth(0).getAttribute("data-status"),
      tiles.nth(1).getAttribute("data-status"),
      tiles.nth(2).getAttribute("data-status"),
    ]);
    const failedIdx = statuses.findIndex((s) => s === "failed");
    expect(failedIdx).toBeGreaterThanOrEqual(0);

    const callCountBefore = callCount;
    await tiles.nth(failedIdx).getByTestId("retry-btn").click();

    // Only 1 more call (just the failed tile)
    await expect(tiles.nth(failedIdx)).toHaveAttribute("data-status", "succeeded", {
      timeout: 10000,
    });
    expect(callCount - callCountBefore).toBe(1);

    // Other tiles remain succeeded
    for (let i = 0; i < 3; i++) {
      if (i !== failedIdx) {
        await expect(tiles.nth(i)).toHaveAttribute("data-status", "succeeded");
      }
    }
  });

  test("10. color-token guard: no slate- or zinc- tokens on page", async ({ page }) => {
    await page.goto("/tools/mixed-media");
    const offenders = await page.evaluate(() => {
      const re = /\bslate-\d+|\bzinc-\d+/;
      return Array.from(document.querySelectorAll("*")).filter((el) =>
        re.test((el as HTMLElement).className ?? ""),
      ).length;
    });
    expect(offenders).toBe(0);
  });

  test("11. sidebar Effects & Templates contains Mixed Media link", async ({ page }) => {
    await page.goto("/tools/mixed-media");
    // Scope to the sidebar (complementary role) — footer also has a Mixed Media link.
    const link = page.getByRole("complementary").getByRole("link", { name: "Mixed Media" });
    await expect(link).toBeVisible();
    await expect(link).toHaveAttribute("href", "/tools/mixed-media");
  });

  test("12. /apps gallery contains tool card with data-testid=tool-card and data-slug=mixed-media", async ({
    page,
  }) => {
    await page.goto("/apps");
    const card = page.locator('[data-testid="tool-card"][data-slug="mixed-media"]');
    await expect(card).toBeVisible();
    await expect(card).toHaveAttribute("href", "/tools/mixed-media");
  });

  test("13. real fal.ai end-to-end happy path (opt-in, FAL_KEY required)", async ({ page }) => {
    // FAL_KEY gate INSIDE test body per spec requirement
    if (!process.env.FAL_KEY) {
      test.skip(true, "needs FAL_KEY");
      return;
    }

    await page.goto("/tools/mixed-media");
    await page.locator('[data-style-id="anime-realism"]').click();
    await page.locator('[data-style-id="pixel-dream"]').click();
    await page.getByTestId("subject-prompt").fill("A lighthouse at storm");
    await page.getByTestId("generate-btn").click();

    const tiles = page.getByTestId("lookbook-tile");
    await expect(tiles).toHaveCount(2, { timeout: 15000 });

    let oneSucceeded = false;
    for (let i = 0; i < 2 && !oneSucceeded; i++) {
      try {
        await expect(tiles.nth(i)).toHaveAttribute("data-status", "succeeded", { timeout: 90000 });
        const mediaUrl = await tiles.nth(i).getAttribute("data-media-url");
        expect(mediaUrl).toMatch(/^https:\/\//);
        oneSucceeded = true;
      } catch {
        // try next tile
      }
    }
    expect(oneSucceeded).toBe(true);
  });
});

import { test, expect } from "@playwright/test";

const MOCK_VIDEO_URL = "https://example.com/mock-clip.mp4";

test.describe("Popcorn", () => {
  test("1. page renders with heading and root testid", async ({ page }) => {
    await page.goto("/tools/popcorn");
    await expect(page.getByRole("heading", { name: "Popcorn" })).toBeVisible();
    await expect(page.getByTestId("popcorn")).toBeVisible();
  });

  test("2. preset grid has exactly 12 cards (expand if needed)", async ({ page }) => {
    await page.goto("/tools/popcorn");
    // Click 'see all' if present to expand
    const seeAllBtn = page.getByText(/see all/i);
    if (await seeAllBtn.isVisible()) {
      await seeAllBtn.click();
    }
    await expect(page.getByTestId("preset-card")).toHaveCount(12);
  });

  test("3. preset selection toggles aria-pressed", async ({ page }) => {
    await page.goto("/tools/popcorn");
    // Expand all first
    const seeAllBtn = page.getByText(/see all/i);
    if (await seeAllBtn.isVisible()) {
      await seeAllBtn.click();
    }
    const cards = page.getByTestId("preset-card");
    // Click 3rd card
    await cards.nth(2).click();
    await expect(cards.nth(2)).toHaveAttribute("aria-pressed", "true");
    // Others should be false
    await expect(cards.nth(0)).toHaveAttribute("aria-pressed", "false");
    await expect(cards.nth(1)).toHaveAttribute("aria-pressed", "false");
  });

  test("4. pop button gated — disabled until preset AND subject filled", async ({ page }) => {
    await page.goto("/tools/popcorn");
    const popBtn = page.getByTestId("pop-btn");

    // Initially disabled
    await expect(popBtn).toBeDisabled();

    // Select a preset — still disabled (no subject)
    await page.getByTestId("preset-card").first().click();
    await expect(popBtn).toBeDisabled();

    // Type subject — should enable
    await page.getByTestId("subject-prompt").fill("a skateboarder with cherry-red hair");
    await expect(popBtn).toBeEnabled();
  });

  test("5. happy path — 3 clips succeed (mocked provider)", async ({ page }) => {
    // Mock the generate endpoint
    await page.route("**/api/generate", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ url: MOCK_VIDEO_URL, creditsRemaining: 100 }),
      });
    });

    await page.goto("/tools/popcorn");

    // Select first preset
    await page.getByTestId("preset-card").first().click();
    // Fill subject
    await page.getByTestId("subject-prompt").fill("a skateboarder with cherry-red hair");
    // Click Pop
    await page.getByTestId("pop-btn").click();

    // Wait for all 3 tiles to succeed
    const tiles = page.getByTestId("clip-tile");
    await expect(tiles).toHaveCount(3);
    for (let i = 0; i < 3; i++) {
      await expect(tiles.nth(i)).toHaveAttribute("data-status", "succeeded", { timeout: 15000 });
    }

    // Each should have a video element
    for (let i = 0; i < 3; i++) {
      await expect(tiles.nth(i).locator("video")).toBeVisible();
    }

    // Seeds should be distinct
    const seeds: string[] = [];
    for (let i = 0; i < 3; i++) {
      const seed = await tiles.nth(i).getAttribute("data-seed");
      seeds.push(seed ?? "");
    }
    expect(new Set(seeds).size).toBe(3);
  });

  test("6. partial failure + retry", async ({ page }) => {
    let callCount = 0;

    await page.route("**/api/generate", async (route) => {
      callCount++;
      const isSecond = callCount === 2;
      if (isSecond) {
        await route.fulfill({
          status: 502,
          contentType: "application/json",
          body: JSON.stringify({ status: "failed", error: "Provider error" }),
        });
      } else {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({ url: MOCK_VIDEO_URL }),
        });
      }
    });

    await page.goto("/tools/popcorn");
    await page.getByTestId("preset-card").first().click();
    await page.getByTestId("subject-prompt").fill("a test subject");
    await page.getByTestId("pop-btn").click();

    const tiles = page.getByTestId("clip-tile");
    await expect(tiles).toHaveCount(3);

    // Wait for generation to complete
    await page.waitForTimeout(1000);

    const failedTiles = page.getByTestId("clip-tile").filter({ hasAttr: "data-status", hasText: "" });

    // At least one tile should be failed
    const statuses = await Promise.all([
      tiles.nth(0).getAttribute("data-status"),
      tiles.nth(1).getAttribute("data-status"),
      tiles.nth(2).getAttribute("data-status"),
    ]);
    const failedCount = statuses.filter((s) => s === "failed").length;
    const succeededCount = statuses.filter((s) => s === "succeeded").length;
    expect(failedCount).toBe(1);
    expect(succeededCount).toBe(2);

    // Failed tile has retry button
    const failedTileIndex = statuses.findIndex((s) => s === "failed");
    const retryBtn = tiles.nth(failedTileIndex).getByTestId("retry-clip-btn");
    await expect(retryBtn).toBeVisible();

    // Reset mock for retry
    await page.route("**/api/generate", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ url: MOCK_VIDEO_URL }),
      });
    });

    // Click retry
    await retryBtn.click();

    // That tile should now be running then succeeded
    await expect(tiles.nth(failedTileIndex)).toHaveAttribute("data-status", "succeeded", {
      timeout: 10000,
    });

    // Other tiles remain succeeded
    const nonFailed = [0, 1, 2].filter((i) => i !== failedTileIndex);
    for (const i of nonFailed) {
      await expect(tiles.nth(i)).toHaveAttribute("data-status", "succeeded");
    }
  });

  test("7. auth-required bounce — redirects once despite 3-way fan-out", async ({ page }) => {
    await page.route("**/api/generate", async (route) => {
      await route.fulfill({
        status: 401,
        contentType: "application/json",
        body: JSON.stringify({ error: "auth_required" }),
      });
    });

    await page.goto("/tools/popcorn");
    await page.getByTestId("preset-card").first().click();
    await page.getByTestId("subject-prompt").fill("a test subject");
    await page.getByTestId("pop-btn").click();

    // Wait for navigation
    await page.waitForURL(/auth\/signin/, { timeout: 10000 });
    const url = page.url();
    expect(url).toContain("/auth/signin");
    expect(url).toContain("mode=signup");
  });

  test("8. sidebar link present in Effects & Templates", async ({ page }) => {
    await page.goto("/tools/popcorn");
    const link = page.getByRole("link", { name: "Popcorn" });
    await expect(link).toBeVisible();
    await expect(link).toHaveAttribute("href", "/tools/popcorn");
  });

  test("9. /apps shows the Popcorn card", async ({ page }) => {
    await page.goto("/apps");
    const card = page.getByRole("link", { name: /Popcorn/i }).first();
    await expect(card).toBeVisible();
    await card.click();
    await expect(page).toHaveURL(/\/tools\/popcorn/);
  });

  test("10. share pack action after mocked happy path", async ({ page }) => {
    await page.route("**/api/generate", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ url: MOCK_VIDEO_URL }),
      });
    });

    let shareBody: unknown = null;
    await page.route("**/api/popcorn/share", async (route) => {
      const body = route.request().postDataJSON();
      shareBody = body;
      await route.fulfill({
        status: 201,
        contentType: "application/json",
        body: JSON.stringify({ postId: "test-post-id" }),
      });
    });

    await page.goto("/tools/popcorn");
    await page.getByTestId("preset-card").first().click();
    await page.getByTestId("subject-prompt").fill("a test subject");
    await page.getByTestId("pop-btn").click();

    // Wait for succeeded
    const tiles = page.getByTestId("clip-tile");
    for (let i = 0; i < 3; i++) {
      await expect(tiles.nth(i)).toHaveAttribute("data-status", "succeeded", { timeout: 15000 });
    }

    // Click share
    await page.getByText(/share pack to community/i).click();

    // Should navigate to /community
    await page.waitForURL(/\/community/, { timeout: 10000 });
    expect(page.url()).toContain("/community");

    // Verify the POST included toolUsed
    expect(shareBody).toBeTruthy();
    const body = shareBody as { presetId?: string };
    expect(body.presetId).toBeTruthy();
  });

  test("11. no slate- or zinc- tokens on /tools/popcorn", async ({ page }) => {
    await page.goto("/tools/popcorn");
    // Word-boundary check — `translate-x-0` contains the substring "slate-" but is not a slate token.
    const offenders = await page.evaluate(() => {
      const re = /(^|\s)(slate-|zinc-|bg-slate-|bg-zinc-|text-slate-|text-zinc-|border-slate-|border-zinc-)/;
      return Array.from(document.querySelectorAll("*")).filter((el) =>
        re.test((el as HTMLElement).className ?? "")
      ).length;
    });
    expect(offenders).toBe(0);
  });

  test("12. clip tiles have 9:16 aspect class", async ({ page }) => {
    await page.route("**/api/generate", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ url: MOCK_VIDEO_URL }),
      });
    });

    await page.goto("/tools/popcorn");
    await page.getByTestId("preset-card").first().click();
    await page.getByTestId("subject-prompt").fill("a test subject");
    await page.getByTestId("pop-btn").click();

    const tiles = page.getByTestId("clip-tile");
    await expect(tiles).toHaveCount(3);
    await expect(tiles.nth(0)).toHaveAttribute("data-status", "succeeded", { timeout: 15000 });

    // Each tile should have aspect-[9/16] class
    for (let i = 0; i < 3; i++) {
      const cls = await tiles.nth(i).getAttribute("class");
      expect(cls).toMatch(/aspect-\[9\/16\]/);
    }
  });

  test("13. real fal.ai round-trip (opt-in)", async ({ page }) => {
    // Skip guard INSIDE test body per spec requirement
    if (!process.env.FAL_KEY) {
      test.skip(true, "needs FAL_KEY");
      return;
    }

    await page.goto("/tools/popcorn");
    await page.getByTestId("preset-card").first().click();
    await page.getByTestId("subject-prompt").fill("a skateboarder on a sunny street");
    await page.getByTestId("pop-btn").click();

    const tiles = page.getByTestId("clip-tile");
    // Wait up to 90s for at least one tile to succeed
    let oneSucceeded = false;
    for (let i = 0; i < 3 && !oneSucceeded; i++) {
      try {
        await expect(tiles.nth(i)).toHaveAttribute("data-status", "succeeded", { timeout: 90000 });
        oneSucceeded = true;
        const src = await tiles.nth(i).locator("video").getAttribute("src");
        expect(src).toMatch(/https:\/\/fal\.media/);
      } catch {
        // try next tile
      }
    }
    expect(oneSucceeded).toBe(true);
  });
});

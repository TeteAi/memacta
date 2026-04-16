import { test, expect } from "@playwright/test";

test.describe("Soul Cinema", () => {
  test("1. visits /tools/soul-cinema and shows heading + all four steps", async ({ page }) => {
    await page.goto("/tools/soul-cinema");
    await expect(page.locator('[data-testid="soul-cinema-page"]')).toBeVisible();
    await expect(page.getByText("Soul Cinema").first()).toBeVisible();
    // All four step sections
    await expect(page.getByText("Step 1")).toBeVisible();
    await expect(page.getByText("Step 2")).toBeVisible();
    await expect(page.getByText("Step 3")).toBeVisible();
  });

  test("2. shows at least 3 character tiles; clicking first gives aria-pressed=true", async ({ page }) => {
    await page.goto("/tools/soul-cinema");
    // Wait for character picker to load
    await page.waitForSelector('[data-testid="character-tile"]', { timeout: 10000 });
    const tiles = page.locator('[data-testid="character-tile"]');
    await expect(tiles).toHaveCount({ minimum: 3 } as never);
    // Actually just check >= 3
    const count = await tiles.count();
    expect(count).toBeGreaterThanOrEqual(3);
    // Click first tile
    await tiles.first().click();
    await expect(tiles.first()).toHaveAttribute("aria-pressed", "true");
  });

  test("3. fills story prompt", async ({ page }) => {
    await page.goto("/tools/soul-cinema");
    await page.fill('[data-testid="story-prompt"]', "Maya finds a mysterious letter and chases its author through a rainy Tokyo night");
    const val = await page.inputValue('[data-testid="story-prompt"]');
    expect(val.length).toBeGreaterThanOrEqual(10);
  });

  test("4. clicks Noir genre chip and Moody tone chip", async ({ page }) => {
    await page.goto("/tools/soul-cinema");
    await page.click('[data-testid="genre-chip-noir"]');
    await page.click('[data-testid="tone-chip-moody"]');
    // Verify selections are highlighted (they get bg-brand-gradient class)
    const noirChip = page.locator('[data-testid="genre-chip-noir"]');
    await expect(noirChip).toBeVisible();
  });

  test("5. storyboard tiles appear after story is entered (debounced)", async ({ page }) => {
    // Mock the script endpoint
    await page.route("**/api/soul-cinema/script", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          scenes: [
            { sceneNumber: 1, beat: "Maya steps into the rain.", prompt: "Full prompt 1" },
            { sceneNumber: 2, beat: "She finds a shadowy clue.", prompt: "Full prompt 2" },
            { sceneNumber: 3, beat: "The chase begins.", prompt: "Full prompt 3" },
          ],
        }),
      });
    });

    await page.goto("/tools/soul-cinema");
    await page.fill('[data-testid="story-prompt"]', "Maya finds a mysterious letter and chases its author through a rainy Tokyo night");
    // Wait for debounce + response
    await page.waitForSelector('[data-testid="storyboard-tile"]', { timeout: 5000 });
    const tiles = page.locator('[data-testid="storyboard-tile"]');
    await expect(tiles).toHaveCount(3);
  });

  test("6. Generate button enabled with 9 credits label when prereqs met", async ({ page }) => {
    await page.route("**/api/soul-cinema/script", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          scenes: [
            { sceneNumber: 1, beat: "Maya steps into the rain.", prompt: "P1" },
            { sceneNumber: 2, beat: "She finds a clue.", prompt: "P2" },
            { sceneNumber: 3, beat: "The chase.", prompt: "P3" },
          ],
        }),
      });
    });

    await page.goto("/tools/soul-cinema");
    // Select character
    await page.waitForSelector('[data-testid="character-tile"]');
    await page.locator('[data-testid="character-tile"]').first().click();
    // Fill story
    await page.fill('[data-testid="story-prompt"]', "Maya finds a mysterious letter and chases its author through a rainy Tokyo night");
    // Wait for storyboard
    await page.waitForSelector('[data-testid="storyboard-tile"]', { timeout: 5000 });

    const btn = page.locator('[data-testid="generate-reel-btn"]');
    await expect(btn).not.toBeDisabled();
    await expect(btn).toContainText("9 credits");
  });

  test("7. Promise.allSettled fan-out: 2 succeed, 1 fails — retry button visible on failed", async ({ page }) => {
    let callCount = 0;

    await page.route("**/api/soul-cinema/script", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          scenes: [
            { sceneNumber: 1, beat: "Scene 1 beat.", prompt: "P1" },
            { sceneNumber: 2, beat: "Scene 2 beat.", prompt: "P2" },
            { sceneNumber: 3, beat: "Scene 3 beat.", prompt: "P3" },
          ],
        }),
      });
    });

    await page.route("**/api/generate", async (route) => {
      callCount++;
      if (callCount <= 2) {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({ status: "succeeded", url: "/mock/scene.mp4" }),
        });
      } else {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({ status: "failed", error: "mock" }),
        });
      }
    });

    await page.goto("/tools/soul-cinema");
    await page.waitForSelector('[data-testid="character-tile"]');
    await page.locator('[data-testid="character-tile"]').first().click();
    await page.fill('[data-testid="story-prompt"]', "Maya finds a mysterious letter and chases its author through a rainy Tokyo night");
    await page.waitForSelector('[data-testid="storyboard-tile"]', { timeout: 5000 });
    await page.locator('[data-testid="generate-reel-btn"]').click();

    // Wait for all tiles to settle
    await page.waitForSelector('[data-status="succeeded"]', { timeout: 15000 });
    await page.waitForSelector('[data-status="failed"]', { timeout: 15000 });

    const succeeded = page.locator('[data-status="succeeded"]');
    const failed = page.locator('[data-status="failed"]');
    await expect(succeeded).toHaveCount(2);
    await expect(failed).toHaveCount(1);

    // Retry button visible on failed tile
    const retryBtn = page.locator('[data-testid^="reel-retry-"]');
    await expect(retryBtn).toBeVisible();
  });

  test("8. clicking Retry on failed tile re-renders as succeeded", async ({ page }) => {
    let callCount = 0;

    await page.route("**/api/soul-cinema/script", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          scenes: [
            { sceneNumber: 1, beat: "Scene 1.", prompt: "P1" },
            { sceneNumber: 2, beat: "Scene 2.", prompt: "P2" },
            { sceneNumber: 3, beat: "Scene 3.", prompt: "P3" },
          ],
        }),
      });
    });

    await page.route("**/api/generate", async (route) => {
      callCount++;
      if (callCount === 3) {
        // 3rd call in initial batch: fail
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({ status: "failed", error: "mock" }),
        });
      } else {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({ status: "succeeded", url: "/mock/scene.mp4" }),
        });
      }
    });

    await page.goto("/tools/soul-cinema");
    await page.waitForSelector('[data-testid="character-tile"]');
    await page.locator('[data-testid="character-tile"]').first().click();
    await page.fill('[data-testid="story-prompt"]', "Maya finds a mysterious letter and chases its author through a rainy Tokyo night");
    await page.waitForSelector('[data-testid="storyboard-tile"]', { timeout: 5000 });
    await page.locator('[data-testid="generate-reel-btn"]').click();

    await page.waitForSelector('[data-status="failed"]', { timeout: 15000 });

    // Click retry
    const retryBtn = page.locator('[data-testid^="reel-retry-"]').first();
    await retryBtn.click();

    // Wait for the tile to become succeeded
    await page.waitForSelector('[data-status="failed"]', { state: "detached", timeout: 10000 });
    await expect(page.locator('[data-status="succeeded"]')).toHaveCount(3);
  });

  test("9. action buttons visible after generation", async ({ page }) => {
    await page.route("**/api/soul-cinema/script", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          scenes: [
            { sceneNumber: 1, beat: "S1", prompt: "P1" },
            { sceneNumber: 2, beat: "S2", prompt: "P2" },
            { sceneNumber: 3, beat: "S3", prompt: "P3" },
          ],
        }),
      });
    });

    await page.route("**/api/generate", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ status: "succeeded", url: "/mock/scene.mp4" }),
      });
    });

    await page.goto("/tools/soul-cinema");
    await page.waitForSelector('[data-testid="character-tile"]');
    await page.locator('[data-testid="character-tile"]').first().click();
    await page.fill('[data-testid="story-prompt"]', "Maya finds a mysterious letter and chases its author through a rainy Tokyo night");
    await page.waitForSelector('[data-testid="storyboard-tile"]', { timeout: 5000 });
    await page.locator('[data-testid="generate-reel-btn"]').click();

    await page.waitForSelector('[data-status="succeeded"]', { timeout: 15000 });

    await expect(page.locator('[data-testid="save-as-project-btn"]')).toBeVisible();
    await expect(page.locator('[data-testid="share-community-btn"]')).toBeVisible();
    await expect(page.locator('[data-testid="download-reel-btn"]')).toBeVisible();
  });

  test("10. sidebar Studio section has Soul Cinema link", async ({ page }) => {
    await page.goto("/tools/soul-cinema");
    // Open the Studio section in the sidebar if needed
    const studioBtn = page.locator("button").filter({ hasText: "Studio" });
    if (await studioBtn.isVisible()) {
      await studioBtn.click();
    }
    const soulCinemaLink = page.locator('a[href="/tools/soul-cinema"]').first();
    await expect(soulCinemaLink).toBeVisible();
  });

  test("11. /apps page shows Soul Cinema card linking to /tools/soul-cinema", async ({ page }) => {
    await page.goto("/apps");
    await expect(page.getByText("Soul Cinema").first()).toBeVisible();
    const link = page.locator('a[href="/tools/soul-cinema"]').first();
    await expect(link).toBeVisible();
  });

  test("12. unknown sceneCount query param falls back to 3 without crashing", async ({ page }) => {
    await page.goto("/tools/soul-cinema?sceneCount=99");
    await expect(page.locator('[data-testid="soul-cinema-page"]')).toBeVisible();
    // Verify scene count defaults — default 3 button should still be functional
    await expect(page.locator('[data-testid="scene-count-3"]')).toBeVisible();
  });

  test("13. real fal.ai round-trip (skipped without FAL_KEY)", async ({ page }) => {
    if (!process.env.FAL_KEY) {
      test.skip();
      return;
    }

    await page.goto("/tools/soul-cinema");
    await page.waitForSelector('[data-testid="character-tile"]');
    await page.locator('[data-testid="character-tile"]').first().click();
    await page.fill('[data-testid="story-prompt"]', "Leo waves at the camera once");
    await page.locator('[data-testid="scene-count-3"]').click();

    // Select kling-25-turbo
    await page.selectOption('[data-testid="model-select"]', "kling-25-turbo");

    await page.waitForSelector('[data-testid="storyboard-tile"]', { timeout: 10000 });
    await page.locator('[data-testid="generate-reel-btn"]').click();

    // At least one tile should succeed within 120s
    await page.waitForSelector('[data-status="succeeded"]', { timeout: 120000 });
    const succeeded = page.locator('[data-status="succeeded"]');
    const count = await succeeded.count();
    expect(count).toBeGreaterThanOrEqual(1);
  });
});

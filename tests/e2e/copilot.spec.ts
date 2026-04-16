import { test, expect } from "@playwright/test";

test.describe("Copilot", () => {
  test("1. page renders with heading and root testid", async ({ page }) => {
    await page.goto("/copilot");
    await expect(page.getByRole("heading", { name: "Copilot" })).toBeVisible();
    await expect(page.getByTestId("copilot")).toBeVisible();
  });

  test("2. starter grid has exactly 6 cards", async ({ page }) => {
    await page.goto("/copilot");
    await expect(page.getByTestId("starter-card")).toHaveCount(6);
  });

  test("3. starter click sends message and assistant replies with action chip", async ({ page }) => {
    await page.goto("/copilot");
    const cards = page.getByTestId("starter-card");
    await cards.first().click();
    await expect(page.getByTestId("message-bubble").filter({ hasText: /.+/ }).first()).toBeVisible({ timeout: 10000 });
    // Wait for user and assistant messages
    await expect(page.locator('[data-testid="message-bubble"][data-role="user"]')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('[data-testid="message-bubble"][data-role="assistant"]')).toBeVisible({ timeout: 10000 });
    await expect(page.getByTestId("action-chip").first()).toBeVisible({ timeout: 10000 });
  });

  test("4. free-text send for cinematic reel produces user+assistant bubbles and create-video chip", async ({ page }) => {
    await page.goto("/copilot");
    const compose = page.locator('[data-testid="compose-box"] textarea');
    await compose.fill("make a 10 second cinematic reel of a samurai in rain");
    await page.getByTestId("send-btn").click();
    await expect(page.locator('[data-testid="message-bubble"][data-role="user"]')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('[data-testid="message-bubble"][data-role="assistant"]')).toBeVisible({ timeout: 10000 });
    const videoChip = page.locator('[data-testid="action-chip"][data-action-type="create-video"]');
    await expect(videoChip.first()).toBeVisible({ timeout: 10000 });
  });

  test("5. action chip navigation goes to /create/video?model= with prompt containing samurai", async ({ page }) => {
    await page.goto("/copilot");
    const compose = page.locator('[data-testid="compose-box"] textarea');
    await compose.fill("make a 10 second cinematic reel of a samurai in rain");
    await page.getByTestId("send-btn").click();
    await expect(page.locator('[data-testid="action-chip"][data-action-type="create-video"]').first()).toBeVisible({ timeout: 10000 });
    const chip = page.locator('[data-testid="action-chip"][data-action-type="create-video"]').first();
    await chip.click();
    await page.waitForURL(/\/create\/video\?model=/, { timeout: 10000 });
    expect(page.url()).toContain("/create/video?model=");
    expect(page.url().toLowerCase()).toContain("samurai");
  });

  test("6. fashion-lookbook starter → first chip → url starts with /tools/fashion-factory?prompt=", async ({ page }) => {
    await page.goto("/copilot");
    const fashionCard = page.locator('[data-testid="starter-card"][data-intent="fashion-lookbook"]');
    await fashionCard.click();
    await expect(page.locator('[data-testid="message-bubble"][data-role="assistant"]')).toBeVisible({ timeout: 10000 });
    const chip = page.getByTestId("action-chip").first();
    await expect(chip).toBeVisible({ timeout: 10000 });
    const href = await chip.getAttribute("data-href");
    expect(href).toMatch(/^\/tools\/fashion-factory\?prompt=/);
  });

  test("7. popcorn deep-link prefill — preset=cafe-gloom sets aria-pressed=true", async ({ page }) => {
    await page.goto("/tools/popcorn?preset=cafe-gloom&subject=coffee+shop+mood");
    // Wait for the preset card to be selected
    const presetCard = page.locator('[data-testid="preset-card"][data-preset-id="cafe-gloom"]');
    await expect(presetCard).toBeVisible({ timeout: 10000 });
    await expect(presetCard).toHaveAttribute("aria-pressed", "true");
    // Subject textarea should be prefilled
    const textarea = page.locator('[data-testid="subject-prompt"]');
    await expect(textarea).toHaveValue(/coffee shop mood/i, { timeout: 5000 });
  });

  test("8. sidebar has Copilot link and no AI Chat link", async ({ page }) => {
    await page.goto("/");
    // Open sidebar if needed (mobile)
    const sidebar = page.locator("aside");
    await expect(sidebar).toBeVisible();
    const copilotLink = sidebar.getByRole("link", { name: "Copilot" });
    await expect(copilotLink).toBeVisible();
    // Check href
    await expect(copilotLink).toHaveAttribute("href", "/copilot");
    // No "AI Chat" link
    await expect(sidebar.getByRole("link", { name: "AI Chat" })).toHaveCount(0);
  });

  test("9. legacy /chat still returns 200 and renders", async ({ page }) => {
    const response = await page.goto("/chat");
    expect(response?.status()).toBe(200);
    // Should render either Copilot or legacy chat
    await expect(page.locator("main")).toBeVisible();
  });

  test("10. no slate-/zinc- design token violations on /copilot", async ({ page }) => {
    await page.goto("/copilot");
    const bad = await page.evaluate(() => {
      const all = Array.from(document.querySelectorAll("*"));
      const rx = /\b(slate|zinc)-\d/;
      return all.filter((el) => {
        const cls = (el as HTMLElement).className;
        return typeof cls === "string" && rx.test(cls);
      }).length;
    });
    expect(bad).toBe(0);
  });

  test("11. /apps gallery shows Copilot card that navigates to /copilot", async ({ page }) => {
    await page.goto("/apps");
    const copilotCard = page.locator('[data-testid="tool-card"]').filter({ hasText: /Copilot/i });
    await expect(copilotCard).toBeVisible({ timeout: 10000 });
    await copilotCard.click();
    await page.waitForURL(/\/copilot/, { timeout: 10000 });
    expect(page.url()).toContain("/copilot");
  });

  test("12. POST /api/copilot/suggest returns reply, actions, intent", async ({ page }) => {
    const response = await page.request.post("/api/copilot/suggest", {
      data: {
        messages: [{ role: "user", content: "make a short video" }],
      },
    });
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(typeof body.reply).toBe("string");
    expect(Array.isArray(body.actions)).toBe(true);
    expect(typeof body.intent).toBe("string");
  });

  test("13. (opt-in) real downstream generation round-trip", async ({ page }) => {
    test.skip(!process.env.FAL_KEY, "needs FAL_KEY");

    await page.goto("/copilot");
    const compose = page.locator('[data-testid="compose-box"] textarea');
    await compose.fill("make a 5 second video of a neon city");
    await page.getByTestId("send-btn").click();
    await expect(page.locator('[data-testid="action-chip"]').first()).toBeVisible({ timeout: 15000 });
    await page.locator('[data-testid="action-chip"]').first().click();
    // Wait for landing page
    await page.waitForTimeout(2000);
    // Try to find and click a Generate button
    const generateBtn = page.getByRole("button", { name: /generate/i }).first();
    if (await generateBtn.isVisible()) {
      await generateBtn.click();
    }
    // Wait up to 90s for a fal.media URL to appear
    await expect(page.locator("a[href*='fal.media'], video[src*='fal.media'], img[src*='fal.media']")).toBeVisible({
      timeout: 90000,
    });
  });
});

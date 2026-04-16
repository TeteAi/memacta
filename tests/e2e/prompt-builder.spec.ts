import { test, expect } from "@playwright/test";

test.describe("Prompt Guide — Prompt Builder", () => {
  test("1. Page renders with h1, data-testid=prompt-builder, data-testid=prompt-preview", async ({
    page,
  }) => {
    await page.goto("/prompt-guide");
    await expect(page.getByRole("heading", { name: "Prompt Guide" })).toBeVisible();
    await expect(page.getByTestId("prompt-builder")).toBeVisible();
    await expect(page.getByTestId("prompt-preview")).toBeVisible();
    const previewText = await page.getByTestId("prompt-preview").textContent();
    expect(previewText?.trim()).toBe("");
  });

  test("2. Switching to Image hides Motion, keeps Camera", async ({ page }) => {
    await page.goto("/prompt-guide");
    const builder = page.getByTestId("prompt-builder");
    await builder.getByRole("button", { name: "Image" }).click();
    await expect(page.getByTestId("chip-group-motion")).not.toBeVisible();
    await expect(page.getByTestId("chip-group-camera")).toBeVisible();
  });

  test("3. Switching to Character hides both Motion and Camera", async ({
    page,
  }) => {
    await page.goto("/prompt-guide");
    const builder = page.getByTestId("prompt-builder");
    await builder.getByRole("button", { name: "Character" }).click();
    await expect(page.getByTestId("chip-group-motion")).not.toBeVisible();
    await expect(page.getByTestId("chip-group-camera")).not.toBeVisible();
  });

  test("4. Chip select: preview contains subject and selected style", async ({
    page,
  }) => {
    await page.goto("/prompt-guide");
    await page.getByRole("textbox").fill("neon street");
    await page.getByTestId("chip-group-style").getByRole("button", { name: "cinematic" }).click();
    const preview = await page.getByTestId("prompt-preview").textContent();
    expect(preview).toContain("neon street");
    expect(preview).toContain("cinematic");
  });

  test("5. Chip deselect removes keyword from preview", async ({ page }) => {
    await page.goto("/prompt-guide");
    await page.getByRole("textbox").fill("neon street");
    const chip = page.getByTestId("chip-group-style").getByRole("button", { name: "cinematic" });
    await chip.click();
    let preview = await page.getByTestId("prompt-preview").textContent();
    expect(preview).toContain("cinematic");
    await chip.click(); // deselect
    preview = await page.getByTestId("prompt-preview").textContent();
    expect(preview).not.toContain("cinematic");
  });

  test("6. Open in Create button is disabled when subject is empty", async ({
    page,
  }) => {
    await page.goto("/prompt-guide");
    const btn = page.getByRole("button", { name: /Open in Create/ });
    await expect(btn).toBeDisabled();
  });

  test("7. Open in Create deep-links to /create/image with encoded prompt for Image category", async ({
    page,
  }) => {
    await page.goto("/prompt-guide");
    const builder = page.getByTestId("prompt-builder");
    await builder.getByRole("button", { name: "Image" }).click();
    await page.getByRole("textbox").fill("skyline");
    await page.getByTestId("chip-group-style").getByRole("button", { name: "photoreal" }).click();

    // The link should now be rendered (not a disabled button)
    const link = page.getByRole("link", { name: /Open in Create/ });
    const href = await link.getAttribute("href");
    expect(href).toMatch(/\/create\/image\?prompt=/);
    const decoded = decodeURIComponent(href!.split("?prompt=")[1]);
    expect(decoded).toContain("skyline");
    expect(decoded).toContain("photoreal");
  });

  test("8. Copy prompt button shows Copied! then writes to clipboard", async ({
    page,
  }) => {
    await page.addInitScript(() => {
      (window as unknown as Record<string, unknown>).__clipboardWrites = [];
      Object.defineProperty(navigator, "clipboard", {
        value: {
          writeText: (text: string) => {
            ((window as unknown as Record<string, unknown>).__clipboardWrites as string[]).push(text);
            return Promise.resolve();
          },
        },
        configurable: true,
      });
    });

    await page.goto("/prompt-guide");
    await page.getByRole("textbox").fill("a red balloon");
    await page.getByRole("button", { name: /Copy prompt/ }).click();
    await expect(page.getByRole("button", { name: "Copied!" })).toBeVisible();

    const writes = await page.evaluate(
      () => (window as unknown as Record<string, unknown>).__clipboardWrites
    );
    expect((writes as string[]).length).toBeGreaterThan(0);
    expect((writes as string[])[0]).toContain("a red balloon");
  });

  test("9. /careers smoke: h1 with 'Careers' + 4+ open-role cards", async ({
    page,
  }) => {
    await page.goto("/careers");
    await expect(
      page.getByRole("heading", { name: /Careers/i })
    ).toBeVisible();
    const cards = page.getByTestId("open-role-card");
    await expect(cards).toHaveCount(await cards.count());
    expect(await cards.count()).toBeGreaterThanOrEqual(4);
  });

  test("10. Footer Discord link exists with correct aria-label and href", async ({
    page,
  }) => {
    await page.goto("/");
    const footer = page.getByRole("contentinfo");
    const discordLink = footer.getByRole("link", { name: "Join our Discord" });
    await expect(discordLink).toBeVisible();
    const href = await discordLink.getAttribute("href");
    expect(href).toMatch(/^https:\/\/discord\.gg\//);
  });
});

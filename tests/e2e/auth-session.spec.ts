import { test, expect } from "@playwright/test";

test("GET /api/auth/session returns 200 JSON", async ({ page }) => {
  const res = await page.request.get("/api/auth/session");
  expect(res.status()).toBe(200);
  const ct = res.headers()["content-type"] ?? "";
  expect(ct).toContain("json");
});

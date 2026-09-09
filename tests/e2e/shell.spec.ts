import { expect, test } from "@playwright/test";

test("public landing and login are keyboard navigable", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: /Satu ruang belajar/i })).toBeVisible();
  await page.getByRole("link", { name: /Masuk/i }).first().click();
  await expect(page.getByRole("heading", { name: /Masuk ke LMS/i })).toBeVisible();
});

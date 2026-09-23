import { expect, test } from "@playwright/test";

test("public readiness and disabled login remain usable across browser engines", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: /Ruang belajar yang mengikuti konteks Class/i })).toBeVisible();

  await Promise.all([
    page.waitForURL("**/status"),
    page.getByRole("link", { name: "Status layanan" }).first().click(),
  ]);
  await expect(page.getByRole("heading", { name: "Status layanan", exact: true })).toBeVisible();

  await Promise.all([
    page.waitForURL("**/login"),
    page.getByRole("link", { name: "Masuk" }).click(),
  ]);
  await expect(page.getByRole("heading", { name: "Masuk ke LMS" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Lanjutkan ke Login Aman" })).toBeDisabled();
});

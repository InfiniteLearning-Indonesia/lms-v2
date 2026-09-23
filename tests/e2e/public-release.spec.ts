import { expect, test } from "@playwright/test";

test("public landing is honest, responsive, and keyboard reachable", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.emulateMedia({ reducedMotion: "reduce", colorScheme: "dark" });
  await page.goto("/");

  await expect(page).toHaveTitle(/Ruang Belajar \| Infinite Learning LMS/);
  await expect(page.getByRole("heading", { name: /Ruang belajar yang mengikuti konteks Class/i })).toBeVisible();
  await expect(page.getByText("Menunggu identity owner", { exact: true })).toBeVisible();
  await expect(page.getByText("Menunggu kontrak backend", { exact: true })).toBeVisible();
  await expect(page.getByText(/bukan health monitoring real-time/i)).toBeVisible();
  await expect(page.getByRole("link", { name: "Masuk" })).toBeVisible();

  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow).toBeLessThanOrEqual(1);

  await page.keyboard.press("Home");
  await page.keyboard.press("Tab");
  await expect(page.getByRole("link", { name: /Lewati navigasi/i })).toBeFocused();
});

test("status page distinguishes UI readiness from integration readiness", async ({ page }) => {
  await page.goto("/status");

  await expect(page).toHaveTitle("Status Layanan | Infinite Learning LMS");
  await expect(page.getByRole("heading", { name: "Status layanan", exact: true })).toBeVisible();
  await expect(page.getByText("Tersedia", { exact: true })).toBeVisible();
  await expect(page.getByText("Menunggu identity owner", { exact: true })).toBeVisible();
  await expect(page.getByText("Menunggu backend", { exact: true })).toBeVisible();
  await expect(page.getByText("Belum terverifikasi", { exact: true })).toBeVisible();
  await expect(page.getByText(/tidak diaktifkan hanya untuk membuat demo/i)).toBeVisible();
});

test("production pages return the FE08 security header baseline", async ({ page }) => {
  const response = await page.goto("/");
  expect(response).not.toBeNull();
  const headers = response!.headers();

  expect(headers["x-content-type-options"]).toBe("nosniff");
  expect(headers["x-frame-options"]).toBe("DENY");
  expect(headers["cross-origin-opener-policy"]).toBe("same-origin");
  expect(headers["content-security-policy"]).toContain("frame-ancestors 'none'");
  expect(headers["content-security-policy"]).toContain("connect-src 'self'");
  expect(headers["content-security-policy"]).not.toContain("upgrade-insecure-requests");
});

test("unknown public route has an accessible recovery path", async ({ page }) => {
  const response = await page.goto("/route-yang-tidak-ada");
  expect(response?.status()).toBe(404);
  await expect(page.getByRole("heading", { name: "Halaman tidak ditemukan" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Kembali ke beranda" })).toBeVisible();
});

import { expect, test, type Page } from "@playwright/test";

const classId = "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa";
const siteAdmin = {
  id: "actor-admin-browser",
  display_name: "Site Admin Browser",
  site_admin: true,
  account_state: "ACTIVE",
  site_capabilities: ["site.admin"],
};
const managedClass = {
  id: classId,
  name: "Class Draft Browser",
  state: "DRAFT",
  version: 2,
  contextual_roles: ["teacher"],
  enrollment_state: "ACTIVE",
  capabilities: ["class.read", "class.manage", "participants.read", "participants.manage"],
};

async function mockAdminSession(page: Page) {
  await page.route("**/api/v3/auth/me", (route) => route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(siteAdmin) }));
  await page.route(`**/api/v3/classes/${classId}`, (route) => route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(managedClass) }));
}

test("production Admin Class directory is honest, responsive, and mutation-safe", async ({ page }) => {
  await mockAdminSession(page);
  let mutationCount = 0;
  await page.route("**/api/v3/classes", async (route) => {
    if (route.request().method() !== "GET") mutationCount += 1;
    await route.fulfill({ status: 503, contentType: "application/json", body: JSON.stringify({ code: "NOT_READY" }) });
  });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto("/app/admin/classes");

  await expect(page.getByRole("heading", { level: 1, name: "Kelola Class" })).toBeVisible();
  await expect(page.getByText("Direktori Class menunggu backend")).toBeVisible();
  await expect(page.getByText("Product Engineering 2026")).toHaveCount(0);
  await page.getByRole("button", { name: "Buka navigasi" }).click();
  await expect(page.getByRole("link", { name: "Kelola Class" })).toHaveAttribute("aria-current", "page");
  await expect(page.getByRole("searchbox", { name: "Cari di Kelas Saya" })).toHaveCount(0);
  await page.keyboard.press("Escape");
  await page.getByRole("button", { name: "Toggle theme" }).click();
  await expect(page.locator("html")).toHaveClass(/dark/);

  await page.getByRole("button", { name: "Buat Class" }).click();
  await expect(page.getByRole("dialog").getByText("Pembuatan Class belum aktif")).toBeVisible();
  await expect(page.getByRole("dialog").getByRole("button", { name: "Buat Class", exact: true })).toBeDisabled();
  await page.getByLabel("Nama Class").fill("Class tanpa mutation");
  await page.keyboard.press("Enter");
  expect(mutationCount).toBe(0);
  await page.evaluate(() => { document.documentElement.style.fontSize = "125%"; });
  await page.setViewportSize({ width: 812, height: 375 });
  await expect(page.getByRole("dialog")).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
});

test("Class settings exposes versioned lifecycle UI without sending commands", async ({ page }) => {
  await mockAdminSession(page);
  let mutationCount = 0;
  page.on("request", (request) => {
    if (request.url().includes(`/api/v3/classes/${classId}`) && request.method() !== "GET") mutationCount += 1;
  });
  await page.goto(`/app/classes/${classId}/settings`);

  await expect(page.getByRole("heading", { level: 1, name: "Pengaturan Class" })).toBeVisible();
  await expect(page.getByText("Versi 2")).toBeVisible();
  await expect(page.getByRole("button", { name: "Simpan perubahan" })).toBeDisabled();
  await page.getByRole("button", { name: /Publikasikan/ }).click();
  await expect(page.getByRole("alertdialog").getByRole("button", { name: "Publikasikan" })).toBeDisabled();
  await page.keyboard.press("Enter");
  expect(mutationCount).toBe(0);
});

test("Class People keeps production reads and identity search as explicit dependencies", async ({ page }) => {
  await mockAdminSession(page);
  let participantMutationCount = 0;
  page.on("request", (request) => {
    if (request.url().includes("/participants") && request.method() !== "GET") participantMutationCount += 1;
  });
  await page.goto(`/app/classes/${classId}/people`);

  await expect(page.getByRole("heading", { level: 1, name: "Orang" })).toBeVisible();
  await expect(page.getByText("Daftar participant menunggu backend")).toBeVisible();
  await expect(page.getByText(/Tidak tersedia self-enrollment/)).toBeVisible();
  await page.getByRole("button", { name: "Tambah participant" }).click();
  const dialog = page.getByRole("dialog");
  await expect(dialog.getByText("Identity search menunggu backend")).toBeVisible();
  await expect(dialog.getByRole("button", { name: "Tambahkan ke Class" })).toBeDisabled();
  await page.keyboard.press("Enter");
  expect(participantMutationCount).toBe(0);
});

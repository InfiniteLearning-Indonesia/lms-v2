import { expect, test, type Page } from "@playwright/test";

const classId = "bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb";
const actor = {
  id: "actor-browser",
  display_name: "Student Browser",
  site_admin: false,
  account_state: "ACTIVE",
};

const activeClass = {
  id: classId,
  name: "Product Engineering 2026",
  program_label: "Software Engineering",
  cohort_label: "Batch 01",
  state: "PUBLISHED",
  version: 3,
  contextual_roles: ["student"],
  enrollment_state: "ACTIVE",
  capabilities: ["class.read", "content.read", "submission.read", "progress.read", "logbook.read"],
};

async function mockSession(page: Page, classResponse = activeClass) {
  await page.route("**/api/v3/auth/me", (route) => route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(actor) }));
  await page.route(`**/api/v3/classes/${classId}`, (route) => route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(classResponse) }));
}

test("workspace follows URL Class context and capability navigation", async ({ page }) => {
  await mockSession(page);
  await page.goto(`/app/classes/${classId}`);

  await expect(page.getByRole("heading", { name: "Product Engineering 2026" })).toBeVisible();
  await expect(page.getByRole("searchbox", { name: "Cari di Kelas Saya" })).toHaveCount(0);
  await expect(page.getByRole("link", { name: "Back to Workspace" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Workspace", exact: true })).toHaveCount(0);
  await expect(page.getByRole("link", { name: "Ringkasan" })).toHaveAttribute("aria-current", "page");
  await expect(page.getByRole("link", { name: "Pembelajaran", exact: true })).toBeVisible();
  await expect(page.getByRole("link", { name: "Pengumpulan" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Nilai" })).toHaveCount(0);
  await expect(page.getByRole("link", { name: "Progress" })).toHaveCount(0);
  await expect(page.getByRole("link", { name: "Buka Pembelajaran" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Tugas Mendatang" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Data tugas menunggu integrasi" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Pengingat Logbook" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Data logbook menunggu integrasi" })).toBeVisible();
  await expect(page.getByText("Project Brief: Learning Dashboard")).toHaveCount(0);
  await expect(page.getByText("Student Browser")).toBeVisible();

  await page.getByRole("link", { name: "Buka Pembelajaran" }).click();
  await expect(page).toHaveURL(`/app/classes/${classId}/learning`);
  await expect(page.getByRole("link", { name: "Ringkasan" })).not.toHaveAttribute("aria-current");
  await expect(page.getByRole("link", { name: "Pembelajaran", exact: true })).toHaveAttribute("aria-current", "page");
});

test("mobile Class navigation returns to Workspace without a Class search", async ({ page }) => {
  await mockSession(page);
  await page.setViewportSize({ width: 360, height: 800 });
  await page.goto(`/app/classes/${classId}`);

  await page.getByRole("button", { name: "Buka navigasi" }).click();

  await expect(page.getByRole("link", { name: "Back to Workspace" })).toBeVisible();
  await expect(page.getByRole("searchbox", { name: "Cari di Kelas Saya" })).toHaveCount(0);
  await expect(page.getByRole("link", { name: "Workspace", exact: true })).toHaveCount(0);
  await expect(page.getByRole("link", { name: "Pembelajaran", exact: true })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
});

test("Class overview remains usable on a small phone and in landscape", async ({ page }) => {
  await mockSession(page);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto(`/app/classes/${classId}`);

  await expect(page.getByRole("heading", { level: 1, name: "Product Engineering 2026" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Buka Pembelajaran", exact: true })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);

  await page.getByRole("button", { name: "Toggle theme" }).click();
  await expect(page.locator("html")).toHaveClass(/dark/);

  await page.evaluate(() => { document.documentElement.style.fontSize = "125%"; });
  await page.setViewportSize({ width: 812, height: 375 });
  await expect(page.getByRole("link", { name: "Buka Pembelajaran", exact: true })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
});

test("direct Class route fails closed when capability is missing", async ({ page }) => {
  await mockSession(page, { ...activeClass, capabilities: ["class.read"] });
  await page.goto(`/app/classes/${classId}/learning`);

  await expect(page.getByRole("heading", { name: "Akses tidak tersedia" })).toBeVisible();
  await expect(page.getByText("Section, activity, materi", { exact: false })).toHaveCount(0);
});

test("workspace exposes backend dependency instead of a fabricated Class list", async ({ page }) => {
  await mockSession(page);
  await page.setViewportSize({ width: 360, height: 800 });
  await page.goto("/app");

  await expect(page.getByRole("heading", { name: "Daftar Class belum tersedia" })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  await page.getByRole("link", { name: "Buka profil Student Browser" }).focus();
  await expect(page.getByRole("link", { name: "Buka profil Student Browser" })).toBeFocused();
  await page.getByRole("link", { name: "Buka profil Student Browser" }).click();
  await expect(page.getByRole("heading", { name: "Profil dan keamanan" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Keluar" })).toBeDisabled();
});

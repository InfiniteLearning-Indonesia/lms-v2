import { expect, test, type Page } from "@playwright/test";

const classId = "bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb";
const actor = {
  id: "actor-learning-browser",
  display_name: "Student Learning Browser",
  site_admin: false,
  account_state: "ACTIVE",
};
const activeClass = {
  id: classId,
  name: "Product Engineering 2026",
  state: "PUBLISHED",
  version: 3,
  contextual_roles: ["student"],
  enrollment_state: "ACTIVE",
  capabilities: ["class.read", "content.read"],
};

async function mockLearningSession(page: Page, classResponse = activeClass) {
  await page.route("**/api/v3/auth/me", (route) => route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(actor) }));
  await page.route(`**/api/v3/classes/${classId}`, (route) => route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(classResponse) }));
}

test("production Learning exposes the M06-M07 dependency without inventing content requests", async ({ page }) => {
  await mockLearningSession(page);
  const unexpectedBusinessRequests: string[] = [];
  page.on("request", (request) => {
    const url = request.url();
    if (url.includes("/api/v3/") && !url.endsWith("/api/v3/auth/me") && !url.endsWith(`/api/v3/classes/${classId}`)) unexpectedBusinessRequests.push(url);
  });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.setViewportSize({ width: 360, height: 800 });
  await page.goto(`/app/classes/${classId}/learning`);

  await expect(page.getByRole("navigation", { name: "Navigasi workspace" })).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Buka navigasi" })).toHaveCount(0);
  await expect(page.getByRole("link", { name: "Kembali ke Ringkasan Class" })).toHaveAttribute("href", `/app/classes/${classId}`);
  await expect(page.getByRole("heading", { level: 1, name: "Pembelajaran" })).toBeVisible();
  await expect(page.getByText("Preview Student Mode")).toHaveCount(0);
  await expect(page.getByText("Mode Belajar")).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Tambah Section" })).toHaveCount(0);
  await expect(page.getByRole("heading", { name: "Konten pembelajaran menunggu backend" })).toBeVisible();
  await expect(page.getByText("Section dan Activity")).toBeVisible();
  await expect(page.getByText("Revision yang stabil")).toBeVisible();
  await expect(page.getByText("File tetap private")).toBeVisible();
  await expect(page.getByText("Mulai di sini")).toHaveCount(0);
  expect(unexpectedBusinessRequests).toEqual([]);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);

  await page.getByRole("button", { name: "Ganti tema warna" }).click();
  await expect(page.locator("html")).toHaveClass(/dark/);
  await page.evaluate(() => { document.documentElement.style.fontSize = "125%"; });
  await page.setViewportSize({ width: 812, height: 375 });
  await expect(page.getByRole("heading", { name: "Konten pembelajaran menunggu backend" })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
});

test("production author capability still cannot fabricate learning mutations", async ({ page }) => {
  await mockLearningSession(page, {
    ...activeClass,
    contextual_roles: ["teacher"],
    capabilities: ["class.read", "content.read", "content.manage", "content.publish", "files.upload"],
  });
  let mutationCount = 0;
  page.on("request", (request) => {
    if (request.url().includes("/api/v3/") && request.method() !== "GET") mutationCount += 1;
  });
  await page.goto(`/app/classes/${classId}/learning`);

  await expect(page.getByText("Preview Student Mode")).toBeVisible();
  await expect(page.getByRole("button", { name: "Kelola" })).toHaveCount(0);
  await expect(page.getByRole("heading", { name: "Konten pembelajaran menunggu backend" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Simpan draft" })).toHaveCount(0);

  await page.goto(`/app/classes/${classId}/learning/activities/activity-contract-placeholder/edit`);
  await expect(page.getByRole("link", { name: "Kembali ke Preview Student" })).toHaveAttribute("href", `/app/classes/${classId}/learning`);
  await expect(page.getByRole("heading", { level: 1, name: "Detail Activity" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Konten pembelajaran menunggu backend" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Simpan draft" })).toHaveCount(0);

  await page.goto(`/app/classes/${classId}/learning/activities/new?sectionId=section-contract-placeholder&type=MATERIAL`);
  await expect(page.getByRole("link", { name: "Kembali ke Preview Student" })).toHaveAttribute("href", `/app/classes/${classId}/learning`);
  await expect(page.getByRole("heading", { level: 1, name: "Buat Activity" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Konten pembelajaran menunggu backend" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Simpan draft" })).toHaveCount(0);
  await page.keyboard.press("Enter");
  expect(mutationCount).toBe(0);
});

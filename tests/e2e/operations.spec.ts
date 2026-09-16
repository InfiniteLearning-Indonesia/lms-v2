import { expect, test, type Page } from "@playwright/test";

const classId = "bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb";
const actor = { id: "actor-fe06-browser", display_name: "FE06 Browser", site_admin: false, account_state: "ACTIVE" };

async function mockClassSession(page: Page, capabilities: string[]) {
  await page.route("**/api/v3/auth/me", (route) => route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(actor) }));
  await page.route(`**/api/v3/classes/${classId}`, (route) => route.fulfill({
    status: 200,
    contentType: "application/json",
    body: JSON.stringify({ id: classId, name: "Product Engineering 2026", state: "PUBLISHED", version: 3, contextual_roles: ["student"], enrollment_state: "ACTIVE", capabilities }),
  }));
}

test("production Attendance stays fail-closed and never requests M11 business data", async ({ page }) => {
  await mockClassSession(page, ["class.read", "attendance.read", "permit.create", "discipline.read"]);
  const businessRequests: string[] = [];
  page.on("request", (request) => {
    const url = request.url();
    if (url.includes("/api/v3/") && !url.endsWith("/api/v3/auth/me") && !url.endsWith(`/api/v3/classes/${classId}`)) businessRequests.push(`${request.method()} ${url}`);
  });
  await page.setViewportSize({ width: 360, height: 800 });
  await page.goto(`/app/classes/${classId}/attendance`);
  await expect(page.getByRole("heading", { level: 1, name: "Kalender Kehadiran" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Attendance menunggu backend" })).toBeVisible();
  await expect(page.getByText("record yang tidak ada ditampilkan Tidak diketahui", { exact: false })).toBeVisible();
  await expect(page.getByRole("button", { name: "Ajukan izin" })).toHaveCount(0);
  await page.keyboard.press("Tab");
  await page.keyboard.press("Enter");
  expect(businessRequests).toEqual([]);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
});

test("production Logbook exposes M12 dependency without entry or review commands", async ({ page }) => {
  await mockClassSession(page, ["class.read", "logbook.read", "logbook.write", "logbook.review", "mentoring.read"]);
  await page.emulateMedia({ colorScheme: "dark", reducedMotion: "reduce" });
  let mutationCount = 0;
  page.on("request", (request) => {
    if (request.url().includes("/api/v3/") && request.method() !== "GET") mutationCount += 1;
  });
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto(`/app/classes/${classId}/logbook`);
  await expect(page.getByRole("heading", { level: 1, name: "Logbook" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Logbook menunggu backend" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Periode fleksibel" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Kirim logbook" })).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Terima entry" })).toHaveCount(0);
  await page.keyboard.press("Enter");
  expect(mutationCount).toBe(0);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
});

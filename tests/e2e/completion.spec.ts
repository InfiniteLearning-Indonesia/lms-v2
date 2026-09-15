import { expect, test, type Page } from "@playwright/test";

const classId = "bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb";
const actor = { id: "actor-fe05-browser", display_name: "FE05 Browser", site_admin: false, account_state: "ACTIVE" };

async function mockClassSession(page: Page, capabilities: string[]) {
  await page.route("**/api/v3/auth/me", (route) => route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(actor) }));
  await page.route(`**/api/v3/classes/${classId}`, (route) => route.fulfill({
    status: 200,
    contentType: "application/json",
    body: JSON.stringify({ id: classId, name: "Product Engineering 2026", state: "PUBLISHED", version: 3, contextual_roles: ["student"], enrollment_state: "ACTIVE", capabilities }),
  }));
}

test("production Progress is reachable from Learning and exposes M10 dependency without an invented request", async ({ page }) => {
  await mockClassSession(page, ["class.read", "content.read", "progress.read", "credentials.read"]);
  const unexpectedBusinessRequests: string[] = [];
  page.on("request", (request) => {
    const url = request.url();
    if (url.includes("/api/v3/") && !url.endsWith("/api/v3/auth/me") && !url.endsWith(`/api/v3/classes/${classId}`)) unexpectedBusinessRequests.push(url);
  });
  await page.setViewportSize({ width: 360, height: 800 });
  await page.goto(`/app/classes/${classId}/learning`);
  await page.getByRole("link", { name: "Lihat Progres" }).click();
  await expect(page).toHaveURL(`/app/classes/${classId}/progress`);
  await expect(page.getByRole("heading", { level: 1, name: "Progres Pembelajaran" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Completion menunggu backend" })).toBeVisible();
  await expect(page.getByText("Policy berversi")).toBeVisible();
  await expect(page.getByRole("button", { name: "Buka navigasi" })).toBeVisible();
  await page.getByRole("button", { name: "Buka navigasi" }).click();
  await expect(page.getByRole("link", { name: "Progress" })).toHaveCount(0);
  expect(unexpectedBusinessRequests).toEqual([]);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
});

test("production Credentials stays fail-closed and keeps every lifecycle command absent", async ({ page }) => {
  await mockClassSession(page, ["class.read", "credentials.read"]);
  let mutationCount = 0;
  page.on("request", (request) => {
    if (request.url().includes("/api/v3/") && request.method() !== "GET") mutationCount += 1;
  });
  await page.goto(`/app/classes/${classId}/credentials`);
  await expect(page.getByRole("heading", { level: 1, name: "Transkrip & Sertifikat" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Transkrip dan sertifikat menunggu backend" })).toBeVisible();
  await expect(page.getByText("Verifikasi data-minimal")).toBeVisible();
  await expect(page.getByRole("button", { name: "Unduh sertifikat" })).toHaveCount(0);
  await page.keyboard.press("Enter");
  expect(mutationCount).toBe(0);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
});

test("public verification is data-minimal and does not fabricate credential status", async ({ page }) => {
  const credentialRequests: string[] = [];
  page.on("request", (request) => {
    if (request.url().includes("/api/v3/")) credentialRequests.push(request.url());
  });
  await page.setViewportSize({ width: 360, height: 800 });
  await page.goto("/certificate/verify/IL-PE26-SALSA-0012");
  await expect(page.getByRole("heading", { level: 1, name: "Periksa keaslian sertifikat" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Verifikasi menunggu backend" })).toBeVisible();
  await expect(page.getByText("Verifikasi publik tidak menampilkan email", { exact: false })).toBeVisible();
  await expect(page.getByText("Student Demo")).toHaveCount(0);
  expect(credentialRequests).toEqual([]);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);

  await page.goto("/certificate/verify/invalid!code");
  await expect(page.getByRole("heading", { name: "Kredensial tidak ditemukan" })).toBeVisible();
});

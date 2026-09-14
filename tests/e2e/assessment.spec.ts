import { expect, test, type Page } from "@playwright/test";

const publishedClassId = "bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb";
const draftClassId = "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa";
const actor = { id: "actor-fe04-browser", display_name: "FE04 Browser", site_admin: false, account_state: "ACTIVE" };

async function mockClassSession(page: Page, classId: string, contextualRoles: string[], capabilities: string[]) {
  await page.route("**/api/v3/auth/me", (route) => route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(actor) }));
  await page.route(`**/api/v3/classes/${classId}`, (route) => route.fulfill({
    status: 200,
    contentType: "application/json",
    body: JSON.stringify({
      id: classId,
      name: classId === draftClassId ? "Class Draft" : "Product Engineering 2026",
      state: classId === draftClassId ? "DRAFT" : "PUBLISHED",
      version: 1,
      contextual_roles: contextualRoles,
      enrollment_state: "ACTIVE",
      capabilities,
    }),
  }));
}

test("production Student submission route exposes M08 dependency without fabricating a request", async ({ page }) => {
  await mockClassSession(page, publishedClassId, ["student"], ["class.read", "submission.read"]);
  const unexpectedBusinessRequests: string[] = [];
  page.on("request", (request) => {
    const url = request.url();
    if (url.includes("/api/v3/") && !url.endsWith("/api/v3/auth/me") && !url.endsWith(`/api/v3/classes/${publishedClassId}`)) unexpectedBusinessRequests.push(url);
  });
  await page.setViewportSize({ width: 360, height: 800 });
  await page.goto(`/app/classes/${publishedClassId}/submissions`);

  await expect(page.getByRole("heading", { level: 1, name: "Pengumpulan" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Submission menunggu backend" })).toBeVisible();
  await expect(page.getByText("Draft tetap di server")).toBeVisible();
  await expect(page.getByText("Receipt yang tahan retry")).toBeVisible();
  await expect(page.getByRole("textbox", { name: "Jawaban tugas" })).toHaveCount(0);
  await page.getByRole("button", { name: "Buka navigasi" }).click();
  await expect(page.getByRole("link", { name: "Pengumpulan" })).toHaveAttribute("aria-current", "page");
  expect(unexpectedBusinessRequests).toEqual([]);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
});

test("production Teacher gradebook stays fail-closed without M09 and never mutates", async ({ page }) => {
  await mockClassSession(page, draftClassId, ["teacher"], ["class.read", "content.manage", "gradebook.read"]);
  let mutationCount = 0;
  page.on("request", (request) => {
    if (request.url().includes("/api/v3/") && request.method() !== "GET") mutationCount += 1;
  });
  await page.goto(`/app/classes/${draftClassId}/gradebook`);

  await expect(page.getByRole("heading", { level: 1, name: "Nilai & Rubrik" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Gradebook menunggu backend" })).toBeVisible();
  await expect(page.getByText("AI hanya memberi saran")).toBeVisible();
  await expect(page.getByRole("button", { name: "Simpan draft nilai" })).toHaveCount(0);
  await page.keyboard.press("Enter");
  expect(mutationCount).toBe(0);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
});

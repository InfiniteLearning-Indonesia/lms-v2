import { expect, test, type Page } from "@playwright/test";

const siteAdmin = {
  id: "actor-fe07-browser",
  display_name: "Site Admin Browser",
  site_admin: true,
  account_state: "ACTIVE",
  site_capabilities: ["site.admin"],
};

async function mockAdminSession(page: Page) {
  await page.route("**/api/v3/auth/me", (route) => route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(siteAdmin) }));
}

test("production FE07 routes stay dependency-only and make no guessed business request", async ({ page }) => {
  await mockAdminSession(page);
  const businessRequests: string[] = [];
  page.on("request", (request) => {
    if (request.url().includes("/api/v3/") && !request.url().endsWith("/api/v3/auth/me")) businessRequests.push(`${request.method()} ${request.url()}`);
  });
  await page.emulateMedia({ reducedMotion: "reduce", colorScheme: "dark" });
  await page.setViewportSize({ width: 375, height: 812 });

  for (const route of ["users", "reports", "audit", "migrations"] as const) {
    await page.goto(`/app/admin/${route}`);
    await expect(page.getByText("Read model admin menunggu backend")).toBeVisible();
    await page.getByRole("button", { name: "Buka navigasi" }).click();
    const label = { users: "Users", reports: "Reports", audit: "Audit", migrations: "Migrations" }[route];
    await expect(page.getByRole("link", { name: label, exact: true })).toHaveAttribute("aria-current", "page");
    await page.keyboard.press("Escape");
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  }

  expect(businessRequests).toEqual([]);
});

test("production invitation and export shells cannot submit a command", async ({ page }) => {
  await mockAdminSession(page);
  let mutationCount = 0;
  page.on("request", (request) => {
    if (request.url().includes("/api/v3/") && request.method() !== "GET") mutationCount += 1;
  });

  await page.goto("/app/admin/users");
  await page.getByRole("button", { name: "Undang user" }).click();
  await expect(page.getByRole("dialog").getByRole("button", { name: "Kirim invitation" })).toBeDisabled();
  await page.getByLabel("Email").fill("new@example.test");
  await page.keyboard.press("Enter");
  await page.keyboard.press("Escape");

  await page.goto("/app/admin/reports");
  await expect(page.getByRole("button", { name: "Minta export" })).toBeDisabled();
  expect(mutationCount).toBe(0);
});

import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

const siteAdmin = {
  id: "actor-a11y-browser",
  display_name: "Site Admin Accessibility",
  site_admin: true,
  account_state: "ACTIVE",
  site_capabilities: ["site.admin"],
};

async function expectNoSeriousAccessibilityViolations(page: Page) {
  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
    .analyze();
  expect(results.violations.filter((violation) => violation.impact === "critical" || violation.impact === "serious")).toEqual([]);
}

test("public login has no serious automated WCAG violations", async ({ page }) => {
  await page.goto("/login");
  await expect(page.getByRole("heading", { name: /Masuk ke LMS/i })).toBeVisible();
  await expectNoSeriousAccessibilityViolations(page);
});

for (const route of ["/", "/status"] as const) {
  test(`${route} has no serious automated WCAG violations`, async ({ page }) => {
    await page.goto(route);
    await expect(page.locator("h1")).toBeVisible();
    await expectNoSeriousAccessibilityViolations(page);
  });
}

test("Admin dependency surface has no serious automated WCAG violations", async ({ page }) => {
  await page.route("**/api/v3/auth/me", (route) => route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(siteAdmin) }));
  await page.goto("/app/admin/migrations");
  await expect(page.getByText("Read model admin menunggu backend")).toBeVisible();
  await expectNoSeriousAccessibilityViolations(page);
});

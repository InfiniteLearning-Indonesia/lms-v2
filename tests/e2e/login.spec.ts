import { expect, test, type Page } from "@playwright/test";

async function expectSecureKeyboardOrder(page: Page) {
  const visitedIds: string[] = [];
  const loginButton = page.getByRole("button", { name: "Lanjutkan ke Login Aman" });

  await page.locator("body").click({ position: { x: 1, y: 1 } });
  for (let step = 0; step < 6; step += 1) {
    await page.keyboard.press("Tab");
    const focused = await page.evaluate(() => {
      const element = document.activeElement as HTMLElement | null;
      return { id: element?.id ?? "", text: element?.textContent?.trim() ?? "" };
    });
    visitedIds.push(focused.id);
    if (focused.text.includes("Lanjutkan ke Login Aman")) break;
  }

  await expect(loginButton).toBeFocused();
  expect(visitedIds).not.toContain("email");
  expect(visitedIds).not.toContain("password");
}

test.describe("restored secure login", () => {
  test("retains the two-column brand layout on desktop", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.emulateMedia({ reducedMotion: "reduce", colorScheme: "light" });
    await page.goto("/login");

    await expect(page.getByRole("heading", { name: "Masuk ke LMS" })).toBeVisible();
    await expect(page.getByRole("region", { name: "Infinite Learning" })).toBeVisible();
    await expect(page.getByRole("heading", { name: /Kelola kelas/ })).toBeVisible();
    await expect(page.getByLabel("Email")).toBeDisabled();
    await expect(page.getByLabel("Password")).toBeDisabled();
    await expectSecureKeyboardOrder(page);
    await expect(page).toHaveScreenshot("login-desktop.png", { fullPage: true, animations: "disabled" });
  });

  test("keeps the mobile login recognizable at 360px", async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 800 });
    await page.emulateMedia({ reducedMotion: "reduce", colorScheme: "light" });
    await page.goto("/login");

    await expect(page.getByRole("region", { name: "Infinite Learning" })).toBeHidden();
    await expect(page.getByRole("link", { name: "Kembali" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Masuk ke LMS" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Lanjutkan ke Login Aman" })).toBeVisible();
    await expectSecureKeyboardOrder(page);
    await expect(page).toHaveScreenshot("login-mobile-360.png", { fullPage: true, animations: "disabled" });
  });
});

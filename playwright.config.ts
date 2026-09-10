import { defineConfig, devices } from "@playwright/test";

const testOrigin = "http://127.0.0.1:3100";

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  reporter: "list",
  use: { baseURL: testOrigin, trace: "retain-on-failure" },
  webServer: {
    command: "npm run build && LMS_API_ORIGIN=http://127.0.0.1:7000 npm run start -- -p 3100",
    url: testOrigin,
    reuseExistingServer: false,
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
});

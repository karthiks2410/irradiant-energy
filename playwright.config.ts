import { defineConfig, devices } from "@playwright/test";

/**
 * Journey tests against a real production build, not `next dev`: the dev server has no
 * minification, different image handling and React's development warnings, so a console
 * assertion there would measure the wrong thing.
 */
export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: 0,
  workers: 4,
  reporter: [["list"]],
  use: {
    baseURL: process.env.E2E_BASE_URL ?? "http://localhost:3021",
    trace: "retain-on-failure",
  },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"] } },
    { name: "mobile", use: { ...devices["iPhone 13"] } },
  ],
  webServer: process.env.E2E_BASE_URL
    ? undefined
    : {
        command: "npx next start -p 3021",
        url: "http://localhost:3021",
        reuseExistingServer: true,
        timeout: 120_000,
      },
});

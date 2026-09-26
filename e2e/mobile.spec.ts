import { test, expect } from "@playwright/test";
import { dismissConsent, headerNav } from "./helpers";

// Runs under both projects. The navigation used to be unreachable below 640px because a
// `hidden sm:inline-flex` lost to the button's own base `inline-flex` in the stylesheet, so
// the phone had no inline nav and no way to open the sheet either.
test("the navigation is reachable at every width", async ({ page }) => {
  await page.goto("/en", { waitUntil: "networkidle" });
  await dismissConsent(page);

  const nav = await headerNav(page);
  for (const name of ["Home", "About", "Contact"]) {
    await expect(nav.getByRole("link", { name }).first()).toBeVisible();
  }
});

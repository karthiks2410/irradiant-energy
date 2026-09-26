import { test, expect } from "@playwright/test";
import { KN_ROUTES, ROUTES, dismissConsent, watchForErrors } from "./helpers";

// Both trees get the same checks. The Kannada tree still renders English copy at this stage, so
// what these prove there is the routing, the chrome and the Kannada typography — the three things
// the copy will land on top of.
for (const route of [...ROUTES, ...KN_ROUTES]) {
  test(`${route} renders cleanly`, async ({ page }) => {
    const errors = watchForErrors(page);
    const response = await page.goto(route, { waitUntil: "networkidle" });

    expect(response?.status(), `${route} status`).toBe(200);
    await expect(page.locator("h1")).toHaveCount(1);
    await expect(page.locator("h1")).not.toBeEmpty();
    await expect(page).toHaveTitle(/.{10,}/);

    // A page with no main landmark is unnavigable by screen reader.
    await expect(page.locator("main")).toHaveCount(1);

    expect(errors, `${route} console`).toEqual([]);
  });

  test(`${route} has no horizontal overflow`, async ({ page }) => {
    await page.goto(route, { waitUntil: "networkidle" });
    await dismissConsent(page);
    const overflow = await page.evaluate(() => {
      const d = document.documentElement;
      return { scroll: d.scrollWidth, client: d.clientWidth };
    });
    // A single pixel of rounding is tolerable; a sideways scrollbar is not.
    expect(overflow.scroll, `${route} scrollWidth`).toBeLessThanOrEqual(overflow.client + 1);
  });

  test(`${route} reveals its content below the fold`, async ({ page }) => {
    await page.goto(route, { waitUntil: "networkidle" });
    await dismissConsent(page);
    // Jump straight to the foot of the page. Scroll-reveal that only arms on an
    // intersection leaves everything jumped past permanently blank.
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(1200);

    const hidden = await page.evaluate(() => {
      const out: string[] = [];
      for (const el of document.querySelectorAll("h2, h3, p, li")) {
        const r = el.getBoundingClientRect();
        if (r.bottom < 0 || r.top > innerHeight || r.height === 0) continue;
        const s = getComputedStyle(el);
        // Deliberately hidden UI — a closed menu, a collapsed panel — is `visibility: hidden`,
        // which is inherited. Scroll-reveal content stuck at opacity 0 is still visible, so this
        // keeps the test on what it is for without flagging the closed Solutions menu, which
        // lives in the fixed header and is always inside the viewport.
        if (s.visibility !== "visible") continue;
        if (parseFloat(s.opacity) < 0.9) out.push((el.textContent ?? "").slice(0, 60));
      }
      return out;
    });
    expect(hidden, `${route} still-hidden content at the foot`).toEqual([]);
  });
}

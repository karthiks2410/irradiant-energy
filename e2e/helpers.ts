import { expect, type Page, type ConsoleMessage } from "@playwright/test";

export const ROUTES = [
  "/",
  "/about",
  "/solutions",
  "/solutions/solar/home",
  "/solutions/solar/housing-society",
  "/solutions/solar/commercial",
  "/get-quote",
  "/contact",
  "/privacy",
  "/terms",
  "/cookies",
];

/** Collect page errors and console errors so a test can assert the page is actually clean. */
export function watchForErrors(page: Page) {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(`pageerror: ${e.message}`));
  page.on("console", (m: ConsoleMessage) => {
    if (m.type() === "error") errors.push(`console: ${m.text()}`);
  });
  return errors;
}

/** Answer the consent dialog so it stops covering the page. */
export async function dismissConsent(page: Page) {
  const reject = page.getByRole("button", { name: /reject/i });
  if (await reject.isVisible().catch(() => false)) {
    await reject.click();
    await expect(page.getByRole("dialog")).toBeHidden();
  }
}

/**
 * Scroll the page before an assertion that depends on not being at the top.
 *
 * Desktop gets a real wheel, which is the input that produced the Lenis bug this suite
 * guards: Lenis stays in its smooth-scrolling state for about half a second afterwards and
 * used to swallow the router's scroll-to-top. Mobile WebKit has no wheel and no scriptable
 * touch drag, so it scrolls directly; that still leaves the page scrolled for the navigation
 * assertion, it just does not exercise the wheel path.
 */
export async function scrollDown(page: Page, distance: number) {
  const size = page.viewportSize() ?? { width: 1280, height: 720 };
  const hasWheel = await page.evaluate(() => !("ontouchstart" in window));
  if (hasWheel) {
    await page.mouse.move(size.width / 2, size.height / 2);
    await page.mouse.wheel(0, distance);
  } else {
    await page.evaluate((d) => window.scrollBy(0, d), distance);
  }
  await page.waitForTimeout(1200);
}

/**
 * Return the header navigation, opening the phone menu first if the inline one is collapsed.
 * The desktop nav is labelled "Main"; the phone sheet is a <dialog> holding a nav labelled
 * "Mobile", so a width-agnostic test has to ask for whichever is actually on screen.
 */
export async function headerNav(page: Page) {
  const main = page.getByRole("navigation", { name: "Main" });
  if (await main.isVisible().catch(() => false)) return main;

  const sheet = page.getByRole("navigation", { name: "Mobile" });
  if (!(await sheet.isVisible().catch(() => false))) {
    await page.getByRole("button", { name: /open menu/i }).first().click();
    await expect(sheet).toBeVisible();
  }
  return sheet;
}

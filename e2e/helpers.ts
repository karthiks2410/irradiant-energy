import { expect, type Page, type ConsoleMessage } from "@playwright/test";
import { localizePath } from "../src/i18n/paths";
import { publishedPaths } from "../src/i18n/registry";

/*
 * The route lists come from src/i18n/registry.ts rather than being retyped here, so a page that is
 * published in one locale and not the other is covered exactly where it resolves — and a route
 * added to the app cannot be missed by the suite. The registry imports nothing but the locale
 * constants, which is what lets Playwright import it directly.
 */
export const ROUTES = publishedPaths("en");
export const KN_ROUTES = publishedPaths("kn");

/** The English URL for an unprefixed app path: en("/about") -> "/en/about". */
export const en = (path: string) => localizePath(path, "en");

/**
 * The language switch that is actually on screen.
 *
 * Below xl it lives in the mobile sheet, so a width-agnostic test has to open the sheet first —
 * which is also the assertion that matters: a phone visitor must be able to change language.
 */
export async function languageSwitch(page: Page) {
  const inBar = page.locator("[data-language-switch]:visible");
  if ((await inBar.count()) > 0) return inBar.first();

  // Found by attribute, not by accessible name: the name is localised, and this helper runs on
  // both locales' routes.
  await page.locator("[data-menu-toggle]:visible").first().click();
  const inSheet = page.getByRole("dialog").locator("[data-language-switch]:visible");
  await expect(inSheet, "the language switch is not reachable at this width").toHaveCount(1);

  // The sheet slides in (`.sheet-down` in globals.css). Let it arrive before anything in it is
  // measured or tapped: part-way there its offset is fractional, and the 44px switch measured
  // 43.999999px about one run in three.
  await inSheet.first().evaluate((el) =>
    Promise.all(
      (el.closest("dialog") ?? el)
        .getAnimations({ subtree: true })
        .filter((animation) => animation.effect?.getTiming().iterations !== Infinity)
        .map((animation) => animation.finished),
    ),
  );
  return inSheet.first();
}

/** Collect page errors and console errors so a test can assert the page is actually clean. */
export function watchForErrors(page: Page) {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(`pageerror: ${e.message}`));
  page.on("console", (m: ConsoleMessage) => {
    if (m.type() === "error") errors.push(`console: ${m.text()}`);
  });
  return errors;
}

/**
 * Answer the consent dialog so it stops covering the page.
 *
 * Found by attribute, not by accessible name: the banner's buttons are localised, and this helper
 * runs on both locales' routes.
 */
export async function dismissConsent(page: Page) {
  const reject = page.locator("[data-consent-reject]");
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
    // Found by attribute, not by accessible name: the name is localised, and this helper runs on
  // both locales' routes.
  await page.locator("[data-menu-toggle]:visible").first().click();
    await expect(sheet).toBeVisible();
  }
  return sheet;
}

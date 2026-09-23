import { test, expect, type Page } from "@playwright/test";
import { dismissConsent } from "./helpers";

// The desktop Solutions menu opens on hover with hover intent, and stays a keyboard disclosure.
// It only exists at `xl` and up; everything narrower uses the menu sheet instead.
test.describe("the Solutions menu", () => {
  test.beforeEach(async ({ page }, info) => {
    test.skip(info.project.name === "mobile", "desktop navigation only");
    await page.goto("/en", { waitUntil: "networkidle" });
    await dismissConsent(page);
  });

  const panelOpen = (page: Page) =>
    page.evaluate(() => {
      const id = document.querySelector("button[aria-controls][aria-expanded]")?.getAttribute("aria-controls");
      const panel = id ? document.getElementById(id) : null;
      return panel ? getComputedStyle(panel).visibility === "visible" : false;
    });

  test("resting on it opens it, and leaving closes it after a grace period", async ({ page }) => {
    const box = (await page.getByRole("button", { name: "Solutions" }).boundingBox())!;
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await expect.poll(() => panelOpen(page)).toBe(true);

    // Down into a card: the bridge and the grace period keep it open on the way.
    await page.mouse.move(box.x + box.width / 2, box.y + 160, { steps: 8 });
    await page.waitForTimeout(300);
    expect(await panelOpen(page), "it closed on the way down to a card").toBe(true);

    await page.mouse.move(1300, 700, { steps: 4 });
    await expect.poll(() => panelOpen(page)).toBe(false);
  });

  test("sweeping across the header does not flash it open", async ({ page }) => {
    const box = (await page.getByRole("button", { name: "Solutions" }).boundingBox())!;
    await page.mouse.move(box.x - 40, box.y + box.height / 2);
    await page.mouse.move(box.x + box.width + 40, box.y + box.height / 2, { steps: 2 });
    await page.waitForTimeout(250);
    expect(await panelOpen(page)).toBe(false);
  });

  // The panel's wrapper is always in the page, hanging over the hero. Closed, it must not catch
  // the pointer: that would open the menu from the hero and swallow clicks there.
  test("closed, it does not catch the pointer over the page below", async ({ page }) => {
    const box = (await page.getByRole("button", { name: "Solutions" }).boundingBox())!;
    const [x, y] = [box.x + box.width / 2, box.y + 200];
    const inHeader = await page.evaluate(([x, y]) => Boolean(document.elementFromPoint(x, y)?.closest("header")), [x, y]);
    expect(inHeader, "the closed menu is intercepting the pointer over the hero").toBe(false);
    await page.mouse.move(x, y);
    await page.waitForTimeout(400);
    expect(await panelOpen(page)).toBe(false);
  });

  test("the keyboard opens it, walks it, and Escape returns focus", async ({ page }) => {
    const button = page.getByRole("button", { name: "Solutions" });
    await button.focus();
    await page.keyboard.press("Enter");
    await expect.poll(() => panelOpen(page)).toBe(true);

    await page.keyboard.press("Tab");
    await expect(page.getByRole("link", { name: /Homes/ }).first()).toBeFocused();

    await page.keyboard.press("Escape");
    await expect.poll(() => panelOpen(page)).toBe(false);
    await expect(button).toBeFocused();
  });

  test("it offers only what the business sells", async ({ page }) => {
    // The previous site's menu listed Roof Rental, Utility Scale and Industrial.
    const html = await page.locator("header").innerHTML();
    expect(html).not.toMatch(/Roof Rental|Utility Scale|Also available/i);
  });
});

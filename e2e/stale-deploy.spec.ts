import { test, expect, type Page } from "@playwright/test";
import { dismissConsent } from "./helpers";

/*
 * A deploy that lands while a form is open (src/components/quote/stale-resume.ts).
 *
 * Every build gives its Server Actions new IDs, so a page loaded before a deploy posts an ID the
 * new server does not have. On 2026-09-26 that replaced the whole live site with the global error
 * screen when the owner pressed "See my estimate" minutes after a deploy. These tests reproduce it
 * faithfully: the first action request goes out with an ID no build has, exactly what an old page
 * sends to a new one, and the real server answers "Failed to find Server Action".
 *
 * No mail is sent: every quick-quote submit here (the popup and the home page form) is answered with
 * the stale-ID refusal and not sent again after the reload, and so is the calculator form.
 */

const STALE_ACTION_ID = `00${"ab".repeat(20)}`;

/** Rewrite the Server Action ID on the first `count` action requests. */
async function staleActions(page: Page, count = 1) {
  let left = count;
  await page.route("**/*", async (route) => {
    const request = route.request();
    const headers = request.headers();
    if (request.method() === "POST" && headers["next-action"] && left > 0) {
      left -= 1;
      return route.continue({ headers: { ...headers, "next-action": STALE_ACTION_ID } });
    }
    return route.continue();
  });
}

test.describe("a deploy lands while a form is open", () => {
  test("the quote popup reloads, reopens filled in, and asks for the consent tick again", async ({ page }) => {
    await staleActions(page);
    await page.goto("/en", { waitUntil: "networkidle" });
    await dismissConsent(page);

    // In the bar from sm up; below that, inside the mobile menu.
    const inBar = page.getByRole("button", { name: "Get a free quote" }).filter({ visible: true });
    if ((await inBar.count()) === 0) await page.locator("[data-menu-toggle]:visible").first().click();
    await page.getByRole("button", { name: "Get a free quote" }).filter({ visible: true }).first().click();
    const dialog = page.locator("dialog[open]");
    await dialog.locator('input[name="name"]').fill("Asha Rao");
    await dialog.locator('input[name="phone"]').fill("9845012345");
    await dialog.locator('input[name="pincode"]').fill("560001");
    // The chips are styled labels over visually hidden radios; click the input itself, which works
    // at every width and fires the same change event a tap does.
    const tap = (selector: string, index = 0) => dialog.locator(selector).nth(index).evaluate((el: HTMLElement) => el.click());
    await tap('input[name="segment"]', 1);
    await tap('input[name="billBucket"]', 2);
    await tap('input[name="consent"]');
    // The bot check refuses a submit within a few seconds of opening.
    await page.waitForTimeout(3500);

    const reloaded = page.waitForEvent("load");
    await dialog.locator('button[type="submit"]').click();
    await reloaded;

    await expect(page.getByText(/didn.t load properly/)).toHaveCount(0);
    const reopened = page.locator("dialog[open]");
    await expect(reopened).toBeVisible();
    await expect(reopened.getByRole("status").first()).toContainText("The website was just updated");
    await expect(reopened.locator('input[name="name"]')).toHaveValue("Asha Rao");
    await expect(reopened.locator('input[name="phone"]')).toHaveValue("9845012345");
    await expect(reopened.locator('input[name="pincode"]')).toHaveValue("560001");
    await expect(reopened.locator('input[name="segment"]:checked')).toHaveValue("housing-society");
    await expect(reopened.locator('input[name="billBucket"]:checked')).toHaveValue("society-3");
    // Consent boxes are never pre-ticked (DPDP), not even after a recovery.
    await expect(reopened.locator('input[name="consent"]')).not.toBeChecked();
    // The record is used once and removed.
    expect(await page.evaluate(() => sessionStorage.getItem("ie:quick-quote-resume"))).toBeNull();
  });

  test("the home page quote form reloads and comes back filled in, in place, not as the popup", async ({ page }) => {
    await staleActions(page);
    await page.goto("/en", { waitUntil: "networkidle" });
    await dismissConsent(page);

    const band = page.locator("#calculator");
    const form = band.locator("form");
    await form.scrollIntoViewIfNeeded();
    await form.locator('input[name="name"]').fill("Asha Rao");
    await form.locator('input[name="phone"]').fill("9845012345");
    await form.locator('input[name="pincode"]').fill("560001");
    const tap = (selector: string) => form.locator(selector).first().evaluate((el: HTMLElement) => el.click());
    await tap('input[name="segment"][value="commercial"]');
    await tap('input[name="billBucket"][value="business-2"]');
    await tap('input[name="consent"]');
    // The bot check refuses a submit within three seconds of the page loading.
    await page.waitForTimeout(3500);

    const reloaded = page.waitForEvent("load");
    await form.locator('button[type="submit"]').click();
    await reloaded;

    await expect(page.getByText(/didn.t load properly/)).toHaveCount(0);
    // Back in the home page form, with the same notice the popup shows…
    const again = page.locator("#calculator form");
    await expect(again.getByRole("status")).toContainText("The website was just updated");
    await expect(again.locator('input[name="name"]')).toHaveValue("Asha Rao");
    await expect(again.locator('input[name="phone"]')).toHaveValue("9845012345");
    await expect(again.locator('input[name="pincode"]')).toHaveValue("560001");
    await expect(again.locator('input[name="segment"]:checked')).toHaveValue("commercial");
    await expect(again.locator('input[name="billBucket"]:checked')).toHaveValue("business-2");
    await expect(again.locator('input[name="consent"]')).not.toBeChecked();
    // …scrolled back into view…
    await expect.poll(async () => {
      const box = await page.locator("#calculator").boundingBox();
      const height = page.viewportSize()!.height;
      return box !== null && box.y < height && box.y + box.height > 0;
    }).toBe(true);
    // …and the popup stays shut and empty: the enquiry was not made there.
    await expect(page.locator("dialog[open]")).toHaveCount(0);
    expect(await page.locator("dialog form input[name='name']").inputValue()).toBe("");
    expect(await page.evaluate(() => sessionStorage.getItem("ie:quick-quote-resume"))).toBeNull();
  });

  test("the calculator form keeps what was typed and says to refresh", async ({ page }) => {
    await staleActions(page, 99);
    await page.goto("/en/get-quote", { waitUntil: "networkidle" });
    await dismissConsent(page);

    await page.locator("#estimate-pincode").fill("560001");
    await page.locator("#estimate-load").fill("3");
    const form = page.locator("form:has(input[name=email])").first();
    await form.locator('input[name="name"]').fill("Asha Rao");
    await form.locator('input[name="phone"]').fill("9845012345");
    await form.locator('input[name="email"]').fill("asha@example.com");
    await form.locator('input[name="consent"]').check({ force: true });
    await page.waitForTimeout(3500);
    // requestSubmit: the button is disabled on a build without mail credentials.
    await form.evaluate((f: HTMLFormElement) => f.requestSubmit());

    await expect(page.getByText(/didn.t load properly/)).toHaveCount(0);
    await expect(page.getByText("The website was updated while this page was open.")).toBeVisible();
    await expect(form.locator('input[name="name"]')).toHaveValue("Asha Rao");
    await expect(form.locator('input[name="email"]')).toHaveValue("asha@example.com");
  });
});

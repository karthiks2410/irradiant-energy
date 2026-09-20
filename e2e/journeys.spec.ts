import { test, expect } from "@playwright/test";
import { dismissConsent, headerNav, scrollDown, watchForErrors } from "./helpers";

test.describe("navigation", () => {
  test("every header link lands at the top of its page", async ({ page }) => {
    await page.goto("/", { waitUntil: "networkidle" });
    await dismissConsent(page);

    for (const name of ["About", "Calculator", "Contact"]) {
      // Scroll first: Lenis stays in a smooth-scroll state for a moment afterwards and
      // used to swallow the router's scroll-to-top, landing the visitor mid-page.
      await scrollDown(page, 1400);
      await (await headerNav(page)).getByRole("link", { name }).click();
      await page.waitForLoadState("networkidle");
      await page.waitForTimeout(900);
      expect(await page.evaluate(() => window.scrollY), `${name} landed mid-page`).toBeLessThan(80);
      await page.goBack();
      await page.waitForLoadState("networkidle");
    }
  });

  test("the primary call to action reaches the estimator", async ({ page }) => {
    await page.goto("/", { waitUntil: "networkidle" });
    await dismissConsent(page);
    await page.getByRole("link", { name: /get a free estimate/i }).first().click();
    await expect(page).toHaveURL(/\/get-quote/);
    await expect(page.locator("h1")).toBeVisible();
  });

  test("a keyboard visitor can skip to the content", async ({ page }) => {
    // Mobile Safari does not move focus on Tab unless the person has switched on Full
    // Keyboard Access, so tabbing there measures the browser, not the site.
    test.skip(await page.evaluate(() => "ontouchstart" in window), "no Tab navigation on iOS Safari");
    await page.goto("/", { waitUntil: "networkidle" });
    // Answer consent first: the banner takes focus once when it appears, so the first Tab
    // from a fresh load belongs to it, not to the skip link.
    await dismissConsent(page);
    await page.evaluate(() => (document.activeElement as HTMLElement | null)?.blur());

    // Closing the banner hands focus back to the body, and the browser spends the first Tab
    // resetting its starting point — so the skip link is the first *control* reached, not
    // necessarily the first keypress. What matters is that it comes before the header.
    const skip = page.getByRole("link", { name: /skip to content/i });
    for (let i = 0; i < 3 && !(await skip.evaluate((el) => el === document.activeElement)); i++) {
      await page.keyboard.press("Tab");
    }
    await expect(skip, "the skip link is not the first control a keyboard reaches").toBeFocused();
    // It must become visible once focused, not merely exist off-screen.
    expect(await skip.evaluate((el) => el.getBoundingClientRect().top)).toBeGreaterThan(-5);
  });
});

test.describe("estimator", () => {
  test("changing the bill changes the estimate", async ({ page }) => {
    const errors = watchForErrors(page);
    await page.goto("/get-quote", { waitUntil: "networkidle" });
    await dismissConsent(page);

    const slider = page.getByRole("slider").first();
    await expect(slider).toBeVisible();

    const readOutput = () => page.locator("main").innerText();
    const before = await readOutput();

    // Drive the slider from the keyboard: it is the accessible path and it does not
    // depend on where the thumb happens to sit.
    await slider.focus();
    for (let i = 0; i < 12; i++) await page.keyboard.press("ArrowRight");
    await page.waitForTimeout(600);

    const after = await readOutput();
    expect(after, "estimate did not react to the bill").not.toBe(before);
    expect(errors).toEqual([]);
  });

  // The form is deliberately `noValidate` and validated by the Server Action, so that it works
  // without JavaScript and the server stays the single source of truth. So the assertion is not
  // "nothing was posted" — it is that an empty post is rejected, says why, and sends no mail.
  // (The action parses the form before it ever looks at the mail credentials, so an invalid
  // submission cannot reach Resend.)
  test("an empty lead submission is rejected with field errors", async ({ page }) => {
    await page.goto("/get-quote", { waitUntil: "networkidle" });
    await dismissConsent(page);

    const submit = page.getByRole("button", { name: /send|submit|request/i }).last();
    await submit.scrollIntoViewIfNeeded();
    await submit.click();

    const alert = page.getByRole("alert");
    await expect(alert.first(), "an empty form produced no error").toBeVisible({ timeout: 10_000 });
    await expect(page.locator("body")).not.toContainText(/thank you|we.{0,3}ll be in touch/i);

    // Required fields must be marked invalid for assistive technology, not only coloured.
    const invalid = await page.locator("[aria-invalid='true']").count();
    expect(invalid, "no field was marked aria-invalid").toBeGreaterThan(0);
  });
});

test.describe("consent", () => {
  test("refusing loads nothing and the answer can be reopened", async ({ page }) => {
    await page.goto("/", { waitUntil: "networkidle" });
    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();

    const thirdParty: string[] = [];
    page.on("request", (r) => {
      const host = new URL(r.url()).host;
      if (!host.startsWith("localhost")) thirdParty.push(host);
    });

    await page.getByRole("button", { name: /reject/i }).click();
    await expect(dialog).toBeHidden();
    await page.reload({ waitUntil: "networkidle" });
    await expect(page.getByRole("dialog")).toBeHidden();
    expect([...new Set(thirdParty)], "a refused visitor still loaded a third party").toEqual([]);

    // A real link, so it still works without JavaScript; the click handler opens the dialog.
    const reopen = page.getByRole("link", { name: /cookie settings/i });
    await reopen.scrollIntoViewIfNeeded();
    await reopen.click();
    await expect(page.getByRole("dialog")).toBeVisible();
  });
});

test.describe("the banner does not lock the page", () => {
  test("content beside and behind the banner stays clickable and scrollable", async ({ page }) => {
    await page.goto("/", { waitUntil: "networkidle" });
    await expect(page.getByRole("dialog")).toBeVisible();

    const size = page.viewportSize()!;
    // The centring wrapper is full-width. If it takes pointer events, the whole bottom band
    // of every page is dead until the visitor answers.
    for (const x of [24, size.width - 24]) {
      const tag = await page.evaluate(
        ([x, y]) => document.elementFromPoint(x, y)?.tagName ?? "none",
        [x, size.height - 60] as [number, number],
      );
      expect(tag, `the banner wrapper is intercepting clicks at x=${x}`).not.toBe("DIV");
    }

    const before = await page.evaluate(() => window.scrollY);
    await scrollDown(page, 700);
    expect(await page.evaluate(() => window.scrollY), "the page could not scroll").toBeGreaterThan(before);
  });
});

test.describe("reduced motion", () => {
  test.use({ reducedMotion: "reduce" });

  test("the hero does not rotate on its own", async ({ page }) => {
    await page.goto("/", { waitUntil: "networkidle" });
    await dismissConsent(page);
    const first = await page.locator("h1").innerText();
    await page.waitForTimeout(7500);
    expect(await page.locator("h1").innerText(), "hero auto-advanced under reduced motion").toBe(first);
  });
});

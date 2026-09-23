import { test, expect } from "@playwright/test";
import { dismissConsent, headerNav, scrollDown, watchForErrors } from "./helpers";

test.describe("navigation", () => {
  test("every header link lands at the top of its page", async ({ page }) => {
    await page.goto("/en", { waitUntil: "networkidle" });
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
    await page.goto("/en", { waitUntil: "networkidle" });
    await dismissConsent(page);
    await page.getByRole("link", { name: /get a free estimate/i }).first().click();
    await expect(page).toHaveURL(/\/get-quote/);
    await expect(page.locator("h1")).toBeVisible();
  });

  test("a keyboard visitor can skip to the content", async ({ page }) => {
    // Mobile Safari does not move focus on Tab unless the person has switched on Full
    // Keyboard Access, so tabbing there measures the browser, not the site.
    test.skip(await page.evaluate(() => "ontouchstart" in window), "no Tab navigation on iOS Safari");
    await page.goto("/en", { waitUntil: "networkidle" });
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
    await page.goto("/en/get-quote", { waitUntil: "networkidle" });
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
  // Sending is switched off while the email domain is unverified, so this covers both states:
  // with it off the button must be disabled and say why, and with it on an empty submission must
  // be rejected rather than reaching anyone.
  test("an empty submission cannot reach anyone", async ({ page }) => {
    test.slow();
    await page.goto("/en/get-quote", { waitUntil: "networkidle" });
    await dismissConsent(page);

    const submit = page.getByRole("button", { name: /send my request/i });
    await submit.scrollIntoViewIfNeeded();

    if (await submit.isDisabled()) {
      await expect(page.getByText(/sending is switched off/i)).toBeVisible();
      // The calculator is a different component and must be unaffected by this.
      await expect
        .poll(async () => /₹[\d,]{5,}/.test(await page.locator("main").innerText()), { timeout: 8_000 })
        .toBe(true);
      return;
    }

    // The form has a 3s minimum fill time to catch bots that post instantly.
    await page.waitForTimeout(3_500);
    await submit.click();

    const alert = page.getByRole("alert");
    await expect(alert.first(), "an empty form produced no error").toBeVisible({ timeout: 10_000 });
    await expect(page.locator("body")).not.toContainText(/thank you|we.{0,3}ll be in touch/i);

    // Three guards can legitimately answer: validation, the bot-speed check and the per-IP rate
    // limiter. Field marking is asserted only when validation's own message says it answered.
    const said = await alert.first().innerText();
    if (said.includes("Please check the highlighted fields")) {
      const invalid = await page.locator("[aria-invalid='true']").count();
      expect(invalid, `no field was marked aria-invalid; the form said: ${said}`).toBeGreaterThan(0);
    }
  });
});

test.describe("the estimate counts to its new value", () => {
  /** Drive the bill up and sample the figure the visitor actually sees, frame by frame. */
  async function sampleWhileChanging(page: import("@playwright/test").Page) {
    await page.goto("/en/get-quote", { waitUntil: "networkidle" });
    await dismissConsent(page);
    // No PIN: the figures are there from the bill alone.
    await expect(page.getByText(/annual savings/i).first()).toBeVisible();

    const shown = () =>
      page.evaluate(() => {
        const tile = [...document.querySelectorAll("li")].find((l) => l.textContent?.includes("Annual savings"));
        return {
          moving: tile?.querySelector("[aria-hidden='true']")?.textContent ?? "",
          target: tile?.querySelector(".sr-only")?.textContent ?? "",
        };
      });

    const slider = page.getByRole("slider").first();
    await slider.focus();
    for (let i = 0; i < 15; i++) await page.keyboard.press("ArrowRight");

    const frames = [];
    for (let i = 0; i < 12; i++) {
      frames.push(await shown());
      await page.waitForTimeout(60);
    }
    return { frames, shown };
  }

  test("the figure travels rather than cutting, and lands on the real number", async ({ page }) => {
    test.slow();
    const { frames, shown } = await sampleWhileChanging(page);

    // More than a couple of distinct readings means it counted rather than jumped.
    const distinct = new Set(frames.map((f) => f.moving));
    expect(distinct.size, "the figure cut straight to its new value").toBeGreaterThan(3);

    // A money figure must never show more than the real one on the way.
    const asNumber = (s: string) => Number(s.replace(/[^0-9.]/g, ""));
    for (const f of frames) {
      if (!f.moving || !f.target) continue;
      expect(asNumber(f.moving), `overshot past ${f.target}`).toBeLessThanOrEqual(asNumber(f.target));
    }

    await expect
      .poll(async () => { const s = await shown(); return s.moving === s.target; }, { timeout: 5_000 })
      .toBe(true);
  });

  test.describe("under reduced motion", () => {
    test.use({ reducedMotion: "reduce" });

    test("the figure is set outright", async ({ page }) => {
      test.slow();
      const { frames } = await sampleWhileChanging(page);
      // The estimate itself may legitimately change more than once while the slider is driven,
      // so the property is not "one value" — it is that the figure on screen is never an
      // in-between one. It always equals the settled value.
      const inBetween = frames.filter((f) => f.moving && f.target && f.moving !== f.target);
      expect(inBetween, "the figure animated despite a reduced-motion preference").toEqual([]);
    });
  });
});

test.describe("the hero starts the estimate", () => {
  test("the hero form seeds the calculator and lands on real figures", async ({ page }) => {
    test.slow();
    await page.goto("/en", { waitUntil: "networkidle" });
    await dismissConsent(page);

    // `.last()` because the hero reserves its tallest scene with a hidden, inert copy of the
    // same markup; the live form is the second one in the DOM.
    const form = page.locator("form").filter({ has: page.getByRole("button", { name: /see my estimate/i }) }).last();
    await form.getByLabel(/monthly electricity bill/i).fill("9000");
    await form.getByRole("button", { name: /see my estimate/i }).click();

    await expect(page).toHaveURL(/#calculator/);

    const tiles = page.locator("#calculator li");
    await expect(tiles.first()).toBeVisible();
    // The bill typed in the hero must be the bill the calculator used, so the figures are the
    // visitor's own rather than the default.
    await expect
      .poll(async () => (await page.locator("#calculator").innerText()).includes("—"), { timeout: 8_000 })
      .toBe(false);
    const shown = await page.locator("#calculator").innerText();
    expect(shown, "the calculator is still showing its empty state").toMatch(/₹[\d,]{5,}/);
  });

});

test.describe("the estimate does not wait for a PIN code", () => {
  // The PIN used to gate the figures on the grounds that it decided the tariffs. It does not:
  // every tariff and yield constant is statewide, so it only narrows the caveat. Both
  // calculators must behave the same way about it.
  for (const [where, path] of [
    ["the calculator page", "/en/get-quote"],
    ["the home page band", "/en#calculator"],
  ] as const) {
    test(`${where} shows figures from the bill alone, and names the tariff it assumed`, async ({ page }) => {
      await page.goto(path, { waitUntil: "networkidle" });
      await dismissConsent(page);

      const scope = page.locator(path.includes("#") ? "#calculator" : "main");
      await expect
        .poll(async () => /₹[\d,]{5,}/.test(await scope.innerText()), { timeout: 8_000 })
        .toBe(true);

      // Untouched, it must say which tariffs it used rather than leaving that unsaid.
      await expect(scope.getByText(/Karnataka \(BESCOM\) tariffs/i).first()).toBeVisible();
    });
  }

  test("a Bengaluru PIN removes the assumption, a Mysuru one changes it", async ({ page }) => {
    test.slow();
    await page.goto("/en/get-quote", { waitUntil: "networkidle" });
    await dismissConsent(page);
    const main = page.locator("main");

    await page.getByLabel(/pin code/i).first().fill("562106");
    await expect(main.getByText(/Karnataka \(BESCOM\) tariffs/i)).toHaveCount(0);

    await page.getByLabel(/pin code/i).first().fill("570001");
    await expect(main.getByText(/may be served by another supplier/i).first()).toBeVisible();
  });
});

test.describe("consent", () => {
  test("refusing loads nothing and the answer can be reopened", async ({ page }) => {
    await page.goto("/en", { waitUntil: "networkidle" });
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

test.describe("the consent banner holds the page", () => {
  // Owner direction, 2026-09-20, reversing the earlier behaviour: the page does not move until
  // the visitor answers. Three mechanisms have to agree — `overflow: hidden` on <html>, Lenis
  // stopping its own loop, and the rest of the document going inert — and each has its own way
  // of silently not applying, so this drives real input rather than reading a class.
  test("the page will not scroll until the visitor answers", async ({ page }) => {
    test.slow();
    await page.goto("/en", { waitUntil: "networkidle" });
    await expect(page.getByRole("dialog")).toBeVisible();

    const size = page.viewportSize()!;
    const scrollY = () => page.evaluate(() => Math.round(window.scrollY));

    await page.mouse.move(size.width / 2, size.height / 3);
    await page.mouse.wheel(0, 900).catch(() => {});
    await page.waitForTimeout(900);
    expect(await scrollY(), "the wheel moved the page while consent was unanswered").toBe(0);

    await page.keyboard.press("End");
    await page.waitForTimeout(600);
    expect(await scrollY(), "the keyboard moved the page while consent was unanswered").toBe(0);

    // Inert as well as unscrollable: tabbing into a page that cannot move is worse than either.
    const inert = await page.evaluate(() =>
      ["main", "header", "footer"].map((selector) => document.querySelector(selector)?.hasAttribute("inert") ?? false),
    );
    expect(inert, "the page behind the banner was still reachable").toEqual([true, true, true]);
  });

  test("answering releases it", async ({ page }) => {
    test.slow();
    await page.goto("/en", { waitUntil: "networkidle" });
    await page.getByRole("button", { name: /reject/i }).click();
    await expect(page.getByRole("dialog")).toBeHidden();

    expect(await page.evaluate(() => document.documentElement.hasAttribute("data-scroll-locked"))).toBe(false);
    await scrollDown(page, 900);
    expect(await page.evaluate(() => Math.round(window.scrollY)), "the page was still held after an answer").toBeGreaterThan(0);
  });
});

test.describe("reduced motion", () => {
  test.use({ reducedMotion: "reduce" });

  test("the hero does not rotate on its own", async ({ page }) => {
    await page.goto("/en", { waitUntil: "networkidle" });
    await dismissConsent(page);
    const first = await page.locator("h1").innerText();
    await page.waitForTimeout(7500);
    expect(await page.locator("h1").innerText(), "hero auto-advanced under reduced motion").toBe(first);
  });
});

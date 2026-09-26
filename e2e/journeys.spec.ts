import { test, expect, type Page } from "@playwright/test";
import { dismissConsent, headerNav, scrollDown, watchForErrors } from "./helpers";

/*
 * The calculators since the redesign (#14): nothing is computed until the sanctioned load from the
 * electricity bill is in. It caps the system size and there is no fallback without it, so until
 * then every tile reads ₹0. The PIN code stays optional. A rupee figure of five or more characters
 * ("₹3,063") is how these tests tell a real estimate from those placeholders.
 */
const REAL_FIGURE = /₹[\d,]{5,}/;

/**
 * Well above what the default bills need, so the size follows the bill rather than stopping at the
 * load cap, and moving the bill moves every figure.
 */
const AMPLE_LOAD_KW = "10";

/**
 * The /get-quote panel the figures are printed in, and nothing else. The bill slider's own readout
 * ("₹3,500") sits in the same <main>, so a check scoped to the page passes on what the visitor set
 * rather than on anything the estimate produced.
 */
const quoteResults = (page: Page) => page.locator("main [data-surface='dark']").filter({ has: page.locator("h1") });

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

    const results = quoteResults(page);
    await page.getByLabel(/sanctioned load/i).fill(AMPLE_LOAD_KW);
    await expect(results).toContainText(REAL_FIGURE);

    const slider = page.getByRole("slider").first();
    await expect(slider).toBeVisible();

    // The results panel only, never <main>: the slider's own readout changes with every step, so
    // reading the whole page would pass even if the estimate ignored the bill.
    const before = await results.innerText();

    // Drive the slider from the keyboard: it is the accessible path and it does not
    // depend on where the thumb happens to sit.
    await slider.focus();
    for (let i = 0; i < 12; i++) await page.keyboard.press("ArrowRight");

    await expect.poll(() => results.innerText(), { message: "estimate did not react to the bill" }).not.toBe(before);
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
      await page.getByLabel(/sanctioned load/i).fill(AMPLE_LOAD_KW);
      await expect(quoteResults(page)).toContainText(REAL_FIGURE, { timeout: 8_000 });
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
  const SAVINGS = "Monthly savings";

  type Reading = {
    /** Whether an animation is driving the figure at all. */
    counting: boolean;
    /** The digits that count, hidden from assistive tech. */
    moving: string;
    /** The settled value printed beside them for screen readers. */
    target: string;
    /** Everything the tile prints after its label. */
    figure: string;
  };
  type Recorder = { read: () => Reading; frames: Reading[] };

  /**
   * Puts a recorder on the page: `read()` reads the tile now, and `frames` gains a reading on every
   * animation frame from this moment on. Recording in the page, rather than once per round trip from
   * the test runner, is what keeps a busy machine from missing the very frames these tests are about:
   * a round trip there can outlast the whole 0.9 s count. It runs in the page, so it stays
   * self-contained; Playwright ships its source there.
   */
  function installRecorder(label: string) {
    const read = () => {
      const tile = [...document.querySelectorAll("main li")].find((l) => l.textContent?.includes(label));
      const counter = tile?.querySelector("[aria-hidden='true']");
      return {
        counting: counter != null,
        moving: counter?.textContent ?? "",
        target: tile?.querySelector(".sr-only")?.textContent ?? "",
        figure: (tile?.textContent ?? "").replace(label, ""),
      };
    };
    const recorder = { read, frames: [] as ReturnType<typeof read>[] };
    const tick = () => {
      recorder.frames.push(read());
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
    (window as unknown as { tileRecorder: typeof recorder }).tileRecorder = recorder;
  }

  /**
   * Drive the bill up, recording the figure the visitor actually sees on every frame. `steps` is
   * what the tile reads straight after each step, which under reduced motion is each step's
   * settled figure.
   */
  async function driveTheBill(page: Page) {
    await page.goto("/en/get-quote", { waitUntil: "networkidle" });
    await dismissConsent(page);
    // No PIN: the bill and the sanctioned load are all the figures need.
    await page.getByLabel(/sanctioned load/i).fill(AMPLE_LOAD_KW);
    await expect(page.locator("main li").filter({ hasText: SAVINGS })).toContainText(REAL_FIGURE);

    await page.evaluate(installRecorder, SAVINGS);
    // Written out in each call: these run in the page, where nothing from this file exists.
    const shown = () => page.evaluate(() => (window as unknown as { tileRecorder: Recorder }).tileRecorder.read());
    const frames = () => page.evaluate(() => (window as unknown as { tileRecorder: Recorder }).tileRecorder.frames);
    const before = await shown();

    const slider = page.getByRole("slider").first();
    await slider.focus();
    const steps: string[] = [];
    for (let i = 0; i < 15; i++) {
      await page.keyboard.press("ArrowRight");
      steps.push((await shown()).figure);
    }
    return { before, steps, shown, frames };
  }

  test("the figure travels rather than cutting, and lands on the real number", async ({ page }) => {
    test.slow();
    const { before, steps, shown, frames } = await driveTheBill(page);

    // It lands on the real number. Recording carries on until then, so the frames below hold the
    // whole journey.
    await expect
      .poll(async () => { const s = await shown(); return s.counting && s.moving === s.target; }, { timeout: 10_000 })
      .toBe(true);
    const journey = await frames();

    // Counting means showing figures that are NOT a settled value. Each of the 15 steps settles on
    // its own estimate, so counting distinct readings would pass for a ticker that cuts straight
    // from one settled figure to the next (the independent check proved it). What only a counting
    // figure shows is readings in between: values no step and no target ever settled on.
    const settled = new Set(
      [before.figure, before.target, ...steps, ...journey.map((f) => f.target)].filter(Boolean),
    );
    const inBetween = [...new Set(journey.map((f) => f.moving))].filter((m) => m && !settled.has(m));
    expect(inBetween.length, "the figure cut straight to its new value").toBeGreaterThan(2);

    // A money figure must never show more than the real one on the way.
    const asNumber = (s: string) => Number(s.replace(/[^0-9.]/g, ""));
    for (const f of journey) {
      if (!f.moving || !f.target) continue;
      expect(asNumber(f.moving), `overshot past ${f.target}`).toBeLessThanOrEqual(asNumber(f.target));
    }
  });

  test.describe("under reduced motion", () => {
    test.use({ reducedMotion: "reduce" });

    test("the figure is set outright", async ({ page }) => {
      test.slow();
      const { before, steps, shown, frames } = await driveTheBill(page);
      // Longer than a count would take (TICKER_DURATION, 0.9 s), so one would have shown by now.
      await page.waitForTimeout(1_200);
      const journey = await frames();

      // Moving the bill has to have changed the figure, or none of this proves anything.
      const final = (await shown()).figure;
      expect(final, "moving the bill did not change the figure").not.toBe(before.figure);

      // Nothing drives the figure: TickerNumber prints plain text under this preference, so there
      // is no counting copy of it at any point.
      expect(journey.filter((f) => f.counting), "the figure animated despite a reduced-motion preference").toEqual([]);

      // Each step may legitimately change the estimate, so the figure may take several values. What
      // it may never show is one in between: every frame holds a figure some step settled on.
      const settled = new Set([before.figure, ...steps, final]);
      const inBetween = [...new Set(journey.map((f) => f.figure))].filter((figure) => !settled.has(figure));
      expect(inBetween, "an in-between figure was shown").toEqual([]);
    });
  });
});

test.describe("the hero starts the estimate", () => {
  test("the hero form seeds the calculator, which gives figures for that bill", async ({ page }) => {
    test.slow();
    await page.goto("/en", { waitUntil: "networkidle" });
    await dismissConsent(page);

    // `.last()` because the hero reserves its tallest scene with a hidden, inert copy of the
    // same markup; the live form is the second one in the DOM.
    const form = page.locator("form").filter({ has: page.getByRole("button", { name: /see my estimate/i }) }).last();
    await form.getByLabel(/monthly electricity bill/i).fill("9000");
    await form.getByRole("button", { name: /see my estimate/i }).click();

    await expect(page).toHaveURL(/#calculator/);

    // The bill typed in the hero must be the bill the calculator uses, so the figures are the
    // visitor's own rather than the default.
    const calculator = page.locator("#calculator");
    const bill = calculator.getByLabel(/monthly electricity bill/i);
    await expect(bill).toHaveValue("9000");

    // The hero asks for the bill only; the sanctioned load is the one more thing the figures need.
    await calculator.getByLabel(/sanctioned load/i).fill(AMPLE_LOAD_KW);
    const savings = calculator.locator("li").filter({ hasText: "Monthly savings" });
    await expect(savings, "the calculator is still showing its empty state").toContainText(REAL_FIGURE, {
      timeout: 8_000,
    });

    // And they are that bill's figures: the default bill gives different ones. Read the settled
    // value, not the digits that count towards it.
    const settled = () => savings.evaluate((tile) => (tile.querySelector(".sr-only") ?? tile).textContent ?? "");
    const forHeroBill = await settled();
    await bill.fill("3500");
    await expect.poll(settled, { message: "the figures ignored the bill the hero seeded" }).not.toBe(forHeroBill);
  });
});

test.describe("the estimate does not wait for a PIN code", () => {
  // The PIN used to gate the figures on the grounds that it decided the tariffs. It does not:
  // every tariff and yield constant is statewide, so it only narrows the caveat. Both
  // calculators must behave the same way about it. What they do wait for, since the redesign
  // (#14), is the sanctioned load.
  for (const [where, path] of [
    ["the calculator page", "/en/get-quote"],
    ["the home page band", "/en#calculator"],
  ] as const) {
    test(`${where} shows figures from the bill and sanctioned load, and names the tariff it assumed`, async ({ page }) => {
      await page.goto(path, { waitUntil: "networkidle" });
      await dismissConsent(page);

      const home = path.includes("#");
      const controls = page.locator(home ? "#calculator" : "main");
      const results = home ? page.locator("#calculator") : quoteResults(page);

      // Nothing is computed until the sanctioned load is in: the tiles hold their ₹0 placeholders.
      await expect(results).not.toContainText(REAL_FIGURE);

      await controls.getByLabel(/sanctioned load/i).fill("5");
      await expect(results).toContainText(REAL_FIGURE, { timeout: 8_000 });
      await expect(controls.getByLabel(/pin code/i)).toHaveValue("");

      // Untouched, it must say which tariffs it used rather than leaving that unsaid.
      await expect(results.getByText(/Karnataka \(BESCOM\) tariffs/i).first()).toBeVisible();
    });
  }

  test("a Bengaluru PIN removes the assumption, a Mysuru one changes it", async ({ page }) => {
    test.slow();
    await page.goto("/en/get-quote", { waitUntil: "networkidle" });
    await dismissConsent(page);
    const results = quoteResults(page);

    await page.getByLabel(/sanctioned load/i).fill("5");
    // Without a PIN the assumption is stated, so its disappearance below means something.
    await expect(results.getByText(/Karnataka \(BESCOM\) tariffs/i).first()).toBeVisible();

    await page.getByLabel(/pin code/i).first().fill("562106");
    await expect(results.getByText(/Karnataka \(BESCOM\) tariffs/i)).toHaveCount(0);
    await expect(results).toContainText(REAL_FIGURE);

    await page.getByLabel(/pin code/i).first().fill("570001");
    await expect(results.getByText(/may be served by another supplier/i).first()).toBeVisible();
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

import { test, expect, type Locator, type Page } from "@playwright/test";
import { dismissConsent, languageSwitch, watchForErrors } from "./helpers";

/**
 * The bilingual contract: the URLs, the language the document claims to be, the switch between
 * them, and the promise that an English page never pays for Kannada.
 */

/** Requests for a font file, by filename. */
function watchFonts(page: Page) {
  const fonts: string[] = [];
  page.on("request", (request) => {
    if (/\.woff2?($|\?)/.test(request.url())) fonts.push(request.url().split("/").pop() ?? request.url());
  });
  return fonts;
}

const isKannadaFont = (name: string) => /kannada/i.test(name);

/**
 * Tap the switch and wait for the page it leads to.
 *
 * The switch slides its thumb across before it changes the page (SLIDE_MS in LanguageSwitch.tsx),
 * and the network is idle for that whole slide. So waiting for "networkidle" straight after the tap
 * returns at once, with the old page still showing: wait for the new URL first, and only then for
 * the new page to settle. Settling matters to the next tap: leaving while the page's own link
 * prefetches are in flight makes WebKit log each cancelled one as an error.
 */
async function flip(page: Page, link: Locator, pathname: string) {
  await link.click();
  await page.waitForURL((url) => url.pathname === pathname);
  await page.waitForLoadState("networkidle");
}

test.describe("URLs", () => {
  test("the bare origin sends you to English", async ({ page }) => {
    const response = await page.goto("/");
    expect(response?.status()).toBe(200);
    expect(new URL(page.url()).pathname).toBe("/en");
  });

  test("the URLs the old site published still resolve, into the English tree", async ({ page }) => {
    // These are links that exist in the world already: the site shipped unprefixed paths before
    // this change, and the legacy map in next.config.ts points at the old site's shapes.
    for (const [from, to] of [
      ["/about", "/en/about"],
      ["/get-quote", "/en/get-quote"],
      ["/solutions/solar", "/en/solutions"],
      ["/solutions/solar/industrial/anything", "/en/solutions/solar/commercial"],
    ] as const) {
      const response = await page.goto(from);
      expect(response?.status(), `${from} status`).toBe(200);
      expect(new URL(page.url()).pathname, `${from} landed`).toBe(to);
    }
  });

  test("a URL that matches no route gets the branded 404, not a blank shell", async ({ page }) => {
    const response = await page.goto("/xyz-does-not-exist");
    expect(response?.status()).toBe(404);
    // Server-rendered, not painted in by the client after an error shell.
    await expect(page.locator("h1")).toHaveText(/can.t find that page/i);
    await expect(page.locator("html")).toHaveAttribute("lang", "en");
  });

  test("a locale that does not exist is a 404, and so is an unknown segment", async ({ page }) => {
    for (const path of ["/fr", "/fr/about", "/fr/get-quote", "/en/solutions/solar/nope"]) {
      const response = await page.goto(path);
      expect(response?.status(), `${path} status`).toBe(404);
    }
  });
});

test.describe("the document declares its language", () => {
  test("English pages are lang=en and Kannada pages are lang=kn", async ({ page }) => {
    await page.goto("/en/about", { waitUntil: "networkidle" });
    await expect(page.locator("html")).toHaveAttribute("lang", "en");

    await page.goto("/kn/about", { waitUntil: "networkidle" });
    await expect(page.locator("html")).toHaveAttribute("lang", "kn");
  });

  test("each page points at its counterpart with hreflang", async ({ page }) => {
    await page.goto("/en/solutions/solar/home", { waitUntil: "networkidle" });
    await expect(page.locator('link[rel="alternate"][hreflang="kn-IN"]')).toHaveAttribute(
      "href",
      /\/kn\/solutions\/solar\/home$/,
    );
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", /\/en\/solutions\/solar\/home$/);
  });
});

test.describe("the EN / ಕನ್ನಡ switch", () => {
  test("it offers the other language and marks the current one", async ({ page }) => {
    await page.goto("/en/about", { waitUntil: "networkidle" });
    await dismissConsent(page);
    const group = await languageSwitch(page);

    // The language you are already in is not a link, and says so to assistive tech.
    await expect(group.locator('[aria-current="true"]')).toHaveText("EN");

    const other = group.getByRole("link");
    await expect(other).toHaveCount(1);
    await expect(other).toHaveText("ಕನ್ನಡ");
    await expect(other).toHaveAttribute("hreflang", "kn-IN");
    await expect(other).toHaveAttribute("lang", "kn");
    await expect(other).toHaveAttribute("href", "/kn/about");
  });

  test("it is a plain anchor, because next/link would prefetch Kannada onto an English page", async ({ page }) => {
    await page.goto("/en", { waitUntil: "networkidle" });
    await dismissConsent(page);
    const link = (await languageSwitch(page)).getByRole("link");
    // next/link marks its anchors for the router; a plain <a> has no such attribute.
    await expect(link).not.toHaveAttribute("data-prefetch", /.*/);
    await expect(link).toHaveAttribute("href", "/kn");
  });

  test("it lands on the same page in the other language, and back again", async ({ page }) => {
    const errors = watchForErrors(page);
    await page.goto("/en/solutions/solar/housing-society", { waitUntil: "networkidle" });
    await dismissConsent(page);

    await flip(page, (await languageSwitch(page)).getByRole("link"), "/kn/solutions/solar/housing-society");
    await expect(page.locator("html")).toHaveAttribute("lang", "kn");

    await flip(page, (await languageSwitch(page)).getByRole("link"), "/en/solutions/solar/housing-society");
    await expect(page.locator("html")).toHaveAttribute("lang", "en");
    expect(errors, "switching language logged an error").toEqual([]);
  });

  test("it keeps the place you were reading", async ({ page }) => {
    await page.goto("/en/contact#grievance", { waitUntil: "networkidle" });
    await dismissConsent(page);

    const link = (await languageSwitch(page)).getByRole("link");
    // The href itself carries the hash, so it survives a middle-click or JavaScript being off.
    await expect(link).toHaveAttribute("href", "/kn/contact#grievance");

    await flip(page, link, "/kn/contact");
    expect(new URL(page.url()).hash).toBe("#grievance");
  });

  test("it carries the segment and drops personal data from the query", async ({ page }) => {
    // Legacy redirects forward the old site's query strings, which are known to carry a name,
    // a phone number and an email from quote emails. None of that may be copied onto a new URL.
    await page.goto("/en/get-quote?segment=commercial&name=Asha&phone=9845794343&email=a%40b.c", {
      waitUntil: "networkidle",
    });
    await dismissConsent(page);

    const link = (await languageSwitch(page)).getByRole("link");
    await expect(link).toHaveAttribute("href", "/kn/get-quote?segment=commercial");

    await flip(page, link, "/kn/get-quote");
    const url = new URL(page.url());
    expect(url.searchParams.get("segment")).toBe("commercial");
    for (const key of ["name", "phone", "email"]) {
      expect(url.searchParams.has(key), `${key} was carried across the language change`).toBe(false);
    }
    // Not page.content(): the site publishes its own number, so the string is on every page.
    // What must not happen is the visitor's values reappearing in the URL or in the form.
    expect(url.search).toBe("?segment=commercial");
    const name = page.getByLabel(/your name/i).first();
    if (await name.isVisible().catch(() => false)) expect(await name.inputValue()).toBe("");
  });

  test("a phone visitor can reach it, in the menu sheet", async ({ page }, info) => {
    test.skip(info.project.name !== "mobile", "this is the phone-width promise");
    await page.goto("/en", { waitUntil: "networkidle" });
    await dismissConsent(page);

    // Nothing in the bar at this width…
    await expect(page.locator("header [data-language-switch]:visible")).toHaveCount(0);
    // …so it has to be in the sheet, which is what languageSwitch() proves by finding it there.
    const group = await languageSwitch(page);
    await expect(page.getByRole("dialog")).toBeVisible();
    await expect(group.getByRole("link")).toHaveAttribute("href", "/kn");
  });

  test("the tap target is at least 44px", async ({ page }) => {
    await page.goto("/en", { waitUntil: "networkidle" });
    await dismissConsent(page);
    const box = await (await languageSwitch(page)).getByRole("link").boundingBox();
    expect(box?.height ?? 0).toBeGreaterThanOrEqual(44);
  });
});

test.describe("the home page quote form speaks Kannada on /kn", () => {
  test("its questions, its link and its checks are in Kannada", async ({ page }, info) => {
    const errors = watchForErrors(page);
    await page.goto("/kn", { waitUntil: "networkidle" });
    await dismissConsent(page);
    const band = page.locator("#calculator");
    const form = band.locator("form");
    await form.scrollIntoViewIfNeeded();

    await expect(band.locator("h2")).toHaveText("ನಿಮ್ಮ ಮನೆ ಅಥವಾ ಕಟ್ಟಡಕ್ಕೆ ಸರಿಯಾದ ಸೋಲಾರ್ ವ್ಯವಸ್ಥೆಯ ಅಂದಾಜು ಪಡೆಯಿರಿ.");
    await expect(band).toContainText("ಉಚಿತ ಸ್ಥಳ ಭೇಟಿ. ಉಚಿತ ಕೊಟೇಷನ್. ಯಾವುದೇ ಒತ್ತಾಯವಿಲ್ಲ.");
    await expect(band.getByRole("link", { name: "ವಿವರವಾದ ಕ್ಯಾಲ್ಕುಲೇಟರ್ ಬೇಕೇ?" })).toHaveAttribute("href", "/kn/get-quote");
    // The popup's own Kannada labels: one copy of the words for both surfaces.
    await expect(form.getByLabel("ಹೆಸರು")).toBeVisible();
    await expect(form.getByLabel("WhatsApp ಸಂಖ್ಯೆ")).toBeVisible();
    await expect(form.getByText("ತಿಂಗಳ ವಿದ್ಯುತ್ ಬಿಲ್")).toBeVisible();
    // The property chip is a house, not "Homepage" (the COLLISIONS entry in build-kn-content.ts).
    await expect(form.locator("label", { has: page.locator('input[value="home"]') })).toHaveText("ಮನೆ");

    // The checks answer in Kannada too, and nothing is posted.
    await form.getByRole("button", { name: "ನನ್ನ ಅಂದಾಜು ತೋರಿಸಿ" }).click();
    await expect(form.locator('input[name="name"]')).toBeFocused();
    await expect(form.locator('[aria-invalid="true"]').first()).toBeVisible();
    await expect(form.getByText("ನಿಮ್ಮ ಹೆಸರು ನಮೂದಿಸಿ")).toBeVisible();
    const said = await form.locator("p.text-error").allInnerTexts();
    expect(said, "one message per unanswered question").toHaveLength(5);
    expect(said.join(" "), "an error message is still in English").not.toMatch(/[A-Za-z]{4,}/);

    // No sideways scroll from Kannada-length chips or labels at this width.
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow, `${info.project.name}: horizontal overflow`).toBeLessThanOrEqual(1);
    expect(errors).toEqual([]);
  });

  // Local dry run only (see journeys.spec.ts, "a home page enquiry, on a local dry run").
  test("a dry-run enquiry answers in Kannada", async ({ page }, info) => {
    test.skip(process.env.E2E_LEAD_DRY_RUN !== "1", "needs a local dev server with LEAD_DRY_RUN=1");
    test.skip(!/^http:\/\/localhost:\d+$/.test(process.env.E2E_BASE_URL ?? ""), "local servers only");
    // One submission is enough for the language; the dry run shares the per-visitor rate limit.
    test.skip(info.project.name !== "desktop", "desktop only, to stay inside the rate limit");
    test.slow();
    await page.goto("/kn", { waitUntil: "networkidle" });
    await dismissConsent(page);
    const band = page.locator("#calculator");
    const form = band.locator("form");
    await form.scrollIntoViewIfNeeded();
    await form.locator('input[name="name"]').fill("ಆಶಾ ರಾವ್");
    await form.locator('input[name="phone"]').fill("9845012345");
    await form.locator('input[name="pincode"]').fill("560001");
    await form.locator('input[name="segment"][value="commercial"]').evaluate((el: HTMLElement) => el.click());
    await form.locator('input[name="billBucket"][value="business-2"]').evaluate((el: HTMLElement) => el.click());
    await form.locator('input[name="consent"]').evaluate((el: HTMLElement) => el.click());
    await page.waitForTimeout(3500);
    await form.getByRole("button", { name: "ನನ್ನ ಅಂದಾಜು ತೋರಿಸಿ" }).click();

    const result = band.locator("[data-track-location='result']");
    await expect(result.getByRole("heading", { name: "ನಿಮ್ಮ ಅಂದಾಜು" })).toBeVisible({ timeout: 15_000 });
    // Businesses get no PM Surya Ghar subsidy, said in Kannada, not as ₹0.
    await expect(result).toContainText("ವ್ಯಾಪಾರ ಸಂಸ್ಥೆಗಳಿಗೆ ಇಲ್ಲ");
    await expect(result.getByLabel("ಪೂರ್ತಿ ಲೆಕ್ಕವನ್ನು ನನಗೆ ಇಮೇಲ್ ಮಾಡಿ")).toBeVisible();
  });
});

test.describe("Kannada costs English nothing", () => {
  for (const route of ["/en", "/en/about", "/en/get-quote"]) {
    test(`${route} downloads no Kannada font`, async ({ page }) => {
      const fonts = watchFonts(page);
      await page.goto(route, { waitUntil: "networkidle" });
      await dismissConsent(page);
      // The page renders "ಕನ್ನಡ" in the switch. It must come from the system Kannada stack, so the
      // webfont is declared but never referenced, and never fetched.
      await expect(page.getByText("ಕನ್ನಡ").first()).toHaveCount(1);
      expect(fonts.filter(isKannadaFont), `${route} fetched a Kannada font`).toEqual([]);
    });
  }

  test("a Kannada page does load it, so the check above means something", async ({ page }) => {
    const fonts = watchFonts(page);
    await page.goto("/kn/about", { waitUntil: "networkidle" });
    expect(fonts.filter(isKannadaFont).length).toBeGreaterThan(0);
  });
});

test.describe("Kannada typography", () => {
  test("the tokens that break Kannada are overridden, and win", async ({ page }) => {
    // The previous :lang(kn) rule sat in @layer base and lost to the utilities, so none of this
    // took effect: an eyebrow still computed 0.2em of tracking and UPPERCASE.
    await page.goto("/kn/about", { waitUntil: "networkidle" });
    const computed = await page.evaluate(() => {
      const ratio = (el: Element | null) =>
        el ? +(parseFloat(getComputedStyle(el).lineHeight) / parseFloat(getComputedStyle(el).fontSize)).toFixed(2) : null;
      const eyebrow = document.querySelector(".font-label");
      const h1 = document.querySelector("h1");
      return {
        eyebrowSpacing: eyebrow ? getComputedStyle(eyebrow).letterSpacing : null,
        eyebrowCase: eyebrow ? getComputedStyle(eyebrow).textTransform : null,
        h1Leading: ratio(h1),
        h1Weight: h1 ? getComputedStyle(h1).fontWeight : null,
      };
    });
    expect(computed.eyebrowSpacing).toBe("normal");
    expect(computed.eyebrowCase).toBe("none");
    // Kannada ink is ~1.27em per line; at the English 1.08 the lines overlap.
    expect(computed.h1Leading).toBe(1.35);
    // The site's 800 maps to 700: Kannada at the same weight reads darker than Latin.
    expect(computed.h1Weight).toBe("700");
  });

  test("English keeps its own tracking and case", async ({ page }) => {
    await page.goto("/en/about", { waitUntil: "networkidle" });
    const computed = await page.evaluate(() => {
      const eyebrow = document.querySelector(".font-label");
      return eyebrow
        ? { spacing: getComputedStyle(eyebrow).letterSpacing, transform: getComputedStyle(eyebrow).textTransform }
        : null;
    });
    expect(computed?.transform).toBe("uppercase");
    expect(computed?.spacing).not.toBe("normal");
  });
});

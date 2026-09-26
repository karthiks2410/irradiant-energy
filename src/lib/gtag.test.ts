import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

/**
 * The Google Analytics runtime decides what reaches Google, so the cases that matter are the ones
 * where being wrong is a privacy failure: a request before consent, an advertising setting left on,
 * a personal query parameter forwarded, or a withdrawal that keeps sending or keeps the cookies.
 *
 * Node environment: `window` and `document` are stubbed with just what src/lib/gtag.ts touches.
 * The module keeps per-page state, so each test imports a fresh copy.
 */

type Gtag = typeof import("@/lib/gtag");

interface FakeScript {
  id: string;
  async: boolean;
  src: string;
}

let jar: Map<string, string>;
let cookieWrites: string[];
let scripts: FakeScript[];
let win: Record<string, unknown> & {
  dataLayer?: IArguments[];
  location: { href: string; origin: string; pathname: string; search: string; hostname: string };
};

function stubBrowser(href = "https://www.irradiantenergy.in/en/get-quote?name=Asha&phone=9876543210&utm_source=whatsapp#top") {
  jar = new Map([
    ["ie_consent", "x"],
    ["_ga", "GA1.1.123.456"],
    ["_ga_TEST123", "GS1.1.789"],
  ]);
  cookieWrites = [];
  scripts = [];
  const url = new URL(href);
  const document = {
    title: "Get a solar estimate | Irradiant Energy",
    referrer: "https://www.google.com/",
    get cookie() {
      return [...jar].map(([name, value]) => `${name}=${value}`).join("; ");
    },
    set cookie(entry: string) {
      cookieWrites.push(entry);
      const [pair, ...attributes] = entry.split(";");
      const name = pair.slice(0, pair.indexOf("=")).trim();
      if (attributes.some((a) => a.trim().toLowerCase() === "max-age=0")) jar.delete(name);
    },
    getElementById: (id: string) => scripts.find((s) => s.id === id) ?? null,
    createElement: () => ({ id: "", async: false, src: "" }),
    head: { appendChild: (script: FakeScript) => scripts.push(script) },
  };
  win = {
    document,
    location: { href: url.href, origin: url.origin, pathname: url.pathname, search: url.search, hostname: url.hostname },
  };
  vi.stubGlobal("window", win);
  vi.stubGlobal("document", document);
}

/** The gtag() calls queued so far, as plain arrays. */
function calls(): unknown[][] {
  return (win.dataLayer ?? []).map((args) => Array.from(args));
}

async function load(): Promise<Gtag> {
  vi.resetModules();
  return import("@/lib/gtag");
}

beforeEach(() => stubBrowser());
afterEach(() => vi.unstubAllGlobals());

describe("sanitizeUrl", () => {
  it("keeps campaign tags and the segment, drops everything else and the fragment", async () => {
    const { sanitizeUrl } = await load();
    expect(sanitizeUrl("https://x.in/en/get-quote?name=Asha&email=a%40b.in&segment=home&utm_campaign=monsoon#f")).toBe(
      "https://x.in/en/get-quote?segment=home&utm_campaign=monsoon",
    );
    expect(sanitizeUrl("https://x.in/en?phone=98765")).toBe("https://x.in/en");
    expect(sanitizeUrl("not a url")).toBe("");
  });
});

describe("cookieDomains", () => {
  it("tries host-only and every parent domain above the public suffix", async () => {
    const { cookieDomains } = await load();
    expect(cookieDomains("www.irradiantenergy.in")).toEqual([null, "www.irradiantenergy.in", "irradiantenergy.in"]);
    expect(cookieDomains("localhost")).toEqual([null, "localhost"]);
  });
});

describe("before consent", () => {
  it("does nothing: no queue, no script, no page view", async () => {
    const gtag = await load();
    expect(gtag.trackPageView("/en")).toBe(false);
    expect(win.dataLayer).toBeUndefined();
    expect(scripts).toEqual([]);
  });

  it("making sure it is off touches no Google code and removes stale analytics cookies", async () => {
    const gtag = await load();
    gtag.disableAnalytics("G-TEST123");
    expect(win["ga-disable-G-TEST123"]).toBe(true);
    expect(win.dataLayer).toBeUndefined();
    expect(scripts).toEqual([]);
    expect([...jar.keys()]).toEqual(["ie_consent"]);
  });
});

describe("after consent", () => {
  it("loads gtag.js once with advertising off and a sanitised address", async () => {
    const gtag = await load();
    gtag.enableAnalytics("G-TEST123");
    gtag.enableAnalytics("G-TEST123");

    expect(scripts).toHaveLength(1);
    expect(scripts[0]).toMatchObject({ id: gtag.GTAG_SCRIPT_ID, async: true, src: `${gtag.GTAG_SRC}?id=G-TEST123` });
    expect(win["ga-disable-G-TEST123"]).toBe(false);

    const [consentDefault, , config] = calls();
    expect(consentDefault).toEqual([
      "consent",
      "default",
      { ad_storage: "denied", ad_user_data: "denied", ad_personalization: "denied", analytics_storage: "granted" },
    ]);
    expect(config).toEqual([
      "config",
      "G-TEST123",
      {
        send_page_view: false,
        allow_google_signals: false,
        allow_ad_personalization_signals: false,
        cookie_expires: 180 * 24 * 60 * 60,
        page_location: "https://www.irradiantenergy.in/en/get-quote?utm_source=whatsapp",
        page_referrer: "https://www.google.com/",
      },
    ]);
    // Configured once: the second call only re-grants storage.
    expect(calls().filter((c) => c[0] === "config")).toHaveLength(1);
  });

  it("counts each page once, without personal query parameters, chaining the referrer", async () => {
    const gtag = await load();
    gtag.enableAnalytics("G-TEST123");

    expect(gtag.trackPageView("/en/get-quote")).toBe(true);
    expect(gtag.trackPageView("/en/get-quote")).toBe(false);
    win.location.search = "";
    expect(gtag.trackPageView("/en/about")).toBe(true);

    const views = calls().filter((c) => c[0] === "event" && c[1] === "page_view");
    expect(views).toEqual([
      [
        "event",
        "page_view",
        {
          page_location: "https://www.irradiantenergy.in/en/get-quote?utm_source=whatsapp",
          page_referrer: "https://www.google.com/",
          page_title: "Get a solar estimate | Irradiant Energy",
          content_group: "English",
          page_type: "calculator",
        },
      ],
      [
        "event",
        "page_view",
        {
          page_location: "https://www.irradiantenergy.in/en/about",
          page_referrer: "https://www.irradiantenergy.in/en/get-quote?utm_source=whatsapp",
          page_title: "Get a solar estimate | Irradiant Energy",
          content_group: "English",
          page_type: "about",
        },
      ],
    ]);
    expect(JSON.stringify(calls())).not.toMatch(/Asha|9876543210/);
  });
});

describe("withdrawal", () => {
  it("sets the kill switch, denies storage, deletes the cookies and stops page views", async () => {
    const gtag = await load();
    gtag.enableAnalytics("G-TEST123");
    gtag.trackPageView("/en");
    gtag.disableAnalytics("G-TEST123");

    expect(win["ga-disable-G-TEST123"]).toBe(true);
    expect(calls().at(-1)).toEqual(["consent", "update", { analytics_storage: "denied" }]);
    expect([...jar.keys()]).toEqual(["ie_consent"]);
    // The wide-domain form is the one gtag.js actually writes on the live site.
    expect(cookieWrites).toContain("_ga=; Max-Age=0; Path=/; Domain=irradiantenergy.in");
    expect(cookieWrites).toContain("_ga_TEST123=; Max-Age=0; Path=/");
    expect(gtag.isAnalyticsActive()).toBe(false);
    expect(gtag.trackPageView("/en/about")).toBe(false);
  });

  it("a later re-grant lifts the switch without loading or configuring again, and counts the page", async () => {
    const gtag = await load();
    gtag.enableAnalytics("G-TEST123");
    gtag.trackPageView("/en");
    gtag.disableAnalytics("G-TEST123");
    gtag.enableAnalytics("G-TEST123");

    expect(win["ga-disable-G-TEST123"]).toBe(false);
    expect(scripts).toHaveLength(1);
    expect(calls().filter((c) => c[0] === "config")).toHaveLength(1);
    expect(calls().at(-1)).toEqual(["consent", "update", { analytics_storage: "granted" }]);
    expect(gtag.trackPageView("/en")).toBe(true);
  });
});

describe("page grouping", () => {
  it("sets the content group and page type for the page view and everything after it", async () => {
    const gtag = await load();
    gtag.enableAnalytics("G-TEST123");
    win.location.search = "";
    gtag.trackPageView("/kn/solutions/solar/home");

    const set = calls().filter((c) => c[0] === "set").at(-1);
    expect(set?.[1]).toMatchObject({ content_group: "Kannada", page_type: "segment" });
    const view = calls().filter((c) => c[0] === "event" && c[1] === "page_view").at(-1);
    expect(view?.[2]).toMatchObject({ content_group: "Kannada", page_type: "segment" });
  });
});

describe("track", () => {
  const lead = { form: "popup", property_type: "home", bill_band: "home-3", site_language: "en" } as const;
  /** What `track` adds to every event: the page it happened on (the stub is /en/get-quote). */
  const page = { page_type: "calculator", content_group: "English" };

  it("sends nothing before consent", async () => {
    const gtag = await load();
    expect(gtag.track("generate_lead", lead)).toBe(false);
    expect(win.dataLayer).toBeUndefined();
  });

  it("sends an allowed event with its allowed parameters once analytics is on", async () => {
    const gtag = await load();
    gtag.enableAnalytics("G-TEST123");
    expect(gtag.track("generate_lead", lead)).toBe(true);
    expect(gtag.track("click_whatsapp", { location: "bubble", site_language: "kn" })).toBe(true);
    const events = calls().filter((c) => c[0] === "event");
    expect(events).toEqual([
      ["event", "generate_lead", { ...lead, ...page }],
      ["event", "click_whatsapp", { location: "bubble", site_language: "kn", ...page }],
    ]);
  });

  it("strips anything personal a caller hands in by mistake", async () => {
    const gtag = await load();
    gtag.enableAnalytics("G-TEST123");
    const hostile = {
      ...lead,
      bill_band: "3500",
      property_type: "560001",
      name: "Asha Rao",
      phone: "+919876543210",
      email: "asha@example.com",
      pincode: "560001",
    };
    gtag.track("generate_lead", hostile as unknown as typeof lead);
    const [, , params] = calls().filter((c) => c[0] === "event").at(-1)!;
    expect(params).toEqual({ form: "popup", site_language: "en", ...page });
    expect(JSON.stringify(calls())).not.toMatch(/Asha|9876543210|asha@example\.com|560001|3500/);
  });

  it("stops after withdrawal and starts again after a re-grant", async () => {
    const gtag = await load();
    gtag.enableAnalytics("G-TEST123");
    gtag.disableAnalytics("G-TEST123");
    expect(gtag.track("email_estimate", { site_language: "en" })).toBe(false);
    gtag.enableAnalytics("G-TEST123");
    expect(gtag.track("email_estimate", { site_language: "en" })).toBe(true);
    expect(calls().filter((c) => c[0] === "event" && c[1] === "email_estimate")).toHaveLength(1);
  });

  it("refuses an event name that is not ours", async () => {
    const gtag = await load();
    gtag.enableAnalytics("G-TEST123");
    expect(gtag.track("purchase" as "email_estimate", { site_language: "en" })).toBe(false);
    expect(calls().filter((c) => c[0] === "event")).toEqual([]);
  });
});

describe("the reserved `language` field", () => {
  it("is never sent: gtag.js would write it over the browser language instead of reporting it", async () => {
    const gtag = await load();
    gtag.enableAnalytics("G-TEST123");
    gtag.track("email_estimate", { site_language: "kn", language: "kn" } as unknown as { site_language: "kn" });
    const [, , params] = calls().filter((c) => c[0] === "event").at(-1)!;
    expect(params).not.toHaveProperty("language");
    expect(params).toMatchObject({ site_language: "kn" });
  });
});

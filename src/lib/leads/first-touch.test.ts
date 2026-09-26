import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

/**
 * The browser half of the lead source. What must hold: nothing is remembered without analytics
 * consent (or in a build without analytics), an enquiry without consent carries only its own page
 * and the campaign tags in the current address, and nothing personal from a legacy query string
 * ever makes it into the field.
 *
 * Node environment: `window`, `document` and `sessionStorage` are stubbed with just what the module
 * touches. The module reads how the page was opened when it loads, so each test imports it fresh.
 */

type Module = typeof import("./first-touch");
type Consent = typeof import("@/lib/consent");

let storage: Map<string, string>;
let storageBroken: boolean;
let cookie: string;
let location: { pathname: string; search: string; host: string; protocol: string; href: string };

function stubBrowser(href: string, referrer: string) {
  const url = new URL(href);
  location = { pathname: url.pathname, search: url.search, host: url.host, protocol: url.protocol, href: url.href };
  storage = new Map();
  storageBroken = false;
  cookie = "";
  const guard = () => {
    if (storageBroken) throw new Error("SecurityError");
  };
  vi.stubGlobal("window", { location });
  vi.stubGlobal("document", {
    referrer,
    get cookie() {
      return cookie;
    },
    set cookie(entry: string) {
      cookie = entry.split(";")[0];
    },
  });
  vi.stubGlobal("sessionStorage", {
    getItem: (key: string) => (guard(), storage.get(key) ?? null),
    setItem: (key: string, value: string) => (guard(), storage.set(key, value)),
    removeItem: (key: string) => (guard(), storage.delete(key)),
  });
}

async function load({ analytics = true } = {}): Promise<{ touch: Module; consent: Consent }> {
  vi.resetModules();
  vi.stubEnv("NEXT_PUBLIC_GA_MEASUREMENT_ID", analytics ? "G-TEST123" : "");
  vi.stubEnv("NEXT_PUBLIC_GA_ALLOW_NON_PRODUCTION", "1");
  const consent = await import("@/lib/consent");
  const touch = await import("./first-touch");
  return { touch, consent };
}

/** Client-side navigation: the address changes, the document does not. */
function navigate(path: string) {
  const url = new URL(path, location.href);
  location.pathname = url.pathname;
  location.search = url.search;
  location.href = url.href;
}

const LANDING =
  "https://www.irradiantenergy.in/kn/solutions/solar/home?utm_source=instagram&utm_medium=social&utm_campaign=bio_link&name=Asha&phone=9845012345";

beforeEach(() => stubBrowser(LANDING, "https://l.instagram.com/"));
afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});

describe("without analytics consent", () => {
  it("remembers nothing", async () => {
    const { touch } = await load();
    expect(touch.captureFirstTouch()).toBe(false);
    expect(storage.size).toBe(0);
  });

  it("sends only the page and the campaign tags in the current address", async () => {
    const { touch } = await load();
    expect(touch.leadSourceNow()).toEqual({
      page: "/kn/solutions/solar/home",
      utm_source: "instagram",
      utm_medium: "social",
      utm_campaign: "bio_link",
    });
    navigate("/kn/get-quote");
    expect(touch.leadSourceNow()).toEqual({ page: "/kn/get-quote" });
  });

  it("after a refusal as well", async () => {
    const { touch, consent } = await load();
    consent.saveConsent(consent.REJECT_ALL);
    expect(touch.captureFirstTouch()).toBe(false);
    expect(touch.leadSourceNow()).not.toHaveProperty("landing");
    expect(touch.leadSourceNow()).not.toHaveProperty("referrer");
  });
});

describe("with analytics consent", () => {
  it("remembers where the visit began, once, and sends it with the page the enquiry came from", async () => {
    const { touch, consent } = await load();
    consent.saveConsent(consent.ACCEPT_ALL);
    expect(touch.captureFirstTouch()).toBe(true);
    expect(JSON.parse(storage.get("ie:first-touch")!)).toEqual({
      landing: "/kn/solutions/solar/home",
      referrer: "l.instagram.com",
      utm_source: "instagram",
      utm_medium: "social",
      utm_campaign: "bio_link",
    });

    navigate("/kn/get-quote?utm_source=flyer");
    touch.captureFirstTouch();
    expect(touch.leadSourceNow()).toEqual({
      page: "/kn/get-quote",
      landing: "/kn/solutions/solar/home",
      referrer: "l.instagram.com",
      utm_source: "instagram",
      utm_medium: "social",
      utm_campaign: "bio_link",
    });
  });

  it("credits the page the visitor landed on even when they answer the banner later", async () => {
    const { touch, consent } = await load();
    navigate("/kn/about");
    consent.saveConsent(consent.ACCEPT_ALL);
    touch.captureFirstTouch();
    expect(touch.leadSourceNow()).toMatchObject({ landing: "/kn/solutions/solar/home", page: "/kn/about" });
  });

  it("does not count this site as the referrer", async () => {
    stubBrowser("https://www.irradiantenergy.in/en", "https://www.irradiantenergy.in/kn");
    const { touch, consent } = await load();
    consent.saveConsent(consent.ACCEPT_ALL);
    expect(touch.leadSourceNow()).toEqual({ page: "/en", landing: "/en" });
  });

  it("still knows this page's first touch when storage is blocked", async () => {
    const { touch, consent } = await load();
    consent.saveConsent(consent.ACCEPT_ALL);
    storageBroken = true;
    expect(touch.captureFirstTouch()).toBe(false);
    expect(touch.leadSourceNow()).toMatchObject({ landing: "/kn/solutions/solar/home", utm_source: "instagram" });
    expect(() => touch.clearFirstTouch()).not.toThrow();
  });

  it("forgets it on withdrawal", async () => {
    const { touch, consent } = await load();
    consent.saveConsent(consent.ACCEPT_ALL);
    touch.captureFirstTouch();
    consent.saveConsent(consent.REJECT_ALL);
    touch.clearFirstTouch();
    expect(storage.size).toBe(0);
    expect(touch.leadSourceNow()).not.toHaveProperty("landing");
  });

  it("remembers nothing in a build without analytics", async () => {
    const { touch, consent } = await load({ analytics: false });
    consent.saveConsent(consent.ACCEPT_ALL);
    expect(touch.captureFirstTouch()).toBe(false);
    expect(storage.size).toBe(0);
  });
});

describe("withLeadSource", () => {
  it("sets the hidden leadSource field, and nothing personal from the address gets into it", async () => {
    const { touch, consent } = await load();
    consent.saveConsent(consent.ACCEPT_ALL);
    const data = touch.withLeadSource(new FormData());
    const field = String(data.get("leadSource"));
    expect(JSON.parse(field)).toMatchObject({ page: "/kn/solutions/solar/home", utm_source: "instagram" });
    expect(field).not.toMatch(/Asha|9845012345/);
  });
});

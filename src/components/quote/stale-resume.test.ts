import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

/**
 * The deploy-recovery record (stale-resume.ts) now names the form it came from: the popup, or the
 * quote form on the home page. Only that form may take it back, and it is still used once.
 *
 * The module keeps what a page load took in module state (for React's double-run of mount effects),
 * so every test imports a fresh copy, which is what a fresh page load gets.
 */

const KEY = "ie:quick-quote-resume";

function memoryStorage(): Storage {
  const data = new Map<string, string>();
  return {
    get length() {
      return data.size;
    },
    clear: () => data.clear(),
    getItem: (key) => data.get(key) ?? null,
    key: (index) => [...data.keys()][index] ?? null,
    removeItem: (key) => void data.delete(key),
    setItem: (key, value) => void data.set(key, String(value)),
  };
}

const fields = {
  path: "/en",
  intent: "quote",
  segment: "home",
  name: "Asha Rao",
  phone: "9845012345",
  pincode: "560001",
  billBucket: "home-3",
  startedAt: 1_000,
} as const;

/** A fresh module, as a reload gets. */
const load = async () => {
  vi.resetModules();
  return import("./stale-resume");
};

beforeEach(() => {
  vi.stubGlobal("sessionStorage", memoryStorage());
  vi.stubGlobal("navigator", { onLine: true });
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("the recovery record names its form", () => {
  it("comes back to the home page form, not the popup", async () => {
    expect((await load()).saveQuickQuoteResume({ ...fields, surface: "home" })).toBe(true);

    const page = await load();
    // Both forms mount on the home page and both ask; the popup must get nothing.
    expect(page.takeQuickQuoteResume("/en", "popup")).toBeNull();
    const record = page.takeQuickQuoteResume("/en", "home");
    expect(record).toMatchObject({ ...fields, surface: "home" });
    // Asking again in the same page load (React runs mount effects twice) gives the same answer…
    expect(page.takeQuickQuoteResume("/en", "home")).toEqual(record);
    // …but the storage is already empty, so the next load starts clean.
    expect(sessionStorage.getItem(KEY)).toBeNull();
    expect((await load()).takeQuickQuoteResume("/en", "home")).toBeNull();
  });

  it("comes back to the popup, not the home page form", async () => {
    (await load()).saveQuickQuoteResume({ ...fields, surface: "popup" });
    const page = await load();
    expect(page.takeQuickQuoteResume("/en", "home")).toBeNull();
    expect(page.takeQuickQuoteResume("/en", "popup")).toMatchObject({ surface: "popup", name: "Asha Rao" });
  });

  it("reads a record from the build before surfaces existed as the popup's", async () => {
    sessionStorage.setItem(KEY, JSON.stringify({ ...fields, savedAt: Date.now() }));
    const page = await load();
    expect(page.takeQuickQuoteResume("/en", "home")).toBeNull();
    expect(page.takeQuickQuoteResume("/en", "popup")).toMatchObject({ surface: "popup" });
  });

  it("refuses a record with a surface it does not know", async () => {
    sessionStorage.setItem(KEY, JSON.stringify({ ...fields, surface: "footer", savedAt: Date.now() }));
    const page = await load();
    expect(page.takeQuickQuoteResume("/en", "popup")).toBeNull();
    expect(page.takeQuickQuoteResume("/en", "home")).toBeNull();
    expect(sessionStorage.getItem(KEY)).toBeNull();
  });

  it("once the recovered enquiry is sent, a later mount in the same page load gets nothing", async () => {
    (await load()).saveQuickQuoteResume({ ...fields, surface: "home" });
    const page = await load();
    expect(page.takeQuickQuoteResume("/en", "home")).not.toBeNull();
    // The popup's forget does not touch the home page form's record…
    page.forgetQuickQuoteResume("popup");
    expect(page.takeQuickQuoteResume("/en", "home")).not.toBeNull();
    // …the home page form's own does: leaving the home page and coming back shows an empty form.
    page.forgetQuickQuoteResume("home");
    expect(page.takeQuickQuoteResume("/en", "home")).toBeNull();
    expect(page.takeQuickQuoteResume("/en", "popup")).toBeNull();
  });

  it("is only taken on the page it was filled in on", async () => {
    (await load()).saveQuickQuoteResume({ ...fields, surface: "home" });
    expect((await load()).takeQuickQuoteResume("/kn", "home")).toBeNull();
  });

  it("does not carry the consent tick", async () => {
    (await load()).saveQuickQuoteResume({ ...fields, surface: "home" });
    const stored = JSON.parse(sessionStorage.getItem(KEY) ?? "{}");
    expect(Object.keys(stored)).not.toContain("consent");
  });

  it("is not saved offline, so the form says so instead of reloading", async () => {
    vi.stubGlobal("navigator", { onLine: false });
    expect((await load()).saveQuickQuoteResume({ ...fields, surface: "home" })).toBe(false);
    expect(sessionStorage.getItem(KEY)).toBeNull();
  });
});

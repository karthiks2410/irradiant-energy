import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  CONSENT_COOKIE_NAME,
  CONSENT_VERSION,
  clearConsent,
  getConsentSnapshot,
  getServerConsentSnapshot,
  hasConsent,
  saveConsent,
  subscribeConsent,
} from "@/lib/consent";

/**
 * The consent store decides whether a tracker may load, so the cases that matter are the ones
 * where being wrong is a compliance failure: defaulting to granted, keeping a stale answer after
 * the categories change, or losing the answer that was given.
 *
 * Tests run in the node environment, so `document` and `window` are stubbed with a minimal cookie
 * jar — which also exercises the real serialisation rather than a mock of it.
 */

let jar = new Map<string, string>();
let lastWrite = "";

function stubBrowser() {
  jar = new Map();
  lastWrite = "";
  vi.stubGlobal("document", {
    get cookie() {
      return [...jar].map(([name, value]) => `${name}=${value}`).join("; ");
    },
    set cookie(entry: string) {
      lastWrite = entry;
      const [pair, ...attributes] = entry.split(";");
      const index = pair.indexOf("=");
      const name = pair.slice(0, index).trim();
      const value = pair.slice(index + 1);
      const expired = attributes.some((attribute) => attribute.trim().toLowerCase() === "max-age=0");
      if (expired) jar.delete(name);
      else jar.set(name, value);
    },
  });
  vi.stubGlobal("window", { location: { protocol: "https:" } });
}

beforeEach(() => {
  stubBrowser();
  clearConsent(); // reset the module's cached snapshot between tests
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("consent store", () => {
  it("grants nothing optional until the visitor answers", () => {
    expect(getConsentSnapshot()).toBeNull();
    expect(hasConsent("analytics")).toBe(false);
    // Necessary is not a choice and is never withheld.
    expect(hasConsent("necessary")).toBe(true);
  });

  it("never reports an answer during server rendering", () => {
    expect(getServerConsentSnapshot()).toBeNull();
  });

  it("stores an answer in a first-party, same-site cookie and reads it back", () => {
    saveConsent({ analytics: true });

    expect(hasConsent("analytics")).toBe(true);
    expect(jar.has(CONSENT_COOKIE_NAME)).toBe(true);
    expect(lastWrite).toContain("Path=/");
    expect(lastWrite).toContain("SameSite=Lax");
    expect(lastWrite).toContain("Secure"); // stubbed protocol is https
    expect(lastWrite).toContain("Max-Age=15552000"); // 180 days

    const stored: unknown = JSON.parse(decodeURIComponent(jar.get(CONSENT_COOKIE_NAME) ?? ""));
    expect(stored).toMatchObject({ version: CONSENT_VERSION, analytics: true });
    // Nothing that identifies the visitor is written alongside the answer.
    expect(Object.keys(stored as object).sort()).toEqual(["analytics", "decidedAt", "version"]);
  });

  it("records a refusal as an answer rather than as silence", () => {
    saveConsent({ analytics: false });

    expect(getConsentSnapshot()).not.toBeNull();
    expect(hasConsent("analytics")).toBe(false);
  });

  it("returns a stable snapshot reference while nothing changes", () => {
    saveConsent({ analytics: true });
    // useSyncExternalStore re-renders forever if the snapshot identity changes on every read.
    expect(getConsentSnapshot()).toBe(getConsentSnapshot());
  });

  it("ignores an answer given to a different version of the question", () => {
    const stale = { version: CONSENT_VERSION + 1, analytics: true, decidedAt: new Date().toISOString() };
    jar.set(CONSENT_COOKIE_NAME, encodeURIComponent(JSON.stringify(stale)));

    expect(getConsentSnapshot()).toBeNull();
    expect(hasConsent("analytics")).toBe(false);
  });

  it("ignores a malformed or tampered cookie instead of trusting it", () => {
    jar.set(CONSENT_COOKIE_NAME, "not-json");
    expect(getConsentSnapshot()).toBeNull();

    jar.set(CONSENT_COOKIE_NAME, encodeURIComponent(JSON.stringify({ version: CONSENT_VERSION, analytics: "yes" })));
    expect(getConsentSnapshot()).toBeNull();
  });

  it("withdraws consent immediately and notifies subscribers", () => {
    const listener = vi.fn();
    const unsubscribe = subscribeConsent(listener);

    saveConsent({ analytics: true });
    expect(listener).toHaveBeenCalledTimes(1);

    clearConsent();
    expect(listener).toHaveBeenCalledTimes(2);
    expect(hasConsent("analytics")).toBe(false);
    expect(jar.has(CONSENT_COOKIE_NAME)).toBe(false);

    unsubscribe();
    saveConsent({ analytics: true });
    expect(listener).toHaveBeenCalledTimes(2);
  });

  it("honours the answer for the rest of the session when cookies cannot be written", () => {
    vi.stubGlobal("document", {
      get cookie() {
        return "";
      },
      set cookie(_entry: string) {
        throw new Error("blocked");
      },
    });

    saveConsent({ analytics: true });
    expect(hasConsent("analytics")).toBe(true);
  });
});

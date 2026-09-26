import { describe, expect, it } from "vitest";
import { DEFAULT_LOCALE, isLocale, LOCALES } from "./config";
import {
  counterpartHref,
  filterSwitchQuery,
  isInternalPath,
  localeFromPathname,
  localizePath,
  otherLocale,
  stripLocale,
  SWITCH_QUERY_ALLOWLIST,
} from "./paths";

describe("config", () => {
  it("has English as the default and both locales prefixed", () => {
    expect(LOCALES).toEqual(["en", "kn"]);
    expect(DEFAULT_LOCALE).toBe("en");
  });

  it("recognises only real locales", () => {
    expect(isLocale("en")).toBe(true);
    expect(isLocale("kn")).toBe(true);
    expect(isLocale("fr")).toBe(false);
    expect(isLocale("EN")).toBe(false);
    expect(isLocale(undefined)).toBe(false);
  });
});

describe("localizePath", () => {
  it("prefixes the home page", () => {
    expect(localizePath("/", "en")).toBe("/en");
    expect(localizePath("/", "kn")).toBe("/kn");
  });

  it("prefixes inner pages", () => {
    expect(localizePath("/about", "en")).toBe("/en/about");
    expect(localizePath("/solutions/solar/home", "kn")).toBe("/kn/solutions/solar/home");
  });

  it("is idempotent: re-prefixing swaps rather than nests", () => {
    expect(localizePath(localizePath("/about", "en"), "kn")).toBe("/kn/about");
    expect(localizePath("/en", "kn")).toBe("/kn");
  });

  it("keeps the hash and the query", () => {
    expect(localizePath("/contact#grievance", "kn")).toBe("/kn/contact#grievance");
    expect(localizePath("/get-quote?segment=home", "en")).toBe("/en/get-quote?segment=home");
    expect(localizePath("/cookies#cookie-settings", "en")).toBe("/en/cookies#cookie-settings");
  });

  it("leaves hrefs it does not own alone", () => {
    for (const href of ["#main", "tel:+919845794343", "mailto:a@b.c", "https://wa.me/91", "//cdn.example/x"]) {
      expect(localizePath(href, "kn")).toBe(href);
    }
  });
});

describe("stripLocale", () => {
  it("reports the prefix and the bare path", () => {
    expect(stripLocale("/en/about")).toEqual({ locale: "en", path: "/about" });
    expect(stripLocale("/kn")).toEqual({ locale: "kn", path: "/" });
    expect(stripLocale("/kn/")).toEqual({ locale: "kn", path: "/" });
  });

  it("returns null for an unprefixed path and leaves it intact", () => {
    expect(stripLocale("/about")).toEqual({ locale: null, path: "/about" });
    expect(stripLocale("/")).toEqual({ locale: null, path: "/" });
  });

  it("does not mistake a page slug for a locale", () => {
    expect(stripLocale("/energy/en")).toEqual({ locale: null, path: "/energy/en" });
  });
});

describe("localeFromPathname", () => {
  it("reads the prefix", () => {
    expect(localeFromPathname("/kn/solutions")).toBe("kn");
    expect(localeFromPathname("/en")).toBe("en");
  });

  it("falls back to the default", () => {
    expect(localeFromPathname("/about")).toBe("en");
  });
});

describe("otherLocale", () => {
  it("flips", () => {
    expect(otherLocale("en")).toBe("kn");
    expect(otherLocale("kn")).toBe("en");
  });
});

describe("filterSwitchQuery", () => {
  it("keeps only allow-listed keys", () => {
    expect(SWITCH_QUERY_ALLOWLIST).toEqual(["segment"]);
    expect(filterSwitchQuery("?segment=housing-society")).toBe("?segment=housing-society");
  });

  it("drops personal data carried by legacy links", () => {
    expect(filterSwitchQuery("?name=Asha&phone=9845&email=a%40b.c")).toBe("");
    expect(filterSwitchQuery("?segment=home&name=Asha&token=xyz")).toBe("?segment=home");
  });

  it("handles an empty query", () => {
    expect(filterSwitchQuery("")).toBe("");
    expect(filterSwitchQuery("?")).toBe("");
  });
});

describe("counterpartHref", () => {
  it("maps a page to the same page in the other locale", () => {
    expect(counterpartHref({ pathname: "/en/solutions/solar/home", to: "kn" })).toBe("/kn/solutions/solar/home");
    expect(counterpartHref({ pathname: "/kn/about", to: "en" })).toBe("/en/about");
    expect(counterpartHref({ pathname: "/en", to: "kn" })).toBe("/kn");
  });

  it("preserves the in-page anchor", () => {
    expect(counterpartHref({ pathname: "/en/contact", hash: "#grievance", to: "kn" })).toBe("/kn/contact#grievance");
    expect(counterpartHref({ pathname: "/en/get-quote", hash: "lead-form", to: "kn" })).toBe("/kn/get-quote#lead-form");
    expect(counterpartHref({ pathname: "/en/get-quote", hash: "#", to: "kn" })).toBe("/kn/get-quote");
  });

  it("carries the allow-listed query and nothing else", () => {
    expect(
      counterpartHref({
        pathname: "/en/get-quote",
        search: "?segment=commercial&name=Asha&phone=9845794343",
        hash: "#lead-form",
        to: "kn",
      }),
    ).toBe("/kn/get-quote?segment=commercial#lead-form");
  });

  it("works from an unprefixed path", () => {
    expect(counterpartHref({ pathname: "/about", to: "kn" })).toBe("/kn/about");
  });
});

describe("isInternalPath", () => {
  it("accepts app paths and rejects the rest", () => {
    expect(isInternalPath("/about")).toBe(true);
    expect(isInternalPath("//evil.example")).toBe(false);
    expect(isInternalPath("https://example.com")).toBe(false);
    expect(isInternalPath("#main")).toBe(false);
  });
});

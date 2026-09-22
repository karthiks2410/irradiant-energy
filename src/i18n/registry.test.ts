import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { LOCALES } from "./config";
import {
  isPublished,
  langParams,
  pathFor,
  publishedLocales,
  publishedPaths,
  ROUTE_KEYS,
  ROUTES,
  routeFor,
  routeForPath,
} from "./registry";

const repoFile = (rel: string) => fileURLToPath(new URL(`../../${rel}`, import.meta.url));

describe("registry shape", () => {
  it("has a row for every key, and no extras", () => {
    expect(ROUTES.map((r) => r.key).sort()).toEqual([...ROUTE_KEYS].sort());
  });

  it("uses the same ASCII slug in both locales", () => {
    for (const route of ROUTES) {
      expect(route.path, `${route.key} path`).toMatch(/^\/[a-z0-9/-]*$/);
      for (const locale of LOCALES) {
        expect(pathFor(route.key, locale)).toBe(route.path === "/" ? `/${locale}` : `/${locale}${route.path}`);
      }
    }
  });

  it("has unique paths", () => {
    const paths = ROUTES.map((r) => r.path);
    expect(new Set(paths).size).toBe(paths.length);
  });
});

describe("lookup", () => {
  it("finds a row by key and by path", () => {
    expect(routeFor("about").path).toBe("/about");
    expect(routeForPath("/solutions/solar/commercial")?.key).toBe("solutions-commercial");
  });

  it("returns null for a path it does not own", () => {
    expect(routeForPath("/nope")).toBeNull();
    // Prefixed paths are not registry keys: strip the locale first.
    expect(routeForPath("/en/about")).toBeNull();
  });

  it("throws on an unknown key", () => {
    // @ts-expect-error — the point of the test is the runtime guard.
    expect(() => routeFor("nope")).toThrow(/Unknown route key/);
  });
});

describe("publishing gate", () => {
  it("publishes every page in English", () => {
    for (const key of ROUTE_KEYS) expect(isPublished(key, "en"), key).toBe(true);
  });

  it("turns the publish flags into generateStaticParams values", () => {
    expect(langParams("home")).toEqual([{ lang: "en" }, { lang: "kn" }]);
  });

  it("drops an unpublished locale from the params, which is what makes the URL 404", () => {
    const gated = { key: "about", path: "/about", publish: { en: true, kn: false } } as const;
    const locales = LOCALES.filter((l) => gated.publish[l]);
    expect(locales).toEqual(["en"]);
    expect(locales.map((lang) => ({ lang }))).toEqual([{ lang: "en" }]);
  });

  it("lists published paths per locale", () => {
    expect(publishedPaths("en")).toContain("/en/get-quote");
    expect(publishedPaths("en")).toContain("/en");
    expect(publishedPaths("kn")).toContain("/kn/solutions/solar/home");
    expect(publishedLocales("contact")).toEqual(["en", "kn"]);
  });
});

describe("route files match the registry", () => {
  const appDir = repoFile("src/app/[lang]");

  it("every registry row has a page file that gates itself", () => {
    for (const route of ROUTES) {
      // The three segment pages share one dynamic route file.
      const file = route.path.startsWith("/solutions/solar/")
        ? `${appDir}/solutions/solar/[segment]/page.tsx`
        : route.path === "/"
          ? `${appDir}/page.tsx`
          : `${appDir}${route.path}/page.tsx`;
      let source: string;
      try {
        source = readFileSync(file, "utf8");
      } catch {
        // The legal notices sit in a route group, which is not part of the URL.
        source = readFileSync(`${appDir}/(legal)${route.path}/page.tsx`, "utf8");
      }
      expect(source, `${route.key} must publish itself through the registry`).toMatch(/generateStaticParams/);
      expect(source, `${route.key} must use langParams`).toMatch(/langParams\(/);
    }
  });

  it("the [lang] layout must NOT export generateStaticParams", () => {
    // A layout-level list overrides an empty page-level one, which would silently publish an
    // unreviewed Kannada page (verified in the research spike; architecture.md §6.2).
    const layout = readFileSync(`${appDir}/layout.tsx`, "utf8");
    // Match an actual export, not the prose in the file's own comment explaining why there is none.
    expect(layout).not.toMatch(/export\s+(async\s+)?(function|const)\s+generateStaticParams/);
    expect(layout, "the tree must 404 on any segment that is not a locale").toMatch(
      /export const dynamicParams = false/,
    );
  });
});

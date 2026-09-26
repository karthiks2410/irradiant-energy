import type { MetadataRoute } from "next";
import { isLegalPageIndexable } from "@/content/legal";
import type { LegalPage } from "@/content/types";
import { HREFLANG } from "@/i18n/config";
import { localizePath } from "@/i18n/paths";
import { publishedLocales, ROUTES } from "@/i18n/registry";
import { absoluteUrl } from "@/lib/seo";

// v1 routes (report §9.1, decisions D-009) now come from the route registry (src/i18n/registry.ts),
// so a page that is published in one locale and not the other appears exactly where it resolves.
// changefreq and priority are omitted because Google ignores them.
// The legal notices are listed only once counsel has approved them: while they are drafts the
// pages send noindex, and a noindex URL in the sitemap is a Search Console error.
const LEGAL_KEYS = new Set(["privacy", "terms", "cookies"]);

// The sitemap is a static route handler, so this is the build time, i.e. the last deployment.
// There is no CMS: copy changes ship as deployments.
const lastModified = new Date();

export default function sitemap(): MetadataRoute.Sitemap {
  return ROUTES.filter((route) => !LEGAL_KEYS.has(route.key) || isLegalPageIndexable(route.key as LegalPage["slug"])).flatMap(
    (route) => {
      const locales = publishedLocales(route.key);
      // Every entry in a published pair carries the same alternates map, which is what tells a
      // crawler the two URLs are the same page in two languages.
      // x-default matches the page head (src/lib/seo.ts), so the two hreflang sources agree.
      const languages = {
        ...Object.fromEntries(
          locales.map((locale) => [HREFLANG[locale], absoluteUrl(localizePath(route.path, locale))]),
        ),
        "x-default": absoluteUrl(localizePath(route.path, "en")),
      };
      return locales.map((locale) => ({
        url: absoluteUrl(localizePath(route.path, locale)),
        lastModified,
        ...(locales.length > 1 ? { alternates: { languages } } : {}),
      }));
    },
  );
}

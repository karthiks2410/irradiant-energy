/**
 * The route registry: one row per page, its slug, and whether that page is published in each
 * locale.
 *
 * Why it exists:
 * - the publishing gate. Each page's `generateStaticParams` returns only the locales its row
 *   publishes, and `dynamicParams = false` on the `[lang]` layout turns everything else into a
 *   404. So a Kannada page whose copy has not been reviewed can 404 while the rest of the tree
 *   ships, with no route file to add or remove.
 * - one list that the sitemap, the language switcher and the e2e suite all read, so they cannot
 *   drift apart.
 *
 * Both locales use the SAME ASCII slugs (owner decision; docs/kannada/research/architecture.md
 * §6.1): hreflang carries the language, and identical slugs keep the counterpart map, the legacy
 * redirects and shared links trivial.
 *
 * Client-safe: plain data, no imports beyond the locale constants, so Playwright can import it.
 *
 * NOTE for the stage after this one: `kn: true` below means "this URL resolves", not "this page
 * is translated". Kannada currently renders the English copy with Kannada typography active. When
 * reviewed Kannada lands, the rows flip per page as the reviewer signs them off.
 */

import { LOCALES, type Locale } from "./config";
import { localizePath } from "./paths";

export const ROUTE_KEYS = [
  "home",
  "about",
  "solutions",
  "solutions-home",
  "solutions-housing-society",
  "solutions-commercial",
  "get-quote",
  "contact",
  "privacy",
  "terms",
  "cookies",
] as const;

export type RouteKey = (typeof ROUTE_KEYS)[number];

export interface RouteEntry {
  readonly key: RouteKey;
  /** Unprefixed path, identical in every locale. */
  readonly path: string;
  /** Whether this page resolves (rather than 404s) in each locale. */
  readonly publish: Readonly<Record<Locale, boolean>>;
}

const published: Record<Locale, boolean> = { en: true, kn: true };

export const ROUTES: readonly RouteEntry[] = [
  { key: "home", path: "/", publish: published },
  { key: "about", path: "/about", publish: published },
  { key: "solutions", path: "/solutions", publish: published },
  { key: "solutions-home", path: "/solutions/solar/home", publish: published },
  { key: "solutions-housing-society", path: "/solutions/solar/housing-society", publish: published },
  { key: "solutions-commercial", path: "/solutions/solar/commercial", publish: published },
  { key: "get-quote", path: "/get-quote", publish: published },
  { key: "contact", path: "/contact", publish: published },
  { key: "privacy", path: "/privacy", publish: published },
  { key: "terms", path: "/terms", publish: published },
  { key: "cookies", path: "/cookies", publish: published },
];

const byKey = new Map<RouteKey, RouteEntry>(ROUTES.map((r) => [r.key, r]));
const byPath = new Map<string, RouteEntry>(ROUTES.map((r) => [r.path, r]));

export function routeFor(key: RouteKey): RouteEntry {
  const entry = byKey.get(key);
  if (!entry) throw new Error(`Unknown route key: ${key}`);
  return entry;
}

/** The registry row for an unprefixed path, or null for a path the registry does not own. */
export function routeForPath(path: string): RouteEntry | null {
  return byPath.get(path) ?? null;
}

/** This route's URL in a locale, e.g. ("about", "kn") -> "/kn/about". */
export function pathFor(key: RouteKey, locale: Locale): string {
  return localizePath(routeFor(key).path, locale);
}

export function isPublished(key: RouteKey, locale: Locale): boolean {
  return routeFor(key).publish[locale];
}

export function publishedLocales(key: RouteKey): readonly Locale[] {
  return LOCALES.filter((locale) => isPublished(key, locale));
}

/**
 * `generateStaticParams` value for a page: the locales that publish it.
 *
 * Every page exports this. The `[lang]` layout must NOT — a layout-level list overrides an empty
 * page-level one and would silently publish an unreviewed page (verified in the research spike,
 * architecture.md §6.2). `src/i18n/registry.test.ts` guards that.
 */
export function langParams(key: RouteKey): { lang: Locale }[] {
  return publishedLocales(key).map((lang) => ({ lang }));
}

/** Every published URL, for the sitemap and the e2e route list. */
export function publishedPaths(locale: Locale): string[] {
  return ROUTES.filter((r) => r.publish[locale]).map((r) => localizePath(r.path, locale));
}

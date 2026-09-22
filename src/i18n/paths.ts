/**
 * Path helpers shared by the server tree, the client islands and the e2e suite.
 *
 * Client-safe on purpose: `src/i18n/server.ts` is the only module that may touch
 * `next/root-params`, and Playwright imports this file directly.
 */

import { DEFAULT_LOCALE, isLocale, LOCALES, type Locale } from "./config";

/**
 * Query keys the language switcher may carry across a locale change.
 *
 * Deliberately an allow-list, not a deny-list. Legacy redirects (next.config.ts) forward the old
 * site's query strings, which are known to contain `name`, `phone` and `email` from quote emails;
 * copying those onto a new URL would put personal data in a link the visitor did not type.
 */
export const SWITCH_QUERY_ALLOWLIST: readonly string[] = ["segment"];

/** Split a href into its path and its `?query#hash` tail. */
function splitSuffix(href: string): [string, string] {
  const i = href.search(/[?#]/);
  return i === -1 ? [href, ""] : [href.slice(0, i), href.slice(i)];
}

/** True for a href this app owns and can prefix: starts with "/" but is not "//host". */
export function isInternalPath(href: string): boolean {
  return href.startsWith("/") && !href.startsWith("//");
}

/**
 * Remove a leading locale segment.
 *
 * Returns the locale it found (or null) and the remaining path, always starting with "/".
 * `/en` and `/en/` both reduce to `/`.
 */
export function stripLocale(pathname: string): { locale: Locale | null; path: string } {
  const [path, suffix] = splitSuffix(pathname);
  const segments = path.split("/");
  // "/en/about" -> ["", "en", "about"]
  const first = segments[1];
  if (!isLocale(first)) return { locale: null, path: (path || "/") + suffix };
  const rest = "/" + segments.slice(2).join("/");
  const bare = rest === "/" ? "/" : rest.replace(/\/+$/, "") || "/";
  return { locale: first, path: bare + suffix };
}

/**
 * Prefix an app path with a locale.
 *
 * Idempotent: an already-prefixed path is re-prefixed for the target locale rather than nested.
 * Non-internal hrefs (tel:, mailto:, https:, "#anchor") are returned untouched, so call sites can
 * pass any href without testing it first.
 */
export function localizePath(href: string, locale: Locale): string {
  if (!isInternalPath(href)) return href;
  const [path, suffix] = splitSuffix(href);
  const { path: bare } = stripLocale(path);
  return (bare === "/" ? `/${locale}` : `/${locale}${bare}`) + suffix;
}

/** The locale a pathname belongs to; the default when it carries no prefix. */
export function localeFromPathname(pathname: string): Locale {
  return stripLocale(pathname).locale ?? DEFAULT_LOCALE;
}

/** The other locale. With two locales this is the switcher's whole job. */
export function otherLocale(locale: Locale): Locale {
  return LOCALES.find((l) => l !== locale) ?? DEFAULT_LOCALE;
}

/** Keep only the query keys that are safe to carry across a locale change. */
export function filterSwitchQuery(search: string): string {
  if (!search || search === "?") return "";
  const params = new URLSearchParams(search.startsWith("?") ? search.slice(1) : search);
  const kept = new URLSearchParams();
  for (const key of SWITCH_QUERY_ALLOWLIST) {
    const value = params.get(key);
    if (value !== null) kept.append(key, value);
  }
  const out = kept.toString();
  return out ? `?${out}` : "";
}

export interface CounterpartInput {
  /** The current location's pathname, prefixed or not. */
  pathname: string;
  /** The current `location.search`, or "". */
  search?: string;
  /** The current `location.hash`, or "". */
  hash?: string;
  /** The locale being switched to. */
  to: Locale;
}

/**
 * The same page in the other locale.
 *
 * Both locales use the same ASCII slugs, so the counterpart is the current path with its prefix
 * swapped. The in-page anchor is kept (a reader switching language at the FAQ stays at the FAQ)
 * and the query is filtered to SWITCH_QUERY_ALLOWLIST.
 */
export function counterpartHref({ pathname, search = "", hash = "", to }: CounterpartInput): string {
  const { path } = stripLocale(splitSuffix(pathname)[0]);
  const query = filterSwitchQuery(search);
  const fragment = hash && hash !== "#" ? (hash.startsWith("#") ? hash : `#${hash}`) : "";
  return localizePath(path, to) + query + fragment;
}

/**
 * Locale constants. Client-safe: no server imports, no content imports.
 *
 * Both locales are URL-prefixed (`/en/...`, `/kn/...`) and `/` redirects to `/en`
 * (next.config.ts). Owner decision, 2026-09-22: the prefixed shape is the industry standard and
 * the site is not indexed yet, so nothing is lost. It also removes the hydration hazard the
 * research spike found (docs/kannada/research/architecture.md §3): with every route prefixed, a
 * prerendered page's path is the path the browser is on, so `usePathname()` agrees on both sides.
 */

export const LOCALES = ["en", "kn"] as const;

export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "en";

export function isLocale(value: unknown): value is Locale {
  return typeof value === "string" && (LOCALES as readonly string[]).includes(value);
}

/** `<html lang>` value. Plain language subtags; the regional form is only used for hreflang. */
export const HTML_LANG: Record<Locale, string> = { en: "en", kn: "kn" };

/** `hreflang` / `alternates.languages` key. */
export const HREFLANG: Record<Locale, string> = { en: "en-IN", kn: "kn-IN" };

/** Open Graph `og:locale`. */
export const OG_LOCALE: Record<Locale, string> = { en: "en_IN", kn: "kn_IN" };

/**
 * The switcher's own label for each locale, always written in that locale's own script so a
 * reader recognises it without reading the current language. "ಕನ್ನಡ" renders from the system
 * Kannada stack on English pages, so an English page downloads no Kannada webfont
 * (docs/kannada/research/typography.md §5.9).
 */
export const LOCALE_LABEL: Record<Locale, string> = { en: "EN", kn: "ಕನ್ನಡ" };

/** Accessible name for the switcher control, in the language being offered. */
export const LOCALE_NAME: Record<Locale, string> = { en: "English", kn: "ಕನ್ನಡ" };

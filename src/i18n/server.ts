/**
 * The locale, for Server Components.
 *
 * `next/root-params` gives any Server Component, `generateMetadata` or `generateStaticParams` the
 * value of the `[lang]` segment without prop-drilling it (Next 16.3.5,
 * node_modules/next/dist/docs/01-app/03-api-reference/04-functions/next-root-params.md). It is NOT
 * available in Client Components, Server Actions or Route Handlers — client code reads the locale
 * from `usePathname()` instead (`useLocale()` in src/components/i18n/LocaleLink.tsx), which is
 * sound here because every route carries its locale prefix.
 *
 * Importing this module from a Client Component is a build error, which is the guard we want.
 */

import { notFound } from "next/navigation";
import { lang } from "next/root-params";
import { DEFAULT_LOCALE, isLocale, type Locale } from "./config";
import { isPublished, type RouteKey } from "./registry";

export async function getLocale(): Promise<Locale> {
  const value = await lang();
  return isLocale(value) ? value : DEFAULT_LOCALE;
}

/**
 * The locale for a page that renders per request, or a 404.
 *
 * `dynamicParams = false` on the [lang] layout turns every unlisted locale into a 404 for the
 * prerendered pages, but it does not stop a page that renders on demand: /get-quote reads
 * `searchParams`, and before this guard /fr/get-quote rendered the English calculator with a 200
 * (found in the go-live check, 2026-09-25). Dynamic pages call this instead of `getLocale()`, so
 * the registry stays the one publishing gate for them too.
 */
export async function requirePublishedLocale(key: RouteKey): Promise<Locale> {
  const value = await lang();
  if (!isLocale(value) || !isPublished(key, value)) notFound();
  return value;
}

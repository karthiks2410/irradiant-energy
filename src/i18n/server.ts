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

import { lang } from "next/root-params";
import { DEFAULT_LOCALE, isLocale, type Locale } from "./config";

export async function getLocale(): Promise<Locale> {
  const value = await lang();
  return isLocale(value) ? value : DEFAULT_LOCALE;
}

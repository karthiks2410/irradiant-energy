"use client";

import NextLink from "next/link";
import { usePathname } from "next/navigation";
import type { ComponentProps } from "react";
import type { Locale } from "@/i18n/config";
import { localeFromPathname, localizePath } from "@/i18n/paths";

/**
 * Locale-aware replacement for `next/link`.
 *
 * Every route carries its locale prefix, so a link written as `/about` has to resolve to
 * `/en/about` or `/kn/about` depending on where the reader already is. Doing that in one wrapper
 * — imported in place of `next/link` across the app — is what keeps a reader inside their
 * language: there is no call site left that can forget the prefix.
 *
 * The locale comes from `usePathname()` rather than from a context provider. That is sound only
 * because BOTH locales are prefixed: the prerendered path and the browser's path are the same
 * string, so the server and client renders agree and there is no hydration mismatch. (With an
 * unprefixed English tree behind a rewrite they would not agree — see
 * docs/kannada/research/architecture.md §3, React error #418.)
 *
 * Non-internal hrefs (`tel:`, `mailto:`, `https:`, `#anchor`) pass through untouched.
 */
export function useLocale(): Locale {
  return localeFromPathname(usePathname());
}

/** `localizePath` bound to the current locale, for client code that builds its own hrefs. */
export function useLocalizedPath(): (href: string) => string {
  const locale = useLocale();
  return (href: string) => localizePath(href, locale);
}

type NextLinkProps = ComponentProps<typeof NextLink>;

export function Link({ href, ...props }: NextLinkProps) {
  const locale = useLocale();
  const localized = typeof href === "string" ? (localizePath(href, locale) as typeof href) : href;
  return <NextLink href={localized} {...props} />;
}

export default Link;

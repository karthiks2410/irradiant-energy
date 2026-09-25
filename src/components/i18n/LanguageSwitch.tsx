"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState, type MouseEvent } from "react";
import type { Locale } from "@/i18n/config";
import { HREFLANG, HTML_LANG, LOCALE_LABEL, LOCALES } from "@/i18n/config";
import { counterpartHref, filterSwitchQuery, localeFromPathname } from "@/i18n/paths";

/**
 * The EN | ಕನ್ನಡ toggle: a segmented control, the active language filled solid white.
 *
 * It replaced a ghost pill ("EN / ಕನ್ನಡ") where the only sign of the current language was that the
 * other one was dimmed — the owner found that "less intuitive" (2026-09-25). A filled segment says
 * "you are here" at a glance, and the empty one reads as the other position of a switch. Tapping it
 * fills the new side and clears the old one before the page changes, so it behaves like a toggle
 * rather than a link that happens to sit in a pill.
 *
 * Both languages are shown, so a reader recognises their own without first reading the other. The
 * current one is a `<span aria-current="true">`, not a link: it is where you already are, it needs
 * no tab stop, and assistive tech gets the same information the fill gives everyone else.
 *
 * Deliberately a plain `<a>`, never `next/link`:
 * - `next/link` prefetches on hover, and a prefetch of a Kannada route pulls the Kannada stylesheet
 *   and, once Kannada text renders, the ~88 KB webfont onto an English page. That is exactly the
 *   thing e2e/i18n.spec.ts asserts does not happen (docs/kannada/research/architecture.md §6.8).
 * - a locale change crosses the whole document (`<html lang>`, the font stack, every token), so it
 *   should be a document load, not a client-side transition.
 * - it works with JavaScript off.
 *
 * The href is the counterpart URL: the same path with the prefix swapped, because both locales use
 * the same ASCII slugs. On top of that it carries:
 * - the `#hash`, so switching language at the FAQ or at the form does not throw the reader back to
 *   the top of the page;
 * - ONLY the query keys in SWITCH_QUERY_ALLOWLIST. Legacy redirects forward the old site's query
 *   strings, which are known to carry `name`, `phone` and `email` from quote emails; copying those
 *   onto a new URL would put personal data into a link the visitor never typed.
 *
 * Neither is knowable while rendering on the server, so the href starts as the bare path and an
 * effect adds the tail after hydration (no mismatch: the first client render matches the server).
 * The click handler recomputes it at the moment of the click, which also covers a hash that
 * changed without a `hashchange` event.
 */
export function LanguageSwitch({ className = "" }: { className?: string }) {
  const pathname = usePathname();
  const current = localeFromPathname(pathname);
  const [tail, setTail] = useState("");
  /** The side the visitor just tapped: it fills while the old side clears, then the page changes. */
  const [pending, setPending] = useState<Locale | null>(null);
  const shown = pending ?? current;

  useEffect(() => {
    const read = () =>
      setTail(
        filterSwitchQuery(window.location.search) +
          (window.location.hash && window.location.hash !== "#" ? window.location.hash : ""),
      );
    read();
    window.addEventListener("hashchange", read);
    return () => window.removeEventListener("hashchange", read);
  }, [pathname]);

  function handleClick(event: MouseEvent<HTMLAnchorElement>, to: (typeof LOCALES)[number]) {
    // Leave modified clicks alone so "open in new tab" still works; they use the href attribute.
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
      return;
    }
    event.preventDefault();
    const href = counterpartHref({
      pathname: window.location.pathname,
      search: window.location.search,
      hash: window.location.hash,
      to,
    });
    // Let the fill move first, so the tap is seen to flip the switch. Without motion, go at once.
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    setPending(to);
    window.setTimeout(() => window.location.assign(href), reduced ? 0 : 170);
  }

  const segment = (locale: Locale) =>
    `inline-flex min-h-10 items-center justify-center rounded-full px-3 transition-colors duration-200 ease-controlled ${
      locale === "kn" ? "font-kn-system" : ""
    } ${locale === shown ? "bg-white text-teal-900 shadow-[0_1px_2px_rgb(0_0_0/0.25)]" : "text-white/85 hover:bg-white/10 hover:text-white"}`;

  return (
    <div
      role="group"
      aria-label="Language"
      data-language-switch=""
      // The track: 2px of padding around 40px segments keeps the whole control 44px tall.
      // `grid-cols-[1fr_1fr]`, not `grid-cols-2`: Tailwind's version is minmax(0, 1fr), which let the
      // columns shrink to nothing inside the header's flex row, so the quote button drew over "ಕನ್ನಡ".
      className={`inline-grid shrink-0 grid-cols-[1fr_1fr] items-center gap-0.5 rounded-full bg-white/10 p-0.5 text-[0.8125rem] font-bold ring-1 ring-white/25 ring-inset ${className}`}
    >
      {LOCALES.map((locale) =>
        locale === current ? (
          <span key={locale} aria-current="true" lang={HTML_LANG[locale]} className={segment(locale)}>
            {LOCALE_LABEL[locale]}
          </span>
        ) : (
          <a
            key={locale}
            href={counterpartHref({ pathname, to: locale }) + tail}
            hrefLang={HREFLANG[locale]}
            lang={HTML_LANG[locale]}
            onClick={(event) => handleClick(event, locale)}
            className={segment(locale)}
          >
            {LOCALE_LABEL[locale]}
          </a>
        ),
      )}
    </div>
  );
}
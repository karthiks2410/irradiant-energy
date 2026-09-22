"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState, type MouseEvent } from "react";
import { HREFLANG, HTML_LANG, LOCALE_LABEL, LOCALES } from "@/i18n/config";
import { counterpartHref, filterSwitchQuery, localeFromPathname } from "@/i18n/paths";

/**
 * The EN / ಕನ್ನಡ switch (owner's prototype: a ghost pill — transparent, 1px white border, white
 * bold text).
 *
 * Both languages are shown, so a reader recognises their own without first reading the other. The
 * current one is a `<span aria-current="true">`, not a link: it is where you already are, it needs
 * no tab stop, and assistive tech gets the same information the colour gives everyone else.
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
    window.location.assign(
      counterpartHref({
        pathname: window.location.pathname,
        search: window.location.search,
        hash: window.location.hash,
        to,
      }),
    );
  }

  return (
    <div
      role="group"
      aria-label="Language"
      data-language-switch=""
      className={`inline-flex shrink-0 items-center rounded-full border border-white/34 text-[0.8125rem] font-bold text-white ${className}`}
    >
      {LOCALES.map((locale, index) => (
        <span key={locale} className="inline-flex items-center">
          {index > 0 && (
            <span aria-hidden="true" className="text-white/40">
              /
            </span>
          )}
          {locale === current ? (
            <span
              aria-current="true"
              lang={HTML_LANG[locale]}
              // The current language is the opaque one; the other is dimmed until hovered.
              className={`inline-flex min-h-11 items-center px-2.5 text-white ${locale === "kn" ? "font-kn-system" : ""}`}
            >
              {LOCALE_LABEL[locale]}
            </span>
          ) : (
            <a
              href={counterpartHref({ pathname, to: locale }) + tail}
              hrefLang={HREFLANG[locale]}
              lang={HTML_LANG[locale]}
              onClick={(event) => handleClick(event, locale)}
              // min-h-11 on the anchor itself, not on the wrapper: the 44px target has to be the
              // thing you tap.
              className={`inline-flex min-h-11 items-center px-2.5 text-white/65 transition-colors duration-200 hover:text-white ${
                locale === "kn" ? "font-kn-system" : ""
              }`}
            >
              {LOCALE_LABEL[locale]}
            </a>
          )}
        </span>
      ))}
    </div>
  );
}

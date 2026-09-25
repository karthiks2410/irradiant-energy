"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState, type CSSProperties, type MouseEvent } from "react";
import type { Locale } from "@/i18n/config";
import { HREFLANG, HTML_LANG, LOCALE_LABEL, LOCALES } from "@/i18n/config";
import { counterpartHref, filterSwitchQuery, localeFromPathname } from "@/i18n/paths";

/**
 * How long the thumb takes to cross, and how long the page waits before it changes. One number, so
 * the page never leaves before the thumb has arrived. It reaches the CSS as `--slide`.
 */
const SLIDE_MS = 220;

/**
 * The EN | ಕನ್ನಡ toggle: a slider switch, a white thumb resting under the current language.
 *
 * It began as a ghost pill ("EN / ಕನ್ನಡ") where the only sign of the current language was that the
 * other one was dimmed; the owner found that "less intuitive" (2026-09-25), so it became a segmented
 * control with the active side filled. The fill still jumped from one side to the other, though, and
 * the owner asked for more: "make the en/kan toggle in the header like a slider for better feel for
 * the user" (2026-09-25). So there is one thumb, and a tap slides it across the track before the page
 * changes. A thumb that travels is what makes it read as a switch that was flipped rather than a
 * link that was followed, and the label under it turns dark as it arrives.
 *
 * Tapping anywhere on it flips it, because a two-position switch has no wrong place to press. The
 * link to the other language is stretched over the whole track (its `::after`), rather than a click
 * handler on the track, so that a tap on the current label, a no-JS tap and a cmd/ctrl/middle click
 * all do what the link does. The focus ring is drawn on that same `::after`, around the whole
 * switch, because that is what the link covers.
 *
 * Both languages are shown, so a reader recognises their own without first reading the other. The
 * current one is a `<span aria-current="true">`, not a link: it is where you already are, it needs
 * no tab stop, and assistive tech gets the same information the thumb gives everyone else.
 *
 * The thumb's resting side comes from the pathname's locale, which the server knows as well as the
 * client, so the first client render matches the server's; only a tap moves it. With reduced motion
 * the global rule in globals.css drops the transition, and the page changes at once.
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
  /** The side the visitor just tapped: the thumb slides there, then the page changes. */
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

  // Back from the other language can restore this page from the back/forward cache with the thumb
  // still on the side it slid to. Put it back under the language this page is actually in.
  useEffect(() => {
    const restore = (event: PageTransitionEvent) => {
      if (event.persisted) setPending(null);
    };
    window.addEventListener("pageshow", restore);
    return () => window.removeEventListener("pageshow", restore);
  }, []);

  function handleClick(event: MouseEvent<HTMLAnchorElement>, to: Locale) {
    // Leave modified clicks alone so "open in new tab" still works; they use the href attribute.
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
      return;
    }
    event.preventDefault();
    // Already on its way: a second tap must not queue a second navigation.
    if (pending) return;
    const href = counterpartHref({
      pathname: window.location.pathname,
      search: window.location.search,
      hash: window.location.hash,
      to,
    });
    // Let the thumb cross first, so the tap is seen to flip the switch. Without motion, go at once.
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    setPending(to);
    window.setTimeout(() => window.location.assign(href), reduced ? 0 : SLIDE_MS);
  }

  // Timed with the thumb, so a label turns dark as the thumb arrives under it, not before.
  const label = (locale: Locale) =>
    `inline-flex min-h-11 items-center justify-center rounded-full px-3 transition-colors duration-(--slide) ease-controlled ${
      locale === "kn" ? "font-kn-system" : ""
    } ${locale === shown ? "text-teal-900" : "text-white/85 group-hover:text-white"}`;

  return (
    <div
      role="group"
      aria-label="Language"
      data-language-switch=""
      style={{ "--slide": `${SLIDE_MS}ms` } as CSSProperties}
      // The track, 44px tall; the labels fill it, so the link is a 44px target on its own.
      // `grid-cols-[1fr_1fr]`, not `grid-cols-2`: Tailwind's version is minmax(0, 1fr), which let the
      // columns shrink to nothing inside the header's flex row, so the quote button drew over "ಕನ್ನಡ".
      // Equal columns are also what let the thumb be half the track and travel exactly one column.
      // `isolate` keeps the z-indices below inside the switch.
      className={`group relative isolate inline-grid shrink-0 grid-cols-[1fr_1fr] items-center rounded-full bg-white/10 text-[0.8125rem] font-bold ring-1 ring-white/25 transition-colors duration-200 ease-controlled ring-inset hover:bg-white/15 ${className}`}
    >
      {/* The thumb: one column wide less a 2px inset, moved with `translate` so it stays on the compositor. */}
      <span
        aria-hidden="true"
        className={`pointer-events-none absolute inset-y-0.5 left-0.5 w-[calc(50%-0.25rem)] rounded-full bg-white shadow-[0_1px_2px_rgb(0_0_0/0.25)] transition-transform duration-(--slide) ease-controlled ${
          shown === LOCALES[0] ? "translate-x-0" : "translate-x-[calc(100%+0.25rem)]"
        }`}
      />
      {LOCALES.map((locale) =>
        locale === current ? (
          // `relative` lifts the label over the thumb, which is positioned and earlier in the DOM.
          <span key={locale} aria-current="true" lang={HTML_LANG[locale]} className={`relative ${label(locale)}`}>
            {LOCALE_LABEL[locale]}
          </span>
        ) : (
          <a
            key={locale}
            href={counterpartHref({ pathname, to: locale }) + tail}
            hrefLang={HREFLANG[locale]}
            lang={HTML_LANG[locale]}
            onClick={(event) => handleClick(event, locale)}
            // Not positioned, so its `::after` fills the track (the nearest positioned box) and the
            // whole switch is the link. `z-10` puts that layer over the current label, which may come
            // after it in the DOM. The ring moves from the link's own box to the `::after`.
            className={`z-10 ${label(locale)} outline-none after:absolute after:inset-0 after:rounded-full after:content-[''] focus-visible:after:outline-2 focus-visible:after:outline-offset-2 focus-visible:after:outline-yellow-400`}
          >
            {LOCALE_LABEL[locale]}
          </a>
        ),
      )}
    </div>
  );
}

"use client";

import { Link } from "@/components/i18n/LocaleLink";
import { useEffect, useRef } from "react";
import { acceptButton, inlineLink, rejectButton, secondaryButton } from "@/components/consent/styles";

/**
 * The first-visit consent prompt.
 *
 * Copy rules this component exists to keep (docs/discovery/18 §9.5, 17 §2.6):
 * - It describes what is true **today** — nothing is loaded — and what would happen on an accept.
 *   It must never claim that measurement is running. If a provider is ever added, this copy already
 *   covers it and does not need to be softened.
 * - Refusing costs the visitor nothing, and the banner says so, because it is true.
 * - Accept and Reject are the same control in two hues (components/consent/styles.ts).
 *
 * Behaviour rules:
 * - It holds the page until the visitor answers (owner direction, 2026-09-20), so it is a real
 *   modal: `aria-modal="true"`, and <ConsentManager> marks the rest of the document `inert` and
 *   locks scrolling while it is up. Worth recording that this is a cookie wall, which DPDP
 *   guidance treats as a dark pattern (17 §2.6) and which this site does not need, since nothing
 *   loads before consent either way. It is defensible only because Reject sits beside Accept at
 *   the same size and costs the visitor nothing.
 * - The centring wrapper is still `pointer-events-none`: it is full-width, so it would otherwise
 *   swallow clicks in the band beside the card. That matters again the moment the lock is lifted.
 * - It is `position: fixed`, so it never shifts the layout, and it clears the iOS home indicator
 *   with a safe-area bottom pad.
 * - Focus moves here once, when it appears, so a keyboard or screen-reader visitor meets the
 *   question instead of discovering it at the end of the page, and goes back where it came from
 *   when the banner leaves. `preventScroll` keeps the viewport where it was. The container is a
 *   labelled, non-modal dialog, which is what a screen reader announces on that focus move — so the
 *   banner carries no `aria-live` of its own (the outcome of a choice is announced by the manager's
 *   polite status region instead, which avoids a double read).
 * - The entrance is a CSS `@starting-style` transition of opacity and `translate` only. Under
 *   prefers-reduced-motion the global rule in globals.css collapses every transition to 0.01ms, so
 *   it is a genuine no-op, and `motion-reduce:transition-none` says so locally as well.
 */

type ConsentBannerProps = {
  onAccept: () => void;
  onReject: () => void;
  onManage: () => void;
};

export function ConsentBanner({ onAccept, onReject, onManage }: ConsentBannerProps) {
  const region = useRef<HTMLElement>(null);

  useEffect(() => {
    const previous = document.activeElement;
    region.current?.focus({ preventScroll: true });
    return () => {
      // On the way out (the visitor answered), hand focus back to whatever the question
      // interrupted. On a fresh page load that is the document body, so nothing is forced.
      if (previous instanceof HTMLElement && previous !== document.body && previous.isConnected) {
        previous.focus({ preventScroll: true });
      }
    };
  }, []);

  return (
    // Above the fixed header (z-50) and below the skip link (z-100).
    //
    // The centring wrapper spans the full width, so without `pointer-events-none` it would
    // swallow every click in the band beside the card — an invisible dead strip across the
    // foot of the page, which is exactly the "page is locked" behaviour this banner is meant
    // not to have. Pointer events are handed back on the card itself.
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-60 flex justify-center px-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:px-6">
      {/* translate-y-0 / opacity-100 are explicit so the @starting-style transition has a resolved
          end value to run towards. */}
      <section
        ref={region}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-labelledby="consent-banner-title"
        data-lenis-prevent
        className="pointer-events-auto max-h-[80dvh] w-full max-w-5xl translate-y-0 overflow-y-auto rounded-md border border-mist bg-white p-4 opacity-100 shadow-overlay outline-none transition-[opacity,translate] duration-500 ease-controlled sm:px-5 starting:translate-y-6 starting:opacity-0 motion-reduce:transition-none"
      >
        {/* One line, not a card. This sits over the page the visitor came to read and follows
            them down all of it, so it has to be small: the full version took 46% of a 390px
            phone screen the whole way down the home page. The heading is visually hidden rather
            than removed, because the dialog still needs a name.

            What stays visible is the purpose, which is the part that makes the choice informed:
            what we load today, what an accept would allow, and that a refusal costs nothing.
            The detail behind it is one tap away in Manage preferences and in the cookie notice. */}
        <h2 id="consent-banner-title" className="sr-only">
          We value your privacy
        </h2>

        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:gap-6">
          <p className="text-small text-ink-2">
            <span className="font-medium text-carbon">This site loads no analytics and sets no tracking cookies.</span>{" "}
            Accept and we may count page visits — no name, no profile, no tracking across other sites. Refuse and
            nothing loads.{" "}
            <Link href="/cookies" className={inlineLink}>
              Cookie notice
            </Link>
            .
          </p>

          {/* The two answers are the same size, side by side, at every width, so neither reads
              as the expected one. "Manage preferences" is the only secondary control. */}
          <div className="grid shrink-0 grid-cols-2 gap-2 lg:flex lg:items-center lg:gap-3">
            <button type="button" onClick={onAccept} className={acceptButton}>
              Accept
              <span className="sr-only"> analytics</span>
            </button>
            <button type="button" onClick={onReject} className={rejectButton}>
              Reject
              <span className="sr-only"> analytics</span>
            </button>
            <button type="button" onClick={onManage} className={`${secondaryButton} col-span-2 lg:col-span-1 lg:whitespace-nowrap`}>
              Manage preferences
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

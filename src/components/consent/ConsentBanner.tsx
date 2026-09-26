"use client";

import { Link } from "@/components/i18n/LocaleLink";
import { useEffect, useRef } from "react";
import { RichText } from "@/components/i18n/RichText";
import { acceptButton, inlineLink, rejectButton, secondaryButton } from "@/components/consent/styles";
import type { Ui } from "@/content/ui";

/**
 * The first-visit consent prompt.
 *
 * Copy rules this component exists to keep (docs/discovery/18 §9.5, 17 §2.6):
 * - It describes what is true in every build: nothing optional loads before an answer, and an
 *   accept allows Google Analytics to count visits ("may": a build without a measurement ID loads
 *   nothing either way). It must never claim that measurement is running.
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
  /** `ui.consent.banner`, handed down by <ConsentManager> from the page's own locale. */
  copy: Ui["consent"]["banner"];
  onAccept: () => void;
  onReject: () => void;
  onManage: () => void;
};

export function ConsentBanner({ copy, onAccept, onReject, onManage }: ConsentBannerProps) {
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
            that nothing optional loads unasked, what an accept would allow, and that a refusal
            costs nothing.
            The detail behind it is one tap away in Manage preferences and in the cookie notice. */}
        <h2 id="consent-banner-title" className="sr-only">
          {copy.title}
        </h2>

        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:gap-6">
          <p className="text-small text-ink-2">
            {/* One sentence in the content, with the opening emphasis and the notice link as named
                slots. Kannada does not put the link where English does, and this is the string a
                DPDP notice is judged on, so it is not broken into three JSX children. */}
            <RichText
              text={copy.body}
              slots={{
                lead: (inner) => <span className="font-medium text-carbon">{inner}</span>,
                cookieLink: (inner) => (
                  <Link href="/cookies" className={inlineLink}>
                    {inner}
                  </Link>
                ),
              }}
            />
          </p>

          {/* The two answers are the same size, side by side, at every width, so neither reads
              as the expected one. "Manage preferences" is the only secondary control. */}
          <div className="grid shrink-0 grid-cols-2 gap-2 lg:flex lg:items-center lg:gap-3">
            {/* The accessible name is a whole string, not the visible label plus a hidden suffix:
                "Accept" + " analytics" only reads as a phrase in English. */}
            <button
              type="button"
              data-consent-accept
              onClick={onAccept}
              aria-label={copy.acceptAria}
              className={acceptButton}
            >
              {copy.accept}
            </button>
            {/* Found by attribute in the e2e suite: the accessible name is localised. */}
            <button
              type="button"
              data-consent-reject
              onClick={onReject}
              aria-label={copy.rejectAria}
              className={rejectButton}
            >
              {copy.reject}
            </button>
            <button
              type="button"
              onClick={onManage}
              className={`${secondaryButton} col-span-2 lg:col-span-1 lg:whitespace-nowrap`}
            >
              {copy.manage}
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

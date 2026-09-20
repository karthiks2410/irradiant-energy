"use client";

import Link from "next/link";
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
 * - It does not block the page. No overlay, no `inert` behind it, no focus trap: Tab leaves it and
 *   walks the page, exactly as if it were the last block of the document. The old site locked the
 *   page until a choice was made (17 §2.6) — that is a dark pattern and an accessibility failure.
 *   The centring wrapper is `pointer-events-none` for the same reason: it is full-width, so it
 *   would otherwise make the whole bottom band of every page unclickable until the visitor
 *   answered, which is the same failure wearing an invisible coat.
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
        aria-modal="false"
        aria-labelledby="consent-banner-title"
        data-lenis-prevent
        className="pointer-events-auto max-h-[80dvh] w-full max-w-3xl translate-y-0 overflow-y-auto rounded-lg border border-mist bg-white p-4 opacity-100 shadow-overlay outline-none transition-[opacity,translate] duration-500 ease-controlled sm:p-6 starting:translate-y-6 starting:opacity-0 motion-reduce:transition-none"
      >
        {/* The eyebrow is desktop-only. On a phone this card has to earn every pixel it takes,
            and the heading directly below already says the same word. */}
        <p className="hidden font-mono text-label text-green-700 uppercase sm:block">Your privacy</p>
        <h2 id="consent-banner-title" className="font-display text-h4 font-bold text-carbon sm:mt-2 sm:text-h3">
          We value your privacy
        </h2>

        <p className="mt-2 text-small text-ink-2 sm:mt-3">
          This site loads no analytics and sets no tracking cookies. We are asking before that changes, not after.
        </p>
        {/* The purpose statement. It stays at every width — it is what makes the choice an
            informed one — but it is tightened, because a card that covers the page it is asking
            about is its own kind of dark pattern. */}
        <p className="mt-2 text-small text-ink-2">
          Accept and we may count page visits — no name, no profile, no tracking across other sites. Refuse and
          nothing loads. Either way the site works the same.
        </p>

        {/* The two answers are side by side at every width, the same size, in the same row, so
            neither reads as the expected one. "Manage preferences" is the only secondary control. */}
        <div className="mt-4 grid grid-cols-2 gap-2 sm:mt-5 sm:gap-3 sm:grid-cols-3">
          <button type="button" onClick={onAccept} className={acceptButton}>
            Accept
            <span className="sr-only"> analytics</span>
          </button>
          <button type="button" onClick={onReject} className={rejectButton}>
            Reject
            <span className="sr-only"> analytics</span>
          </button>
          <button type="button" onClick={onManage} className={`${secondaryButton} col-span-2 sm:col-span-1`}>
            Manage preferences
          </button>
        </div>

        <p className="mt-3 text-small text-grey-600 sm:mt-4">
          More in our{" "}
          <Link href="/cookies" className={inlineLink}>
            cookie notice
          </Link>{" "}
          and{" "}
          <Link href="/privacy" className={inlineLink}>
            privacy notice
          </Link>
          .{" "}
          {/* Where to change the answer matters, but it is not needed to make the choice, so the
              phone keeps the short form and the footer link itself carries the rest. */}
          <span className="hidden sm:inline">
            You can change your answer any time under{" "}
            <span className="font-medium text-ink-2">Cookie settings</span> in the footer.
          </span>
          <span className="sm:hidden">Changeable any time under Cookie settings.</span>
        </p>
      </section>
    </div>
  );
}

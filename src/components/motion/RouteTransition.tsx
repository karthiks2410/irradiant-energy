"use client";

import { LazyMotion, domAnimation, m, useReducedMotion } from "motion/react";
import { usePathname } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { EASE_OUT_EXPO, ROUTE_DURATION } from "./tokens";

/**
 * Set once the first page has been painted in this browser session. It lives outside the component
 * on purpose: the component is re-created on every navigation (see the key below), so component
 * state cannot tell a fresh page load from a route change. The `typeof window` guard is not
 * cosmetic — module scope on the server is shared between requests, so without it the second
 * visitor to hit the same server instance would be sent HTML with the page faded out.
 */
let hasPaintedOnce = false;

/**
 * Cross-fade on route change (owner review 2, point 2 — "when I click it's bam, not smooth").
 *
 * Why opacity only, with no rise: a `transform` on an element makes it the containing block for any
 * `position: fixed` descendant. The quote page's <MobileSummaryBar> is fixed to the bottom of the
 * viewport, and a transform on this wrapper would re-anchor it to the bottom of the whole document
 * for the length of the animation — the bar would vanish and then pop back. The same is true of
 * `filter` and of `will-change: transform`. Opacity creates a stacking context but never a
 * containing block, so it is the one property that is safe to put around an entire page. The rise
 * the owner asked for lives in <Reveal>, on the sections, where it belongs.
 *
 * First load is a no-op: the wrapper renders at full opacity with no animation, so nothing delays
 * the LCP and the server HTML is readable with JavaScript off. Reduced motion is a no-op too.
 *
 * Scroll behaviour is untouched. There is no exit animation and nothing is held mounted, so the
 * router's own scroll reset runs exactly as before.
 */
export function RouteTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const reduced = useReducedMotion();

  // Captured once per mount, before the effect below flips the flag.
  const [firstPaint] = useState(() => typeof window === "undefined" || !hasPaintedOnce);
  useEffect(() => {
    hasPaintedOnce = true;
  }, []);

  const animated = !firstPaint && !reduced;

  return (
    <LazyMotion features={domAnimation} strict>
      {/*
        Keyed on the pathname so the fade also plays for navigations that do not remount this
        template. Next gives the root template.tsx a key from the first path segment only
        (docs: 01-app/03-api-reference/03-file-conventions/template.md, "Templates during navigation
        and remounting"), so /solutions → /solutions/solar/home, and one audience page to the next,
        would otherwise switch with no transition at all. usePathname ignores the hash and the query
        string, so in-page anchors and the quote page's ?token= links do not retrigger it.
      */}
      <m.div
        key={pathname}
        initial={animated ? { opacity: 0 } : false}
        animate={{ opacity: 1 }}
        transition={{ duration: ROUTE_DURATION, ease: EASE_OUT_EXPO }}
      >
        {children}
      </m.div>
    </LazyMotion>
  );
}

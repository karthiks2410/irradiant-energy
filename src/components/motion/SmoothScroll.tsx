"use client";

import type Lenis from "lenis";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import "lenis/dist/lenis.css";

const headerHeight = () => Number.parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--header-h")) || 0;

/**
 * Lenis smooth scrolling (decisions.md D-006): fine pointers only, never under reduced motion, loaded
 * after idle so it stays off the critical path. Lenis itself honours `data-lenis-prevent` (mobile menu,
 * dialogs, scroll areas). Same-page anchors scroll to the target minus the fixed header; use plain
 * <a href="#id"> for those, not <Link>, which scrolls on its own. Renders nothing.
 */
export function SmoothScroll() {
  const lenisRef = useRef<Lenis | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    const eligible =
      window.matchMedia("(pointer: fine)").matches && !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!eligible) return;

    let cancelled = false;
    const idle = window.requestIdleCallback ?? ((callback: () => void) => window.setTimeout(callback, 200));

    idle(() => {
      import("lenis").then(({ default: LenisClass }) => {
        if (cancelled) return;
        lenisRef.current = new LenisClass({
          autoRaf: true,
          // Owner review 2, point 12: back to the settings from their own site, which they called
          // out as "so smooth". 0.1 is Lenis's own default and trails the wheel by about a fifth of
          // a second — that lag IS the glide. Touch stays native (syncTouch off) so phones keep the
          // platform's momentum and rubber-banding.
          lerp: 0.1,
          smoothWheel: true,
          syncTouch: false,
          wheelMultiplier: 1,
          // Without this, clicking a nav link while the wheel inertia is still settling leaves Lenis
          // animating towards the old scroll target. Its rAF loop then overwrites the scroll reset
          // the router just did and drags the visitor back to where they were on the previous page —
          // owner review 2, point 1 ("click About and you are still in the home hero"). Lenis resets
          // its inertia on any same-host click that changes the pathname.
          stopInertiaOnNavigate: true,
          anchors: { offset: -(headerHeight() + 16) },
        });
      });
    });

    return () => {
      cancelled = true;
      lenisRef.current?.destroy();
      lenisRef.current = null;
    };
  }, []);

  // Second half of the same guard, for navigations that are not a link click (the mobile menu's
  // router.push, back/forward, a redirect). The router sets the scroll position synchronously during
  // the commit — layout-router.js calls handlePotentialScroll from componentDidMount/DidUpdate — so
  // by the time this passive effect runs, window.scrollY is already where the new route should start,
  // whether that is the top of a fresh page or a restored position on Back. All this does is make
  // Lenis's internal position agree with it; it never decides the position itself, so anchor deep
  // links and scroll restoration keep working. The extra frame covers a late layout shift changing
  // the document height.
  useEffect(() => {
    const lenis = lenisRef.current;
    if (!lenis) return;

    const sync = () => {
      lenis.resize();
      if (Math.round(lenis.targetScroll) !== Math.round(window.scrollY)) {
        lenis.scrollTo(window.scrollY, { immediate: true, force: true });
      }
    };

    sync();
    const frame = requestAnimationFrame(sync);
    return () => cancelAnimationFrame(frame);
  }, [pathname]);

  return null;
}

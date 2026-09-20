"use client";

import type Lenis from "lenis";
import { useEffect } from "react";
import "lenis/dist/lenis.css";

const headerHeight = () => Number.parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--header-h")) || 0;

/**
 * Lenis smooth scrolling (decisions.md D-006): fine pointers only, never under reduced motion, loaded
 * after idle so it stays off the critical path. Lenis itself honours `data-lenis-prevent` (mobile menu,
 * dialogs, scroll areas). Same-page anchors scroll to the target minus the fixed header; use plain
 * <a href="#id"> for those, not <Link>, which scrolls on its own. Renders nothing.
 */
export function SmoothScroll() {
  useEffect(() => {
    const eligible =
      window.matchMedia("(pointer: fine)").matches && !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!eligible) return;

    let lenis: Lenis | undefined;
    let cancelled = false;
    const idle = window.requestIdleCallback ?? ((callback: () => void) => window.setTimeout(callback, 200));

    idle(() => {
      import("lenis").then(({ default: LenisClass }) => {
        if (cancelled) return;
        lenis = new LenisClass({ autoRaf: true, anchors: { offset: -(headerHeight() + 16) } });
      });
    });

    return () => {
      cancelled = true;
      lenis?.destroy();
    };
  }, []);

  return null;
}

"use client";

import { LazyMotion, domAnimation, m, useReducedMotion, useScroll, useSpring } from "motion/react";
import { useSyncExternalStore } from "react";

// Hydration-safe "are we on the client yet" check. The store never changes, so `subscribe` has
// nothing to do; React simply uses the server snapshot for the hydration render and the client one
// from the next render on. No state is set from an effect, so no cascading render.
const subscribe = () => () => {};
const onClient = () => true;
const onServer = () => false;

/**
 * Reading-progress bar pinned to the very top of the viewport, filling left to right as the page
 * scrolls (owner review 2, point 12 — the device they liked on irradiantenergie.com).
 *
 * Colour: Solar Yellow. The brand rule caps yellow at 3–8% of a layout, and this bar is nowhere
 * near it — 3px across a 900px-tall viewport is about 0.3% of the screen — while yellow is the one
 * brand colour that reads clearly against both the Deep Teal header it sits on and the Energy White
 * canvas below it. Radiant Green would disappear into the header's own green accents.
 *
 * `useSpring` smooths the raw scroll progress so the bar glides instead of stepping with each wheel
 * tick; it is the same stiffness/damping the owner's old site used.
 *
 * Accessibility: purely decorative, so `aria-hidden` and no role — the page's real position is
 * already conveyed by the scrollbar. Under prefers-reduced-motion it is not rendered at all: a
 * spring-driven bar that lurches with every jump is worse than no bar. `pointer-events-none` keeps
 * it from ever swallowing a click meant for the header underneath.
 *
 * Mounted once in the root layout, above the header in the stacking order (header is z-50).
 */
export function ScrollProgress() {
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 120, damping: 30, restDelta: 0.001 });

  // Rendered only after hydration. The bar is meaningless in the server HTML (progress is always 0,
  // so it would be invisible anyway), and deciding on the client alone keeps the reduced-motion
  // branch free of any hydration mismatch.
  const mounted = useSyncExternalStore(subscribe, onClient, onServer);

  if (!mounted || reduced) return null;

  return (
    <LazyMotion features={domAnimation} strict>
      <m.div
        aria-hidden="true"
        style={{ scaleX }}
        className="pointer-events-none fixed inset-x-0 top-0 z-60 h-[3px] origin-left bg-yellow-400"
      />
    </LazyMotion>
  );
}

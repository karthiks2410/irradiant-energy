"use client";

import { LazyMotion, animate, domAnimation, m, useMotionValue, useReducedMotion, useTransform } from "motion/react";
import { useEffect, useRef } from "react";
import { EASE_OUT_EXPO, TICKER_DURATION } from "./tokens";

type TickerNumberProps = {
  /** The figure itself, unformatted. */
  value: number;
  /** Turns an in-between value into display text, e.g. `(n) => formatInr(Math.round(n))`. */
  format: (value: number) => string;
  /**
   * Count up from zero the first time this mounts. Off by default: a figure that is merely
   * re-rendered should not replay. Worth turning on where the number is the thing the visitor
   * just asked for and it appears where there was nothing.
   */
  countUpOnMount?: boolean;
  className?: string;
};

/**
 * A figure that travels to its new value instead of cutting to it.
 *
 * This is the owner's previous site's behaviour, which they asked for back: changing an input
 * used to snap the results, and a number that snaps reads as a different number rather than the
 * same number moving.
 *
 * Why a tween and not a spring. The old site sprang the value (stiffness 40, damping 24), and a
 * spring only approaches its target — at those settings a figure in the lakhs took more than six
 * seconds to arrive at its last rupee, long after it had stopped looking like it was moving.
 * Slackening the damping cut that to under three, which is still a tail rather than a landing.
 * A fixed duration on the site's own ease-out curve lands exactly on time whatever the distance,
 * which is what a counter needs, and the curve is monotonic so a money figure never flashes a
 * number above the real one on the way.
 *
 * Accessibility:
 * - The moving digits are hidden from assistive technology. The results sit in an aria-live
 *   region, and a live region over a counting number would announce every frame.
 * - The settled value is rendered beside them, visually hidden, so screen readers get one
 *   announcement of the real figure. It only changes when `value` does, because the animation
 *   drives the DOM through a motion value rather than through React state.
 * - Under prefers-reduced-motion the figure is set outright and nothing animates.
 *
 * Always give it `tabular-nums` (StatTile does) or the text reflows on every frame.
 */
export function TickerNumber({ value, format, countUpOnMount = false, className = "" }: TickerNumberProps) {
  const reduced = useReducedMotion();
  const settled = format(value);

  // `format` is written inline at every call site, so its identity changes on every render.
  // Reading it through a ref keeps that from restarting the animation on an unrelated render.
  // It has to be declared before `useTransform`, which runs the closure straight away.
  const formatRef = useRef(format);
  formatRef.current = format;

  const motionValue = useMotionValue(value);
  const display = useTransform(motionValue, (current) => formatRef.current(current));

  const started = useRef(false);
  useEffect(() => {
    // `useReducedMotion` is null until it has read the media query. While it is, the figure
    // renders as plain text below, so there is nothing to drive yet.
    if (reduced === null) return;

    const first = !started.current;
    started.current = true;

    if (reduced || (first && !countUpOnMount)) {
      motionValue.jump(value);
      return;
    }
    if (first) motionValue.jump(0);

    const controls = animate(motionValue, value, { duration: TICKER_DURATION, ease: EASE_OUT_EXPO });
    return () => controls.stop();
  }, [value, reduced, countUpOnMount, motionValue]);

  // No motion wanted, or the preference is not known yet: the figure is simply text. Driving
  // the span from the motion value here would leave the old number on screen for a frame,
  // because the jump above only runs after paint — a flicker, which is the one thing a
  // reduced-motion visitor asked not to have.
  if (reduced !== false) return <span className={className}>{settled}</span>;

  return (
    <LazyMotion features={domAnimation} strict>
      <m.span aria-hidden="true" className={className}>
        {display}
      </m.span>
      <span className="sr-only">{settled}</span>
    </LazyMotion>
  );
}

/**
 * Shared motion tokens. One source for every JS-driven animation so reveals, route changes and the
 * scroll bar move on the same curve.
 *
 * `--ease-controlled` in globals.css (cubic-bezier(0.22, 1, 0.36, 1)) stays the curve for CSS micro
 * interactions — hovers, colour changes, 200 ms stuff. The curve below is a step more expressive:
 * it leaves fast and settles long, which is what makes a section read as arriving rather than
 * fading. It is the same curve as the owner's previous site (EASE_OUT_EXPO in
 * irradiant-energies/src/lib/motion.ts), which they singled out as feeling "lively".
 */
export const EASE_OUT_EXPO = [0.16, 1, 0.3, 1] as const;

/** Section reveal: tall enough to read as movement, short enough not to hold the page up. */
export const REVEAL_RISE = 28;
export const REVEAL_DURATION = 0.62;

/** Route change: opacity only (see RouteTransition for why), so it has to be quick. */
export const ROUTE_DURATION = 0.34;

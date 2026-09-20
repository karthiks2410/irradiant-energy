/**
 * Shared classes for the consent UI.
 *
 * `acceptButton` and `rejectButton` differ in exactly one thing: the hue of the fill. Same element,
 * same geometry, same weight, same minimum height, same contrast class of label. That is not a
 * stylistic preference — under the CCPA dark-pattern guidelines and the DPDP standard for free
 * consent, refusing has to be exactly as easy and as prominent as accepting
 * (docs/discovery/18 §9.5.3; 17 §6.5). They are defined together, here, so nobody can "improve"
 * one of them in isolation.
 *
 * Do not give accept a larger size, a brighter fill, an arrow, an icon, a default focus, or a
 * position that reads as the obvious one. Do not turn reject into a text link.
 */

const choiceButtonBase =
  "inline-flex min-h-11 w-full items-center justify-center rounded-full px-5 py-2.5 text-center font-sans text-ui font-semibold text-white transition-colors duration-200 ease-controlled";

/** White on green-700 — 5.58:1 (report §6.4). */
export const acceptButton = `${choiceButtonBase} bg-green-700 hover:bg-teal-900`;

/** White on teal-900 — same shape, same size, same solid fill. */
export const rejectButton = `${choiceButtonBase} bg-teal-900 hover:bg-teal-950`;

/** Third, genuinely secondary action: opens the per-category detail. Never a fourth "choice". */
export const secondaryButton =
  "inline-flex min-h-11 w-full items-center justify-center rounded-full border border-teal-900/60 px-5 py-2.5 font-sans text-ui font-semibold text-teal-900 transition-colors duration-200 ease-controlled hover:border-teal-900 hover:bg-canvas";

export const inlineLink =
  "font-medium text-green-700 underline underline-offset-2 transition-colors hover:text-teal-900";

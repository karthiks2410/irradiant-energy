/**
 * Small helpers shared by the /get-quote islands.
 *
 * The words themselves moved out. They used to be literals here — segment descriptions, the flag
 * notes, the disclaimer — and a literal cannot be overlaid in a second language, so they now live
 * in `src/content/quote.ts` and reach the islands as props from the page
 * (docs/kannada/research/architecture.md §6.6). What is left is the code: the number format, the
 * one query parameter this flow reads, and the field lengths the server enforces.
 */

import type { RadioCardOption } from "@/components/ui";
import { EMAIL_MAX, MESSAGE_MAX, NAME_MAX } from "@/lib/leads/limits";
import { SEGMENTS, type Segment } from "@/lib/solar/constants";

/**
 * en-IN integer grouping for unit figures (kWh, sq ft). Money goes through formatInr.
 *
 * `en-IN` in both locales, deliberately: it groups in lakh and crore, which is how a reader in
 * Karnataka reads a figure, while `kn-IN` groups in thousands (architecture.md §6.7).
 */
export const enIn = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });

/** The three radio cards of step 1, in the locale's own words. */
export function segmentOptions(
  labels: Readonly<Record<Segment, string>>,
  descriptions: Readonly<Record<Segment, string>>,
): RadioCardOption[] {
  return SEGMENTS.map((value) => ({ value, label: labels[value], description: descriptions[value] }));
}

const isSegment = (value: string): value is Segment => (SEGMENTS as readonly string[]).includes(value);

/**
 * Reads ?segment= from the URL. Only this parameter is read: legacy redirects forward the old
 * query string, which could carry a name or a phone number, and none of it is ever used.
 */
export function parseSegment(value: string | string[] | undefined): Segment {
  const first = Array.isArray(value) ? value[0] : value;
  return typeof first === "string" && isSegment(first) ? first : "home";
}

/**
 * Lengths the server schema enforces. Imported from src/lib/leads/limits.ts, which is
 * dependency-free, so the client gets the same numbers without pulling zod into the bundle.
 */
export const fieldLimits = { name: NAME_MAX, email: EMAIL_MAX, message: MESSAGE_MAX } as const;

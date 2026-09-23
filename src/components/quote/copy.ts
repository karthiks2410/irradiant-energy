/**
 * Copy and small helpers shared by the /get-quote islands.
 *
 * Everything here is positioning / UX copy or a restatement of what the estimate engine
 * already says about itself (src/lib/solar/constants.ts carries the source and status of
 * every figure). No business claim — warranties, timings, scheme eligibility — is made here.
 */

import type { RadioCardOption } from "@/components/ui";
import { EMAIL_MAX, MESSAGE_MAX, NAME_MAX } from "@/lib/leads/limits";
import { SEGMENT_LABELS, SEGMENTS, type Segment } from "@/lib/solar/constants";

/** en-IN integer grouping for unit figures (kWh, sq ft). Money goes through formatInr. */
export const enIn = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });

const segmentDescriptions: Record<Segment, string> = {
  home: "A house or villa",
  "housing-society": "Apartments and gated communities",
  commercial: "Shops, offices, factories and warehouses",
};

export const segmentOptions: RadioCardOption[] = SEGMENTS.map((value) => ({
  value,
  label: SEGMENT_LABELS[value],
  description: segmentDescriptions[value],
}));

const isSegment = (value: string): value is Segment => (SEGMENTS as readonly string[]).includes(value);

/**
 * Reads ?segment= from the URL. Only this parameter is read: legacy redirects forward the old
 * query string, which could carry a name or a phone number, and none of it is ever used.
 */
export function parseSegment(value: string | string[] | undefined): Segment {
  const first = Array.isArray(value) ? value[0] : value;
  return typeof first === "string" && isSegment(first) ? first : "home";
}

/** Re-exported from the engine so the /get-quote islands keep one import. */
export { flagNotes } from "@/lib/solar/flag-notes";

/**
 * PROPOSED CONTENT — REQUIRES CLIENT APPROVAL.
 * Sits directly under the figures. It must stay visible: the page shows modelled numbers,
 * and report §11 forbids presenting them as an offer.
 */
export const estimateDisclaimer =
  "This is an estimate based on the assumptions above, not a quote or a guarantee.";

/**
 * Lengths the server schema enforces. Imported from src/lib/leads/limits.ts, which is
 * dependency-free, so the client gets the same numbers without pulling zod into the bundle.
 */
export const fieldLimits = { name: NAME_MAX, email: EMAIL_MAX, message: MESSAGE_MAX } as const;

/**
 * Copy and small helpers shared by the /get-quote islands.
 *
 * Everything here is positioning / UX copy or a restatement of what the estimate engine
 * already says about itself (src/lib/solar/constants.ts carries the source and status of
 * every figure). No business claim — warranties, timings, scheme eligibility — is made here.
 */

import type { RadioCardOption } from "@/components/ui";
import { EMAIL_MAX, MESSAGE_MAX, NAME_MAX } from "@/lib/leads/limits";
import type { EstimateFlag } from "@/lib/solar/calc";
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

/**
 * Visitor-facing wording for each engine flag. These explain what the calculator did, not what
 * Irradiant promises; the numbers they qualify are listed with their sources under "Assumptions".
 */
export const flagNotes: Record<EstimateFlag, string> = {
  "bill-defaulted": "Set your monthly bill to see figures for your own usage.",
  "bill-clamped": "Your bill is outside this calculator's range, so the nearest value was used.",
  "kwh-clamped": "Your usage is outside this calculator's range, so the nearest value was used.",
  "tariff-assumed-karnataka": "This estimate uses Karnataka (BESCOM) tariffs.",
  "tariff-assumed-bescom":
    "This PIN code may be served by another supplier; the estimate uses BESCOM tariffs.",
  "tariff-assumed-flat":
    "Society and business tariffs depend on a connection category a bill amount can't identify, so a flat average tariff is used.",
  "size-minimum-applied": "This calculator does not size systems below 1 kWp.",
  "size-capped-segment": "Capped at this calculator's largest size for this property type.",
  "size-capped-roof": "Capped by the roof area you entered.",
  "subsidy-not-applicable": "The PM Surya Ghar subsidy does not apply to commercial connections.",
  "subsidy-house-count-unknown": "Shown as an upper limit: the society subsidy also depends on the number of homes.",
};

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

/**
 * Monthly-bill ranges for the quick quote, and what the estimate engine can honestly say about
 * each one.
 *
 * The quick quote asks for the bill as a range, not a number, because a tap is quicker than
 * typing and most people only know their bill roughly. The boundaries are the ones the market
 * leader's quote form uses, so a visitor who has seen theirs meets the same choices here.
 *
 * WHY THE FIGURES ARE RANGES, NOT A MIDPOINT
 * The engine takes one number. The obvious move is to feed it the middle of the range, but under
 * this engine the monthly saving is about 90% of the bill (OFFSET_CAP), so a midpoint figure is
 * larger than the whole bill of anyone in the lower part of the range: ₹2,925 a month "for a bill
 * of ₹2,500–4,000" is 117% of a ₹2,500 bill. That is exactly the precision a range cannot carry,
 * and a saving above the bill is the "save 100%" claim the brand forbids. So each end of the
 * range goes through the engine and every figure is shown as the span between them:
 * "2.5–3.5 kWp", "₹2,250–3,600 a month". Every figure is monotonic in the bill except payback,
 * which is shown as the lower and higher of the two ends.
 *
 * THE OPEN TOP RANGE ("over ₹8,000")
 * There is no upper end, so there is no midpoint and no span. The figures are worked out at the
 * floor, ₹8,000, and shown as starting figures ("6.5 kWp or more") — the one statement that is
 * true for every bill in the range. A figure that cannot grow any further is shown plainly
 * instead: a home's subsidy is already at the ₹78,000 cap at ₹8,000, so it is never "or more".
 * Whether a figure can still grow is read from the engine at the segment's largest bill.
 *
 * WHERE THE RANGE AND THE CALCULATOR DISAGREE
 * The engine clamps the bill to per-segment bounds (BILL_BOUNDS): a housing society starts at
 * ₹5,000 and a business at ₹10,000. A range wholly below that start gets no figures at all
 * rather than figures for a bill the visitor did not pick. A range partly below it is worked out
 * from the calculator's start, and the fine print says so.
 *
 * Pure and dependency-light, so the popup (client), the lead action (server) and the tests all
 * compute the same figures.
 */

import { buildEstimate, type Estimate, type EstimateFlag } from "./calc";
import { BILL_BOUNDS, type Segment } from "./constants";
import { formatInr } from "./format";

export const BILL_RANGE_IDS = ["under-1500", "1500-2500", "2500-4000", "4000-8000", "over-8000"] as const;
export type BillRangeId = (typeof BILL_RANGE_IDS)[number];

export interface BillRange {
  id: BillRangeId;
  /** Chip label, sentence case. */
  label: string;
  /** Inclusive lower end in INR a month; 0 for the bottom range. */
  minInr: number;
  /** Upper end in INR a month; null for the open top range. */
  maxInr: number | null;
}

export const BILL_RANGES: readonly BillRange[] = [
  { id: "under-1500", label: "Under ₹1,500", minInr: 0, maxInr: 1_500 },
  { id: "1500-2500", label: "₹1,500–2,500", minInr: 1_500, maxInr: 2_500 },
  { id: "2500-4000", label: "₹2,500–4,000", minInr: 2_500, maxInr: 4_000 },
  { id: "4000-8000", label: "₹4,000–8,000", minInr: 4_000, maxInr: 8_000 },
  { id: "over-8000", label: "Over ₹8,000", minInr: 8_000, maxInr: null },
];

export const isBillRangeId = (value: unknown): value is BillRangeId =>
  typeof value === "string" && (BILL_RANGE_IDS as readonly string[]).includes(value);

export function getBillRange(id: BillRangeId): BillRange {
  const range = BILL_RANGES.find((r) => r.id === id);
  if (!range) throw new Error(`Unknown bill range: ${id}`);
  return range;
}

/** Reads a bill range from a query value; anything else is ignored. */
export function parseBillRange(value: string | string[] | undefined): BillRangeId | undefined {
  const first = Array.isArray(value) ? value[0] : value;
  return isBillRangeId(first) ? first : undefined;
}

/** "under ₹1,500", "of ₹2,500–4,000", "over ₹8,000" — to follow "a monthly bill". */
export function billRangePhrase(range: BillRange): string {
  if (range.maxInr === null) return `over ${formatInr(range.minInr)}`;
  if (range.minInr === 0) return `under ${formatInr(range.maxInr)}`;
  return `of ${range.label}`;
}

/** Plural nouns for the fine print: "our calculator starts at ₹5,000 for housing societies". */
export const SEGMENT_PLURALS: Record<Segment, string> = {
  home: "homes",
  "housing-society": "housing societies",
  commercial: "businesses",
};

/**
 * A figure across the range. `to === from` is a single value; `to === null` means "from, or
 * more" (the open top range, where the figure can still grow).
 */
export interface Span {
  from: number;
  to: number | null;
}

export interface BillRangeFigures {
  systemKwp: Span;
  monthlySavingsInr: Span;
  subsidyInr: Span;
  grossCostInr: Span;
  netCostInr: Span;
  /** Lower and higher of the two ends; null when either end has no savings. */
  paybackYears: { from: number; to: number } | null;
}

export type BillRangeEstimate =
  | {
      kind: "ok";
      segment: Segment;
      range: BillRange;
      /** The bill the low end was worked out at (the range floor, or the calculator's start). */
      fromInr: number;
      /** The bill the high end was worked out at; null for the open top range. */
      toInr: number | null;
      /** True when the calculator's start cut off the bottom of the range. */
      startsAboveRange: boolean;
      figures: BillRangeFigures;
      /** Engine flags worth showing beside the figures (bill clamping is handled here instead). */
      flags: EstimateFlag[];
      engineVersion: string;
      /** The engine's own result at each end, for the sales alert and the tests. */
      low: Estimate;
      high: Estimate;
    }
  | {
      kind: "out-of-range";
      segment: Segment;
      range: BillRange;
      /** Where the calculator starts for this segment. */
      calculatorMinInr: number;
    };

/** Clamping is what this module handles itself, and says so in the fine print. */
const HIDDEN_FLAGS: ReadonlySet<EstimateFlag> = new Set(["bill-clamped", "bill-defaulted"]);

function span(low: number, high: number, open: boolean): Span {
  if (high <= low) return { from: low, to: low };
  return { from: low, to: open ? null : high };
}

/**
 * The estimate for a segment and a bill range. Never throws. The PIN code only narrows the
 * tariff caveat (see EstimateProvider): it does not change a figure.
 */
export function estimateForBillRange({
  segment,
  billRange,
  pincode,
}: {
  segment: Segment;
  billRange: BillRangeId;
  pincode?: string;
}): BillRangeEstimate {
  const range = getBillRange(billRange);
  const bounds = BILL_BOUNDS[segment];

  const belowCalculator = range.maxInr !== null && range.maxInr <= bounds.min;
  const aboveCalculator = range.minInr >= bounds.max;
  if (belowCalculator || aboveCalculator) {
    return { kind: "out-of-range", segment, range, calculatorMinInr: bounds.min };
  }

  const open = range.maxInr === null;
  const fromInr = Math.max(range.minInr, bounds.min);
  const toInr = open ? null : Math.min(range.maxInr as number, bounds.max);

  const at = (bill: number) => buildEstimate({ segment, pincode, monthlyBillInr: bill });
  const low = at(fromInr);
  // For the open range this is the segment's largest bill: it only answers whether a figure can
  // still grow, and is never shown.
  const high = at(toInr ?? bounds.max);

  const paybackYears =
    low.paybackYears === null || high.paybackYears === null
      ? null
      : {
          from: Math.min(low.paybackYears, high.paybackYears),
          to: Math.max(low.paybackYears, high.paybackYears),
        };

  const flags = [...new Set([...low.flags, ...(open ? [] : high.flags)])].filter((f) => !HIDDEN_FLAGS.has(f));

  return {
    kind: "ok",
    segment,
    range,
    fromInr,
    toInr,
    startsAboveRange: fromInr > range.minInr,
    figures: {
      systemKwp: span(low.systemKwp, high.systemKwp, open),
      monthlySavingsInr: span(low.monthlySavingsInr, high.monthlySavingsInr, open),
      subsidyInr: span(low.subsidyInr, high.subsidyInr, open),
      grossCostInr: span(low.grossCostInr, high.grossCostInr, open),
      netCostInr: span(low.netCostInr, high.netCostInr, open),
      paybackYears,
    },
    flags,
    engineVersion: low.engineVersion,
    low,
    high,
  };
}

const kwp = (n: number) => (Number.isInteger(n) ? String(n) : n.toFixed(1));

/** "2.5–3.5 kWp", "3 kWp", "6.5 kWp or more". */
export function formatKwpSpan(s: Span): string {
  if (s.to === null) return `${kwp(s.from)} kWp or more`;
  if (s.to === s.from) return `${kwp(s.from)} kWp`;
  return `${kwp(s.from)}–${kwp(s.to)} kWp`;
}

/** "₹2,250–3,600", "₹78,000", "₹7,200 or more". */
export function formatInrSpan(s: Span): string {
  if (s.to === null) return `${formatInr(s.from)} or more`;
  if (s.to === s.from) return formatInr(s.from);
  return `${formatInr(s.from)}–${formatInr(s.to, { bare: true })}`;
}

/** "about 3 years", "3–3.1 years". */
export function formatPaybackSpan(p: { from: number; to: number } | null): string {
  if (p === null) return "—";
  const f = (n: number) => (Number.isInteger(n) ? String(n) : n.toFixed(1));
  return p.to === p.from ? `about ${f(p.from)} years` : `${f(p.from)}–${f(p.to)} years`;
}

/**
 * PROPOSED CONTENT — REQUIRES CLIENT APPROVAL. What the figures were worked out for, printed
 * under them. It restates the method; it makes no claim about the business.
 */
export function workedOutFor(estimate: Extract<BillRangeEstimate, { kind: "ok" }>): string {
  const start =
    estimate.startsAboveRange && estimate.range.minInr > 0
      ? ` Our calculator starts at ${formatInr(estimate.fromInr)} a month for ${SEGMENT_PLURALS[estimate.segment]}.`
      : "";
  if (estimate.toInr === null) {
    return `Worked out from a bill of ${formatInr(estimate.fromInr)} upwards, so these are starting figures: a bigger bill means a bigger system.${start}`;
  }
  return `Worked out for bills from ${formatInr(estimate.fromInr)} to ${formatInr(estimate.toInr)}, so each figure is a range.${start}`;
}

/**
 * Where /get-quote's bill slider starts when the popup links to it: the middle of the part of
 * the range the calculator covers (the floor for the open range), on the slider's own step.
 * A starting position for a control the visitor then sets, never shown as their bill.
 */
export function seedBillFor(segment: Segment, billRange: BillRangeId): number {
  const range = getBillRange(billRange);
  const { min, max, step } = BILL_BOUNDS[segment];
  const lo = Math.max(range.minInr, min);
  const hi = range.maxInr === null ? lo : Math.min(range.maxInr, max);
  const middle = (lo + Math.max(lo, hi)) / 2;
  const snapped = Math.round(middle / step) * step;
  return Math.min(max, Math.max(min, snapped));
}

/**
 * The quick-quote popup's bill buckets and the estimate range they produce.
 *
 * The popup asks for a bill range rather than a number, because tapping a range on a phone is
 * faster than typing one (owner decision, 2026-09-25, after solarsquare.in). A range cannot honestly
 * produce one figure, so every figure here is a range too: the engine is run at both ends of the
 * bucket and the visitor sees both results. A midpoint is kept only for the sales alert and the
 * emailed breakdown, which need one number and say which one they used.
 *
 * Each property type gets its own buckets: a housing society's common-area bill or a business's
 * bill is ten to a hundred times a home's, so one set of ranges would be meaningless for two of
 * the three audiences. The ranges sit inside the engine's own limits (BILL_BOUNDS).
 */

import { buildEstimate, type Estimate } from "@/lib/solar/calc";
import { BILL_BOUNDS, type Segment } from "@/lib/solar/constants";
import { formatInr } from "@/lib/solar/format";

export interface BillBucket {
  id: string;
  /** Lower edge in INR. For the first bucket this is the engine's minimum for the segment. */
  min: number;
  /** Upper edge in INR, or null for the open-ended top bucket. */
  max: number | null;
}

/**
 * Home buckets follow the ranges the market already uses. Society and business ranges are
 * PROPOSED CONTENT — REQUIRES CLIENT APPROVAL: chosen to split each segment's realistic bills
 * into five similar-sized steps, not taken from any source.
 */
export const BILL_BUCKETS: Record<Segment, readonly BillBucket[]> = {
  home: [
    { id: "home-1", min: BILL_BOUNDS.home.min, max: 1_500 },
    { id: "home-2", min: 1_500, max: 2_500 },
    { id: "home-3", min: 2_500, max: 4_000 },
    { id: "home-4", min: 4_000, max: 8_000 },
    { id: "home-5", min: 8_000, max: null },
  ],
  "housing-society": [
    { id: "society-1", min: BILL_BOUNDS["housing-society"].min, max: 15_000 },
    { id: "society-2", min: 15_000, max: 30_000 },
    { id: "society-3", min: 30_000, max: 60_000 },
    { id: "society-4", min: 60_000, max: 1_50_000 },
    { id: "society-5", min: 1_50_000, max: null },
  ],
  commercial: [
    { id: "business-1", min: BILL_BOUNDS.commercial.min, max: 50_000 },
    { id: "business-2", min: 50_000, max: 1_50_000 },
    { id: "business-3", min: 1_50_000, max: 4_00_000 },
    { id: "business-4", min: 4_00_000, max: 10_00_000 },
    { id: "business-5", min: 10_00_000, max: null },
  ],
};

export const ALL_BUCKET_IDS: readonly string[] = Object.values(BILL_BUCKETS).flatMap((list) => list.map((b) => b.id));

export function findBucket(segment: Segment, id: string): BillBucket | undefined {
  return BILL_BUCKETS[segment].find((bucket) => bucket.id === id);
}

/** "Under ₹1,500", "₹1,500–2,500", "Over ₹8,000" — how the chip and every result label read. */
export function bucketLabel(bucket: BillBucket, first: boolean): string {
  if (bucket.max === null) return `Over ${formatInr(bucket.min)}`;
  if (first) return `Under ${formatInr(bucket.max)}`;
  return `${formatInr(bucket.min)}–${formatInr(bucket.max, { bare: true })}`;
}

export function labelFor(segment: Segment, id: string): string | undefined {
  const list = BILL_BUCKETS[segment];
  const index = list.findIndex((bucket) => bucket.id === id);
  return index === -1 ? undefined : bucketLabel(list[index], index === 0);
}

/**
 * The one bill the sales alert and the emailed breakdown are computed at: the middle of a closed
 * bucket, or the lower edge of the open top bucket, which makes those figures a floor.
 */
export function representativeBill(bucket: BillBucket): number {
  return bucket.max === null ? bucket.min : Math.round((bucket.min + bucket.max) / 2);
}

export interface QuickEstimate {
  /** The engine at the bucket's lower edge. */
  low: Estimate;
  /** The engine at the upper edge; null for the open top bucket, whose figures are "from". */
  high: Estimate | null;
  /**
   * Open top bucket only: the engine at the segment's largest bill. Used for the subsidy, which is
   * capped by the scheme — without it the top home bucket would read "From ₹78,000" when ₹78,000
   * is the most anyone gets.
   */
  ceiling: Estimate | null;
  /** The engine at representativeBill(), for the sales alert and the emailed breakdown. */
  representative: Estimate;
  representativeBillInr: number;
}

export function quickEstimate(segment: Segment, bucket: BillBucket, pincode?: string): QuickEstimate {
  const run = (monthlyBillInr: number) => buildEstimate({ segment, pincode, monthlyBillInr });
  const representativeBillInr = representativeBill(bucket);
  const open = bucket.max === null;
  return {
    low: run(bucket.min),
    high: open ? null : run(bucket.max!),
    ceiling: open ? run(BILL_BOUNDS[segment].max) : null,
    representative: run(representativeBillInr),
    representativeBillInr,
  };
}

interface RangeFormat {
  /** Formats one bare number: "2,250", "2.5". */
  number: (value: number) => string;
  /** Written once, before the range: "₹". */
  prefix?: string;
  /** Written once, after the range: " kWp". */
  unit?: string;
}

/**
 * A range for display: "2.5–3.5 kWp", "₹2,250–3,600". Equal ends collapse to one value (the
 * subsidy is capped, so a whole bucket often shares it); an open bucket reads "From …".
 */
export function formatRange(low: number, high: number | null, { number, prefix = "", unit = "" }: RangeFormat): string {
  const one = (value: number) => `${prefix}${number(value)}${unit}`;
  if (high === null) return `From ${one(low)}`;
  if (number(low) === number(high)) return one(low);
  return `${prefix}${number(low)}–${number(high)}${unit}`;
}

const KWP: RangeFormat = { number: (v) => String(v), unit: " kWp" };
const INR: RangeFormat = { number: (v) => formatInr(v, { bare: true }), prefix: "₹" };

/** The three headline figures the popup shows, already formatted, so the client needs no engine. */
export interface QuickEstimateSummary {
  billRangeLabel: string;
  systemSize: string;
  monthlySavings: string;
  subsidy: string;
}

export function summarise(segment: Segment, bucketId: string, estimate: QuickEstimate): QuickEstimateSummary {
  const { low, high } = estimate;
  return {
    billRangeLabel: labelFor(segment, bucketId) ?? "",
    systemSize: formatRange(low.systemKwp, high?.systemKwp ?? null, KWP),
    monthlySavings: formatRange(low.monthlySavingsInr, high?.monthlySavingsInr ?? null, INR),
    subsidy: subsidyText(estimate),
  };
}

/**
 * The engine's own flags decide the wording, so the popup cannot claim more than the calculator:
 * businesses get no PM Surya Ghar subsidy (not "₹0", which reads like an error), and a society's
 * figure is a ceiling until the number of homes is known, so it is shown as one "Up to" figure.
 * For the open top bucket the upper end is the segment ceiling, because the subsidy is capped.
 */
function subsidyText({ low, high, ceiling }: QuickEstimate): string {
  if (low.flags.includes("subsidy-not-applicable")) return "Not available for businesses";
  const top = (high ?? ceiling ?? low).subsidyInr;
  if (low.flags.includes("subsidy-house-count-unknown")) return `Up to ₹${INR.number(top)}`;
  return formatRange(low.subsidyInr, top, INR);
}

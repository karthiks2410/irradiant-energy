import { describe, expect, it } from "vitest";
import { BILL_BOUNDS, SEGMENTS } from "@/lib/solar/constants";
import { BILL_BUCKETS, bucketLabel, findBucket, formatRange, labelFor, quickEstimate, representativeBill, summarise } from "./quick";

describe("bill buckets", () => {
  it.each(SEGMENTS)("%s buckets are contiguous, ascending and inside the engine's limits", (segment) => {
    const list = BILL_BUCKETS[segment];
    expect(list).toHaveLength(5);
    expect(list[0].min).toBe(BILL_BOUNDS[segment].min);
    for (let i = 1; i < list.length; i++) expect(list[i].min).toBe(list[i - 1].max);
    expect(list.at(-1)?.max).toBeNull();
    for (const bucket of list) expect(bucket.max === null || bucket.max <= BILL_BOUNDS[segment].max).toBe(true);
  });

  it("labels read the way the market writes them", () => {
    expect(labelFor("home", "home-1")).toBe("Under ₹1,500");
    expect(labelFor("home", "home-3")).toBe("₹2,500–4,000");
    expect(labelFor("home", "home-5")).toBe("Over ₹8,000");
    expect(labelFor("commercial", "business-4")).toBe("₹4,00,000–10,00,000");
    expect(labelFor("home", "business-1")).toBeUndefined();
  });

  it("uses the middle of a closed bucket and the lower edge of the open one", () => {
    expect(representativeBill({ id: "x", min: 2_500, max: 4_000 })).toBe(3_250);
    expect(representativeBill({ id: "x", min: 8_000, max: null })).toBe(8_000);
  });
});

describe("quick estimate", () => {
  it("brackets the representative figure between the bucket's two ends", () => {
    const bucket = findBucket("home", "home-3")!;
    const { low, high, representative } = quickEstimate("home", bucket);
    expect(high).not.toBeNull();
    expect(low.systemKwp).toBeLessThanOrEqual(representative.systemKwp);
    expect(representative.systemKwp).toBeLessThanOrEqual(high!.systemKwp);
    expect(low.monthlySavingsInr).toBeLessThanOrEqual(high!.monthlySavingsInr);
  });

  it("shows ranges, never a single figure the visitor did not give", () => {
    const summary = summarise("home", "home-3", quickEstimate("home", findBucket("home", "home-3")!));
    expect(summary.billRangeLabel).toBe("₹2,500–4,000");
    expect(summary.systemSize).toMatch(/^[\d.]+–[\d.]+ kWp$/);
    expect(summary.monthlySavings).toMatch(/^₹[\d,]+–[\d,]+$/);
  });

  it("reads the open top bucket as a floor, except the capped subsidy", () => {
    const summary = summarise("home", "home-5", quickEstimate("home", findBucket("home", "home-5")!));
    expect(summary.systemSize.startsWith("From ")).toBe(true);
    expect(summary.monthlySavings.startsWith("From ")).toBe(true);
    // ₹78,000 is the scheme's ceiling, so "From ₹78,000" would promise more than exists.
    expect(summary.subsidy).toBe("₹78,000");
  });

  it("says businesses get no subsidy instead of showing ₹0", () => {
    const summary = summarise("commercial", "business-2", quickEstimate("commercial", findBucket("commercial", "business-2")!));
    expect(summary.subsidy).toBe("Not available for businesses");
  });

  it("marks a society's subsidy as a ceiling", () => {
    const summary = summarise("housing-society", "society-3", quickEstimate("housing-society", findBucket("housing-society", "society-3")!));
    expect(summary.subsidy).toMatch(/^Up to ₹[\d,]+$/);
  });

  it("collapses equal ends and writes the unit once", () => {
    const kwp = { number: String, unit: " kWp" };
    expect(formatRange(3, 3, kwp)).toBe("3 kWp");
    expect(formatRange(2.5, 3.5, kwp)).toBe("2.5–3.5 kWp");
    expect(formatRange(5, null, kwp)).toBe("From 5 kWp");
    expect(formatRange(2250, 3600, { number: (v) => v.toLocaleString("en-IN"), prefix: "₹" })).toBe("₹2,250–3,600");
  });

  it("labels the first bucket as 'Under'", () => {
    expect(bucketLabel({ id: "x", min: 500, max: 1_500 }, true)).toBe("Under ₹1,500");
  });
});

import { describe, expect, it } from "vitest";
import {
  BILL_RANGE_IDS,
  BILL_RANGES,
  billRangePhrase,
  estimateForBillRange,
  formatInrSpan,
  formatKwpSpan,
  formatPaybackSpan,
  getBillRange,
  parseBillRange,
  seedBillFor,
  workedOutFor,
  type BillRangeEstimate,
} from "./bill-ranges";
import { buildEstimate } from "./calc";
import { BILL_BOUNDS, OFFSET_CAP, SEGMENTS } from "./constants";

type Ok = Extract<BillRangeEstimate, { kind: "ok" }>;

function ok(result: BillRangeEstimate): Ok {
  if (result.kind !== "ok") throw new Error(`expected figures, got ${result.kind}`);
  return result;
}

describe("the bill ranges", () => {
  it("are the market's five boundaries, in order, with no gaps", () => {
    expect(BILL_RANGES.map((r) => r.label)).toEqual([
      "Under ₹1,500",
      "₹1,500–2,500",
      "₹2,500–4,000",
      "₹4,000–8,000",
      "Over ₹8,000",
    ]);
    for (let i = 1; i < BILL_RANGES.length; i++) {
      expect(BILL_RANGES[i].minInr).toBe(BILL_RANGES[i - 1].maxInr);
    }
    expect(BILL_RANGES[0].minInr).toBe(0);
    expect(BILL_RANGES.at(-1)?.maxInr).toBeNull();
  });

  it("read only known ids from a query string", () => {
    expect(parseBillRange("2500-4000")).toBe("2500-4000");
    expect(parseBillRange(["over-8000", "under-1500"])).toBe("over-8000");
    for (const junk of [undefined, "", "3250", "2500-4001", "<script>"]) expect(parseBillRange(junk)).toBeUndefined();
  });

  it("phrase the range, never a single number", () => {
    expect(billRangePhrase(getBillRange("under-1500"))).toBe("under ₹1,500");
    expect(billRangePhrase(getBillRange("2500-4000"))).toBe("of ₹2,500–4,000");
    expect(billRangePhrase(getBillRange("over-8000"))).toBe("over ₹8,000");
  });
});

describe("a home estimate from a bill range", () => {
  it("works each end of the range through the engine", () => {
    const e = ok(estimateForBillRange({ segment: "home", billRange: "2500-4000", pincode: "560001" }));
    expect(e.fromInr).toBe(2_500);
    expect(e.toInr).toBe(4_000);
    expect(e.low).toEqual(buildEstimate({ segment: "home", pincode: "560001", monthlyBillInr: 2_500 }));
    expect(e.high).toEqual(buildEstimate({ segment: "home", pincode: "560001", monthlyBillInr: 4_000 }));
    expect(e.figures.systemKwp).toEqual({ from: e.low.systemKwp, to: e.high.systemKwp });
    expect(e.figures.monthlySavingsInr).toEqual({ from: e.low.monthlySavingsInr, to: e.high.monthlySavingsInr });
    expect(e.figures.subsidyInr).toEqual({ from: e.low.subsidyInr, to: e.high.subsidyInr });
  });

  it("prints the figures the visitor sees for each range", () => {
    const shown = (billRange: (typeof BILL_RANGE_IDS)[number]) => {
      const e = ok(estimateForBillRange({ segment: "home", billRange, pincode: "560001" }));
      return [formatKwpSpan(e.figures.systemKwp), formatInrSpan(e.figures.monthlySavingsInr), formatInrSpan(e.figures.subsidyInr)];
    };
    // Engine 2026.09.1, no sanctioned load. If the engine changes, these move with it.
    expect(shown("under-1500")).toEqual(["1–2 kWp", "₹450–1,350", "₹30,000–60,000"]);
    expect(shown("1500-2500")).toEqual(["2–2.5 kWp", "₹1,350–2,250", "₹60,000–69,000"]);
    expect(shown("2500-4000")).toEqual(["2.5–3.5 kWp", "₹2,250–3,600", "₹69,000–78,000"]);
    expect(shown("4000-8000")).toEqual(["3.5–6.5 kWp", "₹3,600–7,200", "₹78,000"]);
    expect(shown("over-8000")).toEqual(["6.5 kWp or more", "₹7,200 or more", "₹78,000"]);
  });

  it("never shows a saving larger than the smallest bill in the range", () => {
    // The reason for ranges: a midpoint figure (₹2,925 for ₹2,500–4,000) is 117% of a ₹2,500 bill.
    for (const segment of SEGMENTS) {
      for (const billRange of BILL_RANGE_IDS) {
        const e = estimateForBillRange({ segment, billRange });
        if (e.kind !== "ok") continue;
        expect(e.figures.monthlySavingsInr.from, `${segment} ${billRange}`).toBeLessThanOrEqual(e.fromInr * OFFSET_CAP.value);
      }
    }
  });

  it("uses the engine's floor for the bottom range and says so", () => {
    const e = ok(estimateForBillRange({ segment: "home", billRange: "under-1500" }));
    expect(e.fromInr).toBe(BILL_BOUNDS.home.min);
    expect(workedOutFor(e)).toBe("Worked out for bills from ₹500 to ₹1,500, so each figure is a range.");
  });

  it("treats the open top range as starting figures, and a capped subsidy as exact", () => {
    const e = ok(estimateForBillRange({ segment: "home", billRange: "over-8000" }));
    expect(e.fromInr).toBe(8_000);
    expect(e.toInr).toBeNull();
    expect(e.figures.systemKwp.to).toBeNull();
    expect(e.figures.monthlySavingsInr.to).toBeNull();
    // ₹78,000 is the scheme cap, reached at 3 kW: "or more" would be false.
    expect(e.figures.subsidyInr).toEqual({ from: 78_000, to: 78_000 });
    expect(workedOutFor(e)).toMatch(/^Worked out from a bill of ₹8,000 upwards, so these are starting figures/);
  });

  it("keeps payback as the lower and higher of the two ends", () => {
    const e = ok(estimateForBillRange({ segment: "home", billRange: "2500-4000" }));
    const ends = [e.low.paybackYears!, e.high.paybackYears!];
    expect(e.figures.paybackYears).toEqual({ from: Math.min(...ends), to: Math.max(...ends) });
  });

  it("does not let the PIN code change a figure, only the caveat", () => {
    const bengaluru = ok(estimateForBillRange({ segment: "home", billRange: "4000-8000", pincode: "560001" }));
    const mysuru = ok(estimateForBillRange({ segment: "home", billRange: "4000-8000", pincode: "570001" }));
    expect(mysuru.figures).toEqual(bengaluru.figures);
    expect(bengaluru.flags).not.toContain("tariff-assumed-bescom");
    expect(mysuru.flags).toContain("tariff-assumed-bescom");
  });

  it("never passes the engine's own bill clamping through as a visitor note", () => {
    for (const segment of SEGMENTS) {
      for (const billRange of BILL_RANGE_IDS) {
        const e = estimateForBillRange({ segment, billRange });
        if (e.kind === "ok") expect(e.flags).not.toContain("bill-clamped");
      }
    }
  });
});

describe("housing societies and businesses", () => {
  it("gives no figures for a range wholly below where the calculator starts", () => {
    for (const billRange of ["under-1500", "1500-2500", "2500-4000"] as const) {
      expect(estimateForBillRange({ segment: "housing-society", billRange })).toMatchObject({
        kind: "out-of-range",
        calculatorMinInr: BILL_BOUNDS["housing-society"].min,
      });
    }
    for (const billRange of ["under-1500", "1500-2500", "2500-4000", "4000-8000"] as const) {
      expect(estimateForBillRange({ segment: "commercial", billRange })).toMatchObject({
        kind: "out-of-range",
        calculatorMinInr: BILL_BOUNDS.commercial.min,
      });
    }
  });

  it("works a range partly below the start from the start, and says where that is", () => {
    const society = ok(estimateForBillRange({ segment: "housing-society", billRange: "4000-8000" }));
    expect(society.fromInr).toBe(5_000);
    expect(society.startsAboveRange).toBe(true);
    expect(workedOutFor(society)).toContain("Our calculator starts at ₹5,000 a month for housing societies.");

    const business = ok(estimateForBillRange({ segment: "commercial", billRange: "over-8000" }));
    expect(business.fromInr).toBe(10_000);
    expect(workedOutFor(business)).toContain("Our calculator starts at ₹10,000 a month for businesses.");
  });

  it("shows no subsidy for a business and keeps the society caveats", () => {
    const business = ok(estimateForBillRange({ segment: "commercial", billRange: "over-8000" }));
    expect(business.figures.subsidyInr).toEqual({ from: 0, to: 0 });
    expect(business.flags).toContain("subsidy-not-applicable");

    const society = ok(estimateForBillRange({ segment: "housing-society", billRange: "over-8000" }));
    expect(society.flags).toContain("subsidy-house-count-unknown");
    expect(society.figures.subsidyInr.to).toBeNull();
  });
});

describe("formatting a span", () => {
  it("prints a single value, a range or a starting figure", () => {
    expect(formatKwpSpan({ from: 3, to: 3 })).toBe("3 kWp");
    expect(formatKwpSpan({ from: 2.5, to: 3.5 })).toBe("2.5–3.5 kWp");
    expect(formatKwpSpan({ from: 6.5, to: null })).toBe("6.5 kWp or more");
    expect(formatInrSpan({ from: 125_000, to: 150_000 })).toBe("₹1,25,000–1,50,000");
    expect(formatInrSpan({ from: 78_000, to: 78_000 })).toBe("₹78,000");
    expect(formatInrSpan({ from: 7_200, to: null })).toBe("₹7,200 or more");
    expect(formatPaybackSpan({ from: 3, to: 3 })).toBe("about 3 years");
    expect(formatPaybackSpan({ from: 2.9, to: 3.1 })).toBe("2.9–3.1 years");
    expect(formatPaybackSpan(null)).toBe("—");
  });
});

describe("seeding the calculator from a range", () => {
  it("lands on the slider's own step, inside the segment's bounds", () => {
    for (const segment of SEGMENTS) {
      const { min, max, step } = BILL_BOUNDS[segment];
      for (const billRange of BILL_RANGE_IDS) {
        const seed = seedBillFor(segment, billRange);
        expect(seed % step, `${segment} ${billRange}`).toBe(0);
        expect(seed).toBeGreaterThanOrEqual(min);
        expect(seed).toBeLessThanOrEqual(max);
      }
    }
    expect(seedBillFor("home", "2500-4000")).toBe(3_500);
    expect(seedBillFor("home", "over-8000")).toBe(8_000);
    expect(seedBillFor("commercial", "under-1500")).toBe(10_000);
  });
});

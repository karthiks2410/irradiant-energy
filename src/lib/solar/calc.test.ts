import { describe, expect, it } from "vitest";
import { quotePage } from "@/content/quote";
import { placeholdersIn } from "@/i18n/format";
import { describeAssumption, type AssumptionCopy } from "./assumptions";
import {
  billFromKwh,
  buildEstimate,
  kwhFromBill,
  projectSavings,
  residentialSubsidy,
  resolveRegion,
  societySubsidy,
  subsidyFor,
  type EstimateInput,
} from "./calc";
import {
  BILL_BOUNDS,
  citationFor,
  ENGINE_CONSTANTS,
  KWH_BOUNDS,
  OFFSET_CAP,
  PM_SURYA_GHAR_RESIDENTIAL,
  PM_SURYA_GHAR_SOCIETY,
  SEGMENTS,
  SYSTEM_SIZE_LIMITS,
} from "./constants";

const home = (extra: Partial<EstimateInput> = {}): EstimateInput => ({ segment: "home", pincode: "560001", ...extra });

describe("PM Surya Ghar residential ladder", () => {
  it.each([
    [1, 30_000],
    [1.5, 45_000],
    [2, 60_000],
    [2.5, 69_000],
    [3, 78_000],
    [5, 78_000],
    [10, 78_000],
  ])("%s kW → ₹%s", (kw, expected) => {
    expect(residentialSubsidy(kw)).toBe(expected);
  });

  it("is zero for non-positive sizes", () => {
    expect(residentialSubsidy(0)).toBe(0);
    expect(residentialSubsidy(-1)).toBe(0);
  });

  it("never exceeds the official cap", () => {
    for (let kw = 0; kw <= 20; kw += 0.5) {
      expect(residentialSubsidy(kw)).toBeLessThanOrEqual(PM_SURYA_GHAR_RESIDENTIAL.value.capInr);
    }
  });
});

describe("PM Surya Ghar housing-society rule", () => {
  it("pays ₹18,000 per kW, not the household ladder", () => {
    expect(societySubsidy(3)).toBe(54_000);
    expect(societySubsidy(36)).toBe(6_48_000);
    expect(subsidyFor("housing-society", 3)).not.toBe(subsidyFor("home", 3));
  });

  it("caps at 500 kW", () => {
    expect(societySubsidy(600)).toBe(500 * PM_SURYA_GHAR_SOCIETY.value.inrPerKw);
  });

  it("caps at 3 kW per house when the house count is known", () => {
    expect(societySubsidy(36, 12)).toBe(6_48_000);
    expect(societySubsidy(36, 10)).toBe(30 * 18_000);
    expect(societySubsidy(36, 0)).toBe(6_48_000); // zero is treated as unknown
  });

  it("gives commercial connections nothing", () => {
    expect(subsidyFor("commercial", 3)).toBe(0);
    expect(subsidyFor("commercial", 100)).toBe(0);
  });
});

describe("tariff region", () => {
  it("treats 56xxxx as BESCOM", () => {
    expect(resolveRegion("560001")).toEqual({ pincode: "560001", state: "karnataka", tariffAssumed: false });
    expect(buildEstimate(home()).flags).not.toContain("tariff-assumed-karnataka");
    expect(buildEstimate(home()).flags).not.toContain("tariff-assumed-bescom");
  });

  it("flags other Karnataka PIN codes as assumed BESCOM", () => {
    expect(resolveRegion("570001").state).toBe("karnataka");
    expect(buildEstimate(home({ pincode: "570001" })).flags).toContain("tariff-assumed-bescom");
  });

  it("flags non-Karnataka and missing PIN codes instead of silently mapping them", () => {
    expect(resolveRegion("110001")).toEqual({ pincode: "110001", state: "other", tariffAssumed: true });
    expect(buildEstimate(home({ pincode: "110001" })).flags).toContain("tariff-assumed-karnataka");
    expect(buildEstimate({ segment: "home" }).flags).toContain("tariff-assumed-karnataka");
    expect(resolveRegion("12345").state).toBe("unknown");
  });
});

describe("slab arithmetic", () => {
  it("inverts the bill to consumption and back", () => {
    for (const bill of [207.5, 500, 1_202.5, 3_500, 12_000, 50_000]) {
      expect(billFromKwh(kwhFromBill(bill))).toBeCloseTo(bill, 6);
    }
    expect(kwhFromBill(3_500)).toBeCloseTo(469.21, 1);
    expect(kwhFromBill(0)).toBe(0);
    expect(billFromKwh(0)).toBe(0);
  });
});

describe("savings model", () => {
  it("never equals the bill: fixed charges and taxes stay payable", () => {
    for (const segment of SEGMENTS) {
      const { min, max, default: def } = BILL_BOUNDS[segment];
      for (const bill of [min, def, (min + max) / 2, max]) {
        const e = buildEstimate({ segment, pincode: "560001", monthlyBillInr: bill });
        expect(e.monthlySavingsInr).toBeLessThan(e.monthlyBillInr);
        expect(e.savingsShareOfBill).toBeLessThanOrEqual(OFFSET_CAP.value + 1e-9);
        expect(e.savingsShareOfBill).toBeGreaterThan(0);
      }
    }
  });

  it("values savings at the average tariff of the offset units", () => {
    const e = buildEstimate(home({ monthlyBillInr: 3_500 }));
    expect(e.systemKwp).toBe(3.5);
    expect(e.monthlySavingsInr).toBe(3_150);
    expect(e.subsidyInr).toBe(78_000);
    expect(e.grossCostInr).toBe(2_10_000);
    expect(e.netCostInr).toBe(1_32_000);
    expect(e.paybackYears).toBe(3.5);
    expect(e.co2AvoidedKgPerYear).toBe(Math.round(3.5 * 4.5 * 365 * 0.727));
  });

  it("uses the entered tariff when given", () => {
    const e = buildEstimate({ segment: "commercial", pincode: "560001", monthlyBillInr: 1_00_000, averageTariffInrPerKwh: 10 });
    expect(e.tariff.basis).toBe("entered");
    expect(e.monthlyKwh).toBe(10_000);
    expect(e.flags).not.toContain("tariff-assumed-flat");
    expect(e.flags).toContain("subsidy-not-applicable");
  });

  it("prices societies and businesses on the flat default tariff, not domestic slabs", () => {
    const society = buildEstimate({ segment: "housing-society", pincode: "560001", monthlyBillInr: 45_000 });
    expect(society.tariff.basis).toBe("flat-default");
    expect(society.flags).toContain("tariff-assumed-flat");
    expect(society.flags).toContain("subsidy-house-count-unknown");
    expect(society.subsidyInr).toBe(society.systemKwp * 18_000);

    const withHouses = buildEstimate({ segment: "housing-society", pincode: "560001", monthlyBillInr: 45_000, houses: 4 });
    expect(withHouses.flags).not.toContain("subsidy-house-count-unknown");
    expect(withHouses.subsidyInr).toBe(12 * 18_000);
  });

  it("works from a consumption figure as well as a bill", () => {
    const e = buildEstimate(home({ monthlyKwh: 350 }));
    expect(e.monthlyKwh).toBe(350);
    expect(e.monthlyBillInr).toBe(Math.round(billFromKwh(350)));
    expect(e.systemKwp).toBe(2.5);
  });
});

describe("input bounds", () => {
  it("has a higher ceiling for societies and businesses than for homes", () => {
    expect(BILL_BOUNDS.home.max).toBe(50_000);
    expect(BILL_BOUNDS["housing-society"].max).toBeGreaterThan(BILL_BOUNDS.home.max);
    expect(BILL_BOUNDS.commercial.max).toBeGreaterThan(BILL_BOUNDS["housing-society"].max);
    for (const segment of SEGMENTS) {
      for (const b of [BILL_BOUNDS[segment], KWH_BOUNDS[segment]]) {
        expect(b.min).toBeLessThan(b.max);
        expect(b.default).toBeGreaterThanOrEqual(b.min);
        expect(b.default).toBeLessThanOrEqual(b.max);
        expect(b.step).toBeGreaterThan(0);
      }
    }
  });

  it("clamps out-of-range bills and flags it rather than failing", () => {
    const high = buildEstimate(home({ monthlyBillInr: 5_00_000 }));
    expect(high.monthlyBillInr).toBe(BILL_BOUNDS.home.max);
    expect(high.flags).toContain("bill-clamped");
    const low = buildEstimate(home({ monthlyBillInr: 1 }));
    expect(low.monthlyBillInr).toBe(BILL_BOUNDS.home.min);
    expect(low.flags).toContain("bill-clamped");
  });

  it("falls back to the default bill when nothing usable is given", () => {
    const e = buildEstimate(home({ monthlyBillInr: Number.NaN }));
    expect(e.monthlyBillInr).toBe(BILL_BOUNDS.home.default);
    expect(e.flags).toContain("bill-defaulted");
  });
});

describe("sizing limits", () => {
  it("applies a minimum of 1 kWp", () => {
    const tiny = buildEstimate(home({ monthlyKwh: 50 }));
    expect(tiny.systemKwp).toBe(SYSTEM_SIZE_LIMITS.value.minKwp);
    expect(tiny.flags).toContain("size-minimum-applied");
    // The smallest home bill lands exactly on 1 kWp, so no minimum is forced there.
    const smallest = buildEstimate(home({ monthlyBillInr: BILL_BOUNDS.home.min }));
    expect(smallest.systemKwp).toBe(SYSTEM_SIZE_LIMITS.value.minKwp);
    expect(smallest.flags).not.toContain("size-minimum-applied");
  });

  it("caps a home at the segment maximum", () => {
    const e = buildEstimate(home({ monthlyBillInr: 50_000 }));
    expect(e.systemKwp).toBe(SYSTEM_SIZE_LIMITS.value.maxKwp.home);
    expect(e.flags).toContain("size-capped-segment");
  });

  it("caps by roof area when that binds first", () => {
    const e = buildEstimate(home({ monthlyBillInr: 3_500, roofAreaSqft: 150 }));
    expect(e.systemKwp).toBe(2);
    expect(e.flags).toContain("size-capped-roof");
    expect(e.assumptions.some((a) => a.key === "roofArea")).toBe(true);
  });
});

describe("monotonicity and sanity", () => {
  it("size and savings never fall as the bill rises", () => {
    for (const segment of SEGMENTS) {
      const { min, max, step } = BILL_BOUNDS[segment];
      let prevKwp = 0;
      let prevSavings = 0;
      for (let bill = min; bill <= max; bill += step) {
        const e = buildEstimate({ segment, pincode: "560001", monthlyBillInr: bill });
        expect(e.systemKwp).toBeGreaterThanOrEqual(prevKwp);
        expect(e.annualSavingsInr).toBeGreaterThanOrEqual(prevSavings);
        prevKwp = e.systemKwp;
        prevSavings = e.annualSavingsInr;
      }
    }
  });

  it("produces finite numbers for every segment across the range", () => {
    for (const segment of SEGMENTS) {
      const { min, max } = BILL_BOUNDS[segment];
      for (const bill of [min, max, (min + max) / 3]) {
        const e = buildEstimate({ segment, monthlyBillInr: bill });
        for (const v of [e.systemKwp, e.annualGenerationKwh, e.grossCostInr, e.subsidyInr, e.netCostInr, e.annualSavingsInr, e.co2AvoidedKgPerYear, e.projection.cumulativeSavingsInr]) {
          expect(Number.isFinite(v)).toBe(true);
        }
        expect(e.paybackYears === null || Number.isFinite(e.paybackYears)).toBe(true);
        expect(e.systemKwp % SYSTEM_SIZE_LIMITS.value.stepKwp).toBe(0);
        expect(e.netCostInr).toBe(Math.max(0, e.grossCostInr - e.subsidyInr));
      }
    }
  });

  it("projects with inflation and degradation compounding from year two", () => {
    const points = projectSavings(10_000, 3);
    expect(points.map((p) => p.year)).toEqual([1, 2, 3]);
    expect(points[0].savingsInr).toBe(10_000);
    expect(points[1].savingsInr).toBe(Math.round(10_000 * 1.04 * 0.995));
    expect(points[2].cumulativeSavingsInr).toBe(points[0].savingsInr + points[1].savingsInr + points[2].savingsInr);
    const e = buildEstimate(home({ monthlyBillInr: 3_500 }));
    expect(e.projection.points).toHaveLength(e.projection.horizonYears);
    expect(e.projection.netBenefitInr).toBe(e.projection.cumulativeSavingsInr - e.netCostInr);
  });
});

describe("assumptions and constants", () => {
  /**
   * The engine returns keys and figures, not sentences (architecture.md §6.7), so these assert
   * the two halves separately: that the estimate names an assumption and the numbers that go in
   * it, and that the English copy still renders the figures a reader used to see.
   */
  it("lists every assumption with a key, a citation and the figures its sentence needs", () => {
    const e = buildEstimate(home({ monthlyBillInr: 3_500 }));
    expect(e.assumptions.length).toBeGreaterThanOrEqual(7);
    const copy: AssumptionCopy = { assumptions: quotePage.assumptions, citations: quotePage.citations };
    for (const a of e.assumptions) {
      expect(copy.assumptions[a.key], `no template for ${a.key}`).toBeDefined();
      expect(copy.citations[a.citation], `no citation for ${a.citation}`).toBeDefined();
      // Every hole the template opens is a hole the engine filled.
      for (const name of placeholdersIn(copy.assumptions[a.key].value)) {
        expect(a.params[name], `${a.key} is missing {${name}}`).toBeDefined();
      }
      const described = describeAssumption(a, copy);
      expect(described.label.length).toBeGreaterThan(0);
      expect(described.value.length).toBeGreaterThan(0);
      expect(described.citation.length).toBeGreaterThan(0);
      expect(described.value).not.toMatch(/\{\w+\}/);
    }

    const subsidy = (input: EstimateInput) => {
      const found = buildEstimate(input).assumptions.find((a) => a.key.startsWith("subsidy"));
      return found ? describeAssumption(found, copy).value : "";
    };
    expect(subsidy(home({ monthlyBillInr: 3_500 }))).toContain("₹30,000");
    expect(subsidy({ segment: "housing-society", monthlyBillInr: 45_000 })).toContain("₹18,000");
    expect(subsidy({ segment: "commercial", monthlyBillInr: 1_00_000 })).toContain("Not applicable");
  });

  it("carries a source and effective date on every constant", () => {
    for (const c of ENGINE_CONSTANTS) {
      expect(c.id).toMatch(/^[a-z0-9-]+$/);
      expect(c.source.length).toBeGreaterThan(10);
      expect(c.effectiveFrom).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(["official", "to-confirm", "assumption", "owner-accepted"]).toContain(c.status);
    }
  });

  /**
   * The assumptions panel is rendered to visitors on / and /get-quote, so it must never leak
   * the repo's own provenance notes: "legacy site engine", "to be confirmed", or an instruction
   * addressed to the owner. Those live in each constant's `source`; the panel prints `citation`.
   */
  it("keeps internal project-status language out of the customer-facing assumptions", () => {
    const internal = [
      /legacy site engine/i,
      /to be confirmed/i,
      /not re-verified/i,
      /owner to (confirm|supply|replace)/i,
      /applied to every segment/i,
    ];
    const inputs: EstimateInput[] = [
      { segment: "home", monthlyBillInr: 3_500, roofAreaSqft: 400 },
      { segment: "housing-society", monthlyBillInr: 45_000, roofAreaSqft: 4_000 },
      { segment: "commercial", monthlyBillInr: 2_00_000, roofAreaSqft: 20_000 },
    ];
    const copy: AssumptionCopy = { assumptions: quotePage.assumptions, citations: quotePage.citations };
    for (const input of inputs) {
      for (const a of buildEstimate(input).assumptions) {
        const described = describeAssumption(a, copy);
        for (const pattern of internal) {
          expect(`${described.label}: ${described.value} — ${described.citation}`).not.toMatch(pattern);
        }
      }
    }
  });

  it("gives every constant a citation that is safe to print, or a source that already is", () => {
    for (const c of ENGINE_CONSTANTS) {
      const shown = citationFor(c);
      expect(shown.length).toBeGreaterThan(10);
      if (c.status !== "official") {
        // An unverified figure needs its own customer-facing wording; reusing the internal
        // note is what put "legacy site engine … to be confirmed" on the live page.
        expect(c.citation, `${c.id} needs a citation`).toBeDefined();
      }
    }
  });
});

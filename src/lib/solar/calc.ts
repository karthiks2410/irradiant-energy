/**
 * Rooftop-solar estimate engine: pure functions, no I/O, no React.
 *
 * Used by the calculator island (live), by the lead action (server-side recompute for the
 * sales alert) and by tests. Every number it returns is an estimate; the `assumptions`
 * array lists what it rests on so the UI can print them beside the figures.
 *
 * Ported from the legacy site with the fixes documented in
 * docs/discovery/04-content-discover-quote.md §7.4 and docs/discovery/05-engineering-audit.md §16.
 */

import {
  ANNUAL_DEGRADATION,
  ANNUAL_TARIFF_INFLATION,
  BESCOM_DOMESTIC_SLABS,
  BILL_BOUNDS,
  DEFAULT_NON_DOMESTIC_TARIFF,
  ENGINE_VERSION,
  GRID_EMISSION_FACTOR,
  INSTALL_COST_PER_KWP,
  KWH_BOUNDS,
  OFFSET_CAP,
  PM_SURYA_GHAR_RESIDENTIAL,
  PM_SURYA_GHAR_SCHEME_END,
  PM_SURYA_GHAR_SOCIETY,
  PROJECTION_HORIZON_YEARS,
  ROOF_SQFT_PER_KWP,
  SPECIFIC_YIELD,
  SYSTEM_SIZE_LIMITS,
  type InputBounds,
  type Segment,
  type TariffSlab,
} from "./constants";

export type { Segment } from "./constants";

export interface EstimateInput {
  segment: Segment;
  /** Six-digit Indian PIN code; decides whether BESCOM tariffs actually apply. */
  pincode?: string;
  /** Monthly electricity bill in INR. Used when `monthlyKwh` is absent. */
  monthlyBillInr?: number;
  /** Monthly consumption in kWh; wins over the bill when both are given. */
  monthlyKwh?: number;
  /** Visitor-entered average tariff (INR per kWh). Replaces the slab table or the flat default. */
  averageTariffInrPerKwh?: number;
  /** Available roof area in sq ft; caps the system size when given. */
  roofAreaSqft?: number;
  /** Housing societies only: number of houses, which caps the subsidised capacity. */
  houses?: number;
}

export type EstimateFlag =
  /** Neither a bill nor a consumption figure was usable; the segment default bill was used. */
  | "bill-defaulted"
  | "bill-clamped"
  | "kwh-clamped"
  /** PIN code is outside Karnataka or unknown; the estimate still uses Karnataka (BESCOM) tariffs. */
  | "tariff-assumed-karnataka"
  /** Karnataka PIN code served by another ESCOM; the estimate uses BESCOM tariffs. */
  | "tariff-assumed-bescom"
  /** Society or business connection priced at the flat default tariff. */
  | "tariff-assumed-flat"
  | "size-minimum-applied"
  | "size-capped-segment"
  | "size-capped-roof"
  /** Commercial connections get no PM Surya Ghar subsidy. */
  | "subsidy-not-applicable"
  /** Society subsidy shown without a house count, so only the 500 kW cap applied. */
  | "subsidy-house-count-unknown";

/**
 * One line of the assumptions panel, as keys and figures rather than as a sentence.
 *
 * The engine runs in the browser on an English page and on a Kannada one, and in the Server
 * Action that recomputes the estimate for the sales alert. If it returned prose, one of those
 * three would always be in the wrong language, and the only way to fix it would be to ship both
 * languages' copy to every visitor. So it returns what it knows — which assumption this is, the
 * figures that went into it, and which citation belongs under it — and the page renders it from
 * templates it was handed (docs/kannada/research/architecture.md §6.7).
 *
 * `params` is plain data for the same reason: it crosses the RSC boundary as props.
 */
export interface Assumption {
  key: AssumptionKey;
  /** `{placeholder}` values for the key's template, formatted en-IN in both locales (§6.7). */
  params: Readonly<Record<string, string | number>>;
  citation: CitationKey;
}

/**
 * Which assumption a line is. One key per sentence, so the tariff and the subsidy have a key per
 * branch rather than one key whose template hides a choice.
 */
export type AssumptionKey =
  | "tariffSlabs"
  | "tariffFlat"
  | "tariffEntered"
  | "offset"
  | "exportCredit"
  | "generation"
  | "installedCost"
  | "subsidyHome"
  | "subsidySociety"
  | "subsidyCommercial"
  | "roofArea"
  | "projection";

/**
 * Which provenance line sits under an assumption.
 *
 * Every one of these resolves to `citationFor(<constant>)` in `src/content/quote.ts`, except
 * `enteredTariff` and `exportCredit`, which describe what the estimate did rather than where a
 * figure came from. Internal provenance ("legacy site engine", "owner to supply…") stays in
 * constants.ts and never reaches a visitor.
 */
export type CitationKey =
  | "bescomSlabs"
  | "nonDomesticTariff"
  | "enteredTariff"
  | "offsetCap"
  | "exportCredit"
  | "specificYield"
  | "installCost"
  | "subsidy"
  | "roofSqft"
  | "tariffInflation";

export interface Region {
  pincode: string | null;
  state: "karnataka" | "other" | "unknown";
  /** True when the tariff basis is not confirmed for this PIN code. */
  tariffAssumed: boolean;
}

export type TariffBasis = "bescom-domestic-slabs" | "flat-default" | "entered";

export interface ProjectionPoint {
  year: number;
  savingsInr: number;
  cumulativeSavingsInr: number;
}

export interface Estimate {
  engineVersion: string;
  segment: Segment;
  region: Region;
  tariff: { basis: TariffBasis; averageInrPerKwh: number };
  monthlyBillInr: number;
  monthlyKwh: number;
  systemKwp: number;
  roofAreaSqft: number;
  annualGenerationKwh: number;
  monthlyGenerationKwh: number;
  /** Units per month credited against the bill (capped by OFFSET_CAP). */
  monthlyOffsetKwh: number;
  grossCostInr: number;
  subsidyInr: number;
  netCostInr: number;
  monthlySavingsInr: number;
  annualSavingsInr: number;
  /** Year-one savings as a share of the entered bill; always below 1. */
  savingsShareOfBill: number;
  /** Simple payback on year-one savings; null when there are no savings. */
  paybackYears: number | null;
  co2AvoidedKgPerYear: number;
  projection: {
    horizonYears: number;
    points: ProjectionPoint[];
    /** Sum of projected savings over the horizon, before the system cost. */
    cumulativeSavingsInr: number;
    /** Cumulative savings minus the net system cost. */
    netBenefitInr: number;
  };
  flags: EstimateFlag[];
  assumptions: Assumption[];
}

const inr = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });
const inr2 = new Intl.NumberFormat("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const isFiniteNumber = (n: unknown): n is number => typeof n === "number" && Number.isFinite(n);

/** Rounds up to the next multiple of `step`, tolerating floating-point noise. */
const ceilToStep = (value: number, step: number) => Math.ceil(value / step - 1e-9) * step;

const floorToStep = (value: number, step: number) => Math.floor(value / step + 1e-9) * step;

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

/**
 * India Post PIN zones 56–59 are Karnataka. BESCOM serves the 56xxxx band (Bengaluru and
 * neighbouring districts); other Karnataka ESCOMs follow separate KERC schedules.
 */
export function resolveRegion(pincode?: string): Region {
  const pin = pincode?.trim() ?? "";
  if (!/^[1-9][0-9]{5}$/.test(pin)) {
    return { pincode: null, state: "unknown", tariffAssumed: true };
  }
  const zone = pin.slice(0, 2);
  if (zone === "56") return { pincode: pin, state: "karnataka", tariffAssumed: false };
  if (zone === "57" || zone === "58" || zone === "59") {
    return { pincode: pin, state: "karnataka", tariffAssumed: true };
  }
  return { pincode: pin, state: "other", tariffAssumed: true };
}

/** Energy charges for a month's consumption under a slab schedule. */
export function billFromKwh(kwh: number, slabs: readonly TariffSlab[] = BESCOM_DOMESTIC_SLABS.value): number {
  if (!(kwh > 0)) return 0;
  let remaining = kwh;
  let total = 0;
  for (const slab of slabs) {
    const size = slab.toKwh === null ? Infinity : slab.toKwh - slab.fromKwh;
    const inSlab = Math.min(remaining, size);
    total += inSlab * slab.inrPerKwh;
    remaining -= inSlab;
    if (remaining <= 0) break;
  }
  return total;
}

/** Inverse of `billFromKwh`: the consumption that produces a given month's energy charges. */
export function kwhFromBill(billInr: number, slabs: readonly TariffSlab[] = BESCOM_DOMESTIC_SLABS.value): number {
  if (!(billInr > 0)) return 0;
  let remaining = billInr;
  let kwh = 0;
  for (const slab of slabs) {
    const size = slab.toKwh === null ? Infinity : slab.toKwh - slab.fromKwh;
    const slabCost = size * slab.inrPerKwh;
    if (remaining <= slabCost) return kwh + remaining / slab.inrPerKwh;
    kwh += size;
    remaining -= slabCost;
  }
  return kwh;
}

/** PM Surya Ghar CFA for an individual residential connection, per kW with the official cap. */
export function residentialSubsidy(kwp: number): number {
  if (!(kwp > 0)) return 0;
  const { inrPerKwFirstBand, firstBandKw, inrPerKwSecondBand, secondBandKw, capInr } = PM_SURYA_GHAR_RESIDENTIAL.value;
  const firstBand = Math.min(kwp, firstBandKw) * inrPerKwFirstBand;
  const secondBand = clamp(kwp - firstBandKw, 0, secondBandKw) * inrPerKwSecondBand;
  return Math.min(Math.round(firstBand + secondBand), capInr);
}

/** PM Surya Ghar CFA for a housing society's common facilities: ₹18,000/kW up to 500 kW and 3 kW per house. */
export function societySubsidy(kwp: number, houses?: number): number {
  if (!(kwp > 0)) return 0;
  const { inrPerKw, maxKw, maxKwPerHouse } = PM_SURYA_GHAR_SOCIETY.value;
  const houseCap = isFiniteNumber(houses) && houses > 0 ? Math.floor(houses) * maxKwPerHouse : Infinity;
  const eligibleKw = Math.min(kwp, maxKw, houseCap);
  return Math.round(eligibleKw * inrPerKw);
}

export function subsidyFor(segment: Segment, kwp: number, houses?: number): number {
  switch (segment) {
    case "home":
      return residentialSubsidy(kwp);
    case "housing-society":
      return societySubsidy(kwp, houses);
    case "commercial":
      return 0;
  }
}

export const billBounds = (segment: Segment): InputBounds => BILL_BOUNDS[segment];
export const kwhBounds = (segment: Segment): InputBounds => KWH_BOUNDS[segment];

/** Year-by-year savings with tariff inflation and panel degradation compounding from year 2. */
export function projectSavings(yearOneAnnualSavingsInr: number, years: number): ProjectionPoint[] {
  const points: ProjectionPoint[] = [];
  let cumulative = 0;
  for (let year = 1; year <= years; year++) {
    const growth = Math.pow(1 + ANNUAL_TARIFF_INFLATION.value, year - 1);
    const decay = Math.pow(1 - ANNUAL_DEGRADATION.value, year - 1);
    const savings = Math.round(yearOneAnnualSavingsInr * growth * decay);
    cumulative += savings;
    points.push({ year, savingsInr: savings, cumulativeSavingsInr: cumulative });
  }
  return points;
}

interface ResolvedTariff {
  basis: TariffBasis;
  averageInrPerKwh: number;
  monthlyBillInr: number;
  monthlyKwh: number;
  flags: EstimateFlag[];
}

/**
 * Turns whichever of bill / kWh / tariff the visitor gave into a consistent
 * (bill, kWh, average tariff) triple, clamped to the segment's bounds.
 */
function resolveTariff(input: EstimateInput): ResolvedTariff {
  const flags: EstimateFlag[] = [];
  const bounds = BILL_BOUNDS[input.segment];
  const unitBounds = KWH_BOUNDS[input.segment];

  const entered = isFiniteNumber(input.averageTariffInrPerKwh) && input.averageTariffInrPerKwh > 0 ? input.averageTariffInrPerKwh : null;
  const basis: TariffBasis = entered !== null ? "entered" : input.segment === "home" ? "bescom-domestic-slabs" : "flat-default";
  if (basis === "flat-default") flags.push("tariff-assumed-flat");

  const flatRate = entered ?? DEFAULT_NON_DOMESTIC_TARIFF.value;
  const toKwh = (bill: number) => (basis === "bescom-domestic-slabs" ? kwhFromBill(bill) : bill / flatRate);
  const toBill = (kwh: number) => (basis === "bescom-domestic-slabs" ? billFromKwh(kwh) : kwh * flatRate);

  let monthlyBillInr: number;
  let monthlyKwh: number;

  if (isFiniteNumber(input.monthlyKwh) && input.monthlyKwh > 0) {
    monthlyKwh = clamp(input.monthlyKwh, unitBounds.min, unitBounds.max);
    if (monthlyKwh !== input.monthlyKwh) flags.push("kwh-clamped");
    monthlyBillInr = toBill(monthlyKwh);
  } else {
    let bill: number;
    if (isFiniteNumber(input.monthlyBillInr) && input.monthlyBillInr > 0) {
      bill = clamp(input.monthlyBillInr, bounds.min, bounds.max);
      if (bill !== input.monthlyBillInr) flags.push("bill-clamped");
    } else {
      bill = bounds.default;
      flags.push("bill-defaulted");
    }
    monthlyBillInr = bill;
    monthlyKwh = toKwh(bill);
  }

  return { basis, averageInrPerKwh: monthlyBillInr / monthlyKwh, monthlyBillInr, monthlyKwh, flags };
}

/**
 * The assumptions behind an estimate, as keys and figures.
 *
 * Figures are formatted here rather than in the page, because the grouping is the same in both
 * locales: `Intl.NumberFormat("en-IN")` gives the lakh/crore grouping a reader in Karnataka
 * expects, and `kn-IN` gives the international one (VERIFIED, architecture.md §6.7). So the
 * number is data, the sentence around it is copy, and the two meet in `describeAssumption`.
 *
 * `citation` names the provenance line. It is a key for the same reason the sentence is: every
 * one of them is customer-facing prose, and prose cannot come out of the engine.
 */
function buildAssumptions(input: EstimateInput, tariff: ResolvedTariff, roofCapUsed: boolean): Assumption[] {
  const list: Assumption[] = [];

  if (tariff.basis === "bescom-domestic-slabs") {
    list.push({
      key: "tariffSlabs",
      params: { rate: inr2.format(tariff.averageInrPerKwh) },
      citation: "bescomSlabs",
    });
  } else if (tariff.basis === "flat-default") {
    list.push({
      key: "tariffFlat",
      params: { rate: inr2.format(tariff.averageInrPerKwh) },
      citation: "nonDomesticTariff",
    });
  } else {
    list.push({
      key: "tariffEntered",
      params: { rate: inr2.format(tariff.averageInrPerKwh) },
      citation: "enteredTariff",
    });
  }

  list.push({
    key: "offset",
    params: { offsetPct: Math.round(OFFSET_CAP.value * 100) },
    citation: "offsetCap",
  });
  list.push({ key: "exportCredit", params: {}, citation: "exportCredit" });
  list.push({
    key: "generation",
    params: { yield: inr.format(Math.round(SPECIFIC_YIELD.value)) },
    citation: "specificYield",
  });
  list.push({
    key: "installedCost",
    params: { costPerKwp: inr.format(INSTALL_COST_PER_KWP.value) },
    citation: "installCost",
  });

  const r = PM_SURYA_GHAR_RESIDENTIAL.value;
  const s = PM_SURYA_GHAR_SOCIETY.value;
  if (input.segment === "home") {
    list.push({
      key: "subsidyHome",
      params: {
        firstRate: inr.format(r.inrPerKwFirstBand),
        firstKw: r.firstBandKw,
        secondRate: inr.format(r.inrPerKwSecondBand),
        secondKw: r.secondBandKw,
        cap: inr.format(r.capInr),
        schemeEnd: PM_SURYA_GHAR_SCHEME_END,
      },
      citation: "subsidy",
    });
  } else if (input.segment === "housing-society") {
    list.push({
      key: "subsidySociety",
      params: {
        ratePerKw: inr.format(s.inrPerKw),
        kwPerHouse: s.maxKwPerHouse,
        maxKw: inr.format(s.maxKw),
        schemeEnd: PM_SURYA_GHAR_SCHEME_END,
      },
      citation: "subsidy",
    });
  } else {
    list.push({ key: "subsidyCommercial", params: {}, citation: "subsidy" });
  }

  if (roofCapUsed) {
    list.push({
      key: "roofArea",
      params: { sqftPerKwp: ROOF_SQFT_PER_KWP.value },
      citation: "roofSqft",
    });
  }

  list.push({
    key: "projection",
    params: {
      years: PROJECTION_HORIZON_YEARS.value,
      tariffPct: (ANNUAL_TARIFF_INFLATION.value * 100).toFixed(0),
      degradationPct: (ANNUAL_DEGRADATION.value * 100).toFixed(1),
    },
    citation: "tariffInflation",
  });

  return list;
}

/** Builds the full estimate. Never throws: unusable inputs fall back to defaults and are flagged. */
export function buildEstimate(input: EstimateInput): Estimate {
  const region = resolveRegion(input.pincode);
  const tariff = resolveTariff(input);
  const flags: EstimateFlag[] = [...tariff.flags];

  if (region.state === "karnataka" && region.tariffAssumed) flags.push("tariff-assumed-bescom");
  if (region.state !== "karnataka") flags.push("tariff-assumed-karnataka");

  const { minKwp, stepKwp, maxKwp } = SYSTEM_SIZE_LIMITS.value;
  const targetAnnualKwh = tariff.monthlyKwh * 12 * OFFSET_CAP.value;
  let systemKwp = ceilToStep(targetAnnualKwh / SPECIFIC_YIELD.value, stepKwp);

  const roofCapKwp =
    isFiniteNumber(input.roofAreaSqft) && input.roofAreaSqft > 0
      ? floorToStep(input.roofAreaSqft / ROOF_SQFT_PER_KWP.value, stepKwp)
      : null;
  if (roofCapKwp !== null && roofCapKwp < systemKwp) {
    systemKwp = roofCapKwp;
    flags.push("size-capped-roof");
  }
  const segmentMax = maxKwp[input.segment];
  if (systemKwp > segmentMax) {
    systemKwp = segmentMax;
    flags.push("size-capped-segment");
  }
  if (systemKwp < minKwp) {
    systemKwp = minKwp;
    flags.push("size-minimum-applied");
  }

  const annualGenerationKwh = systemKwp * SPECIFIC_YIELD.value;
  const monthlyGenerationKwh = annualGenerationKwh / 12;
  const monthlyOffsetKwh = Math.min(monthlyGenerationKwh, tariff.monthlyKwh * OFFSET_CAP.value);
  const monthlySavingsInr = monthlyOffsetKwh * tariff.averageInrPerKwh;
  const annualSavingsInr = monthlySavingsInr * 12;

  const grossCostInr = systemKwp * INSTALL_COST_PER_KWP.value;
  const subsidyInr = subsidyFor(input.segment, systemKwp, input.houses);
  if (input.segment === "commercial") flags.push("subsidy-not-applicable");
  if (input.segment === "housing-society" && !(isFiniteNumber(input.houses) && input.houses > 0)) {
    flags.push("subsidy-house-count-unknown");
  }
  const netCostInr = Math.max(0, grossCostInr - subsidyInr);

  const horizonYears = PROJECTION_HORIZON_YEARS.value;
  const points = projectSavings(annualSavingsInr, horizonYears);
  const cumulativeSavingsInr = points.length ? points[points.length - 1].cumulativeSavingsInr : 0;

  return {
    engineVersion: ENGINE_VERSION,
    segment: input.segment,
    region,
    tariff: { basis: tariff.basis, averageInrPerKwh: Number(tariff.averageInrPerKwh.toFixed(2)) },
    monthlyBillInr: Math.round(tariff.monthlyBillInr),
    monthlyKwh: Math.round(tariff.monthlyKwh),
    systemKwp,
    roofAreaSqft: Math.round(systemKwp * ROOF_SQFT_PER_KWP.value),
    annualGenerationKwh: Math.round(annualGenerationKwh),
    monthlyGenerationKwh: Math.round(monthlyGenerationKwh),
    monthlyOffsetKwh: Math.round(monthlyOffsetKwh),
    grossCostInr: Math.round(grossCostInr),
    subsidyInr,
    netCostInr: Math.round(netCostInr),
    monthlySavingsInr: Math.round(monthlySavingsInr),
    annualSavingsInr: Math.round(annualSavingsInr),
    savingsShareOfBill: Number((monthlySavingsInr / tariff.monthlyBillInr).toFixed(3)),
    paybackYears: annualSavingsInr > 0 ? Number((netCostInr / annualSavingsInr).toFixed(1)) : null,
    co2AvoidedKgPerYear: Math.round(annualGenerationKwh * GRID_EMISSION_FACTOR.value),
    projection: {
      horizonYears,
      points,
      cumulativeSavingsInr,
      netBenefitInr: Math.round(cumulativeSavingsInr - netCostInr),
    },
    flags,
    assumptions: buildAssumptions(input, tariff, roofCapKwp !== null),
  };
}

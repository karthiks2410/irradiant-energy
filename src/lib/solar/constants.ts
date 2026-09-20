/**
 * Estimate-engine constants.
 *
 * Every figure carries its source, effective date and status so the calculator can print
 * an assumptions list beside the numbers (brand PDF p.31) and the owner can confirm each
 * value before launch (docs/discovery/04-content-discover-quote.md §7.6,
 * docs/content-inventory.md §5.6). Nothing here is rendered as a fact without its label.
 */

/** Rooftop-solar customer segments live in v1 (decisions.md D-009). */
export const SEGMENTS = ["home", "housing-society", "commercial"] as const;
export type Segment = (typeof SEGMENTS)[number];

export const SEGMENT_LABELS: Record<Segment, string> = {
  home: "Home",
  "housing-society": "Housing society",
  commercial: "Business",
};

export type ConstantStatus =
  /** Published by a government body; the citation is in `source`. */
  | "official"
  /** Carried over from the legacy site; the owner must confirm it before launch. */
  | "to-confirm"
  /** A modelling assumption, not a fact; always shown as such. */
  | "assumption";

export interface EngineConstant<T> {
  readonly id: string;
  readonly label: string;
  readonly value: T;
  readonly unit?: string;
  /**
   * Internal provenance: where the figure came from and what is still owed on it. Written for
   * the repo and the owner review, never rendered to a visitor.
   */
  readonly source: string;
  /**
   * Customer-facing provenance, printed under the figure in the calculator's assumptions
   * panel. Official constants cite the primary source; unverified ones say plainly that the
   * figure is indicative and confirmed at the site visit. Never names the legacy engine, never
   * says "to be confirmed", never carries an instruction to the owner. Defaults to `source`,
   * so anything without its own citation must be safe to show.
   */
  readonly citation?: string;
  /** ISO date the value took effect (or the date of the document it was read from). */
  readonly effectiveFrom: string;
  readonly status: ConstantStatus;
  readonly note?: string;
}

/** The string the calculator prints under a figure: the customer-facing one where it exists. */
export function citationFor(constant: EngineConstant<unknown>): string {
  return constant.citation ?? constant.source;
}

/** Bump when a formula or constant changes; the lead alert carries it so past figures stay explainable. */
export const ENGINE_VERSION = "2026.09.1";

export interface TariffSlab {
  /** Inclusive lower bound, kWh per month. */
  readonly fromKwh: number;
  /** Exclusive upper bound, kWh per month; `null` means no upper bound. */
  readonly toKwh: number | null;
  readonly inrPerKwh: number;
}

const MNRE_GUIDELINES =
  "MNRE, Operational Guidelines for the CFA component of PM Surya Ghar: Muft Bijli Yojana, notice of 2 Jul 2024, §4(h) " +
  "(https://mnre.gov.in/en/notice/operational-guidelines-for-implementation-of-the-component-central-financial-assistance-to-residential-consumers-of-pm-surya-ghar-muft-bijli-yojana/); " +
  "CFA structure sheet of 7 Mar 2024 (pmsg-production-public.s3.ap-south-1.amazonaws.com/CFA_structure20240307.pdf)";

/**
 * PM Surya Ghar central financial assistance for individual residential connections.
 * Per kW, not a step function (fixes docs/discovery/04 §7.4-B).
 */
export const PM_SURYA_GHAR_RESIDENTIAL = {
  id: "pmsg-residential",
  label: "PM Surya Ghar subsidy (residential)",
  value: {
    inrPerKwFirstBand: 30_000,
    firstBandKw: 2,
    inrPerKwSecondBand: 18_000,
    secondBandKw: 1,
    capInr: 78_000,
  },
  unit: "INR",
  source: MNRE_GUIDELINES,
  effectiveFrom: "2024-07-02",
  status: "official",
  note:
    "Eligible residential connections using DCR modules through a vendor registered on the National Portal. " +
    "Special-category states get higher rates (not modelled). Scheme implementation period runs to 31 Mar 2027 (§2(d)).",
} as const satisfies EngineConstant<{
  inrPerKwFirstBand: number;
  firstBandKw: number;
  inrPerKwSecondBand: number;
  secondBandKw: number;
  capInr: number;
}>;

/** PM Surya Ghar CFA for group housing societies / RWAs: common facilities only (fixes 04 §7.4-C). */
export const PM_SURYA_GHAR_SOCIETY = {
  id: "pmsg-ghs-rwa",
  label: "PM Surya Ghar subsidy (housing society / RWA common facilities)",
  value: { inrPerKw: 18_000, maxKw: 500, maxKwPerHouse: 3 },
  unit: "INR",
  source: MNRE_GUIDELINES,
  effectiveFrom: "2024-07-02",
  status: "official",
  note: "Common facilities including EV charging, up to 500 kW, at 3 kW per house. Commercial connections get no CFA.",
} as const satisfies EngineConstant<{ inrPerKw: number; maxKw: number; maxKwPerHouse: number }>;

/** Scheme end date, for "as of" labels and a review reminder. */
export const PM_SURYA_GHAR_SCHEME_END = "2027-03-31";

/**
 * BESCOM domestic (LT-2(a)) energy-charge slabs as carried in the legacy engine.
 * Excludes fixed charges, electricity tax and FAC. docs/discovery/04 §7.5 found conflicting
 * third-party reports of the current schedule, so this table is to-confirm, not fact.
 */
export const BESCOM_DOMESTIC_SLABS = {
  id: "bescom-lt2a-slabs",
  label: "BESCOM domestic (LT-2(a)) energy charges",
  value: [
    { fromKwh: 0, toKwh: 50, inrPerKwh: 4.15 },
    { fromKwh: 50, toKwh: 100, inrPerKwh: 5.6 },
    { fromKwh: 100, toKwh: 200, inrPerKwh: 7.15 },
    { fromKwh: 200, toKwh: 400, inrPerKwh: 8.2 },
    { fromKwh: 400, toKwh: null, inrPerKwh: 9.5 },
  ] as readonly TariffSlab[],
  unit: "INR per kWh",
  source: "KERC tariff order for FY 2025-26, as recorded in the legacy site engine (not re-verified against kerc.gov.in)",
  citation: "Indicative BESCOM LT-2(a) energy charges; your actual tariff is read from your bill at the site visit",
  effectiveFrom: "2025-04-01",
  status: "to-confirm",
  note: "Energy charges only. Owner to supply the current official schedule, including fixed charges and taxes.",
} as const satisfies EngineConstant<readonly TariffSlab[]>;

/**
 * Flat average tariff for housing-society and business connections, whose BESCOM
 * categories (LT-2(b)/LT-3/LT-5/HT) differ from the domestic slabs (fixes 04 §7.4-D).
 * The UI may let the visitor enter their own average tariff instead.
 */
export const DEFAULT_NON_DOMESTIC_TARIFF = {
  id: "non-domestic-average-tariff",
  label: "Average tariff for society and business connections",
  value: 8,
  unit: "INR per kWh",
  source: "Modelling assumption (the design prototype's default tariff input); owner to replace with the applicable BESCOM category tariff",
  citation: "Indicative average tariff; society and business connections are priced on your own BESCOM category and bill",
  effectiveFrom: "2026-09-19",
  status: "assumption",
} as const satisfies EngineConstant<number>;

/** Karnataka specific yield carried from the legacy engine (4.5 kWh/kWp/day). The prototype used 1,450. */
export const SPECIFIC_YIELD = {
  id: "specific-yield-ka",
  label: "Solar generation per kWp per year (Karnataka)",
  value: 4.5 * 365,
  unit: "kWh per kWp per year",
  source: "Legacy site engine planning figure (about 5.0–5.5 peak sun hours a day, derated for soiling, temperature and inverter losses)",
  citation: "Planning figure for Karnataka (about 5.0–5.5 peak sun hours a day, derated for soiling, temperature and inverter losses); your roof is modelled at the site visit",
  effectiveFrom: "2026-02-01",
  status: "to-confirm",
  note: "Owner to confirm the figure used in proposals.",
} as const satisfies EngineConstant<number>;

/**
 * Share of a month's grid units that rooftop solar is credited against. Fixed charges,
 * taxes, night-time and monsoon shortfalls keep part of every bill payable, so savings are
 * never the whole bill (fixes 04 §7.4-A; brand PDF p.27 forbids "save 100%").
 */
export const OFFSET_CAP = {
  id: "offset-cap",
  label: "Maximum share of grid units offset by solar",
  value: 0.9,
  unit: "share",
  source: "Modelling assumption",
  citation: "Modelling assumption",
  effectiveFrom: "2026-09-19",
  status: "assumption",
} as const satisfies EngineConstant<number>;

/** Installed cost before subsidy. The legacy code was ambiguous about gross vs net; here it is gross. */
export const INSTALL_COST_PER_KWP = {
  id: "install-cost-per-kwp",
  label: "Installed cost per kWp, before subsidy",
  value: 60_000,
  unit: "INR per kWp",
  source: "Legacy site engine benchmark (residential); applied to every segment until the owner supplies per-segment pricing",
  citation: "Indicative benchmark for a standard rooftop installation; your price comes from the site survey and the written proposal",
  effectiveFrom: "2026-02-01",
  status: "to-confirm",
} as const satisfies EngineConstant<number>;

/** Conflicts with the legacy FAQ's "roughly 100 sq ft per kW" (content-inventory CF-06); owner to settle. */
export const ROOF_SQFT_PER_KWP = {
  id: "roof-sqft-per-kwp",
  label: "Roof area needed per kWp",
  value: 70,
  unit: "sq ft per kWp",
  source: "Legacy site engine (mainstream modules at standard tilt)",
  citation: "Indicative area for mainstream modules at standard tilt; the usable area is measured at the site visit",
  effectiveFrom: "2026-02-01",
  status: "to-confirm",
} as const satisfies EngineConstant<number>;

export const ANNUAL_DEGRADATION = {
  id: "annual-degradation",
  label: "Panel output degradation per year",
  value: 0.005,
  unit: "share per year",
  source: "Modelling assumption carried from the legacy engine; owner to confirm against the module warranty",
  citation: "Modelling assumption; the figure for your system comes from the module warranty in your proposal",
  effectiveFrom: "2026-02-01",
  status: "assumption",
} as const satisfies EngineConstant<number>;

export const ANNUAL_TARIFF_INFLATION = {
  id: "annual-tariff-inflation",
  label: "Grid tariff increase per year",
  value: 0.04,
  unit: "share per year",
  source: "Modelling assumption carried from the legacy engine",
  citation: "Modelling assumption; future tariffs are set by KERC and cannot be guaranteed",
  effectiveFrom: "2026-02-01",
  status: "assumption",
} as const satisfies EngineConstant<number>;

export const PROJECTION_HORIZON_YEARS = {
  id: "projection-horizon",
  label: "Savings projection horizon",
  value: 15,
  unit: "years",
  source: "Modelling assumption carried from the legacy engine",
  citation: "Modelling assumption",
  effectiveFrom: "2026-02-01",
  status: "assumption",
} as const satisfies EngineConstant<number>;

/** Grid emission factor. 1 tCO2/MWh equals 1 kg CO2/kWh. Replaces the unsourced 0.82 (04 §7.5). */
export const GRID_EMISSION_FACTOR = {
  id: "grid-emission-factor",
  label: "Grid emission factor (all-India weighted average)",
  value: 0.727,
  unit: "kg CO2 per kWh",
  source: "CEA CO2 Baseline Database v20 (Dec 2024), FY 2023-24 weighted average 0.727 tCO2/MWh (https://cea.nic.in/cdm-co2-baseline-database/?lang=en)",
  effectiveFrom: "2024-12-01",
  status: "official",
  note: "v21 (FY 2024-25, provisional, about 0.71) to be confirmed against the primary source before the next review.",
} as const satisfies EngineConstant<number>;

export interface InputBounds {
  readonly min: number;
  readonly max: number;
  readonly step: number;
  readonly default: number;
}

/** Monthly bill (INR) per segment. Home values are the legacy site's live defaults; the others replace a single ₹50,000 cap (04 §6.2). */
export const BILL_BOUNDS: Record<Segment, InputBounds> = {
  home: { min: 500, max: 50_000, step: 500, default: 3_500 },
  "housing-society": { min: 5_000, max: 5_00_000, step: 1_000, default: 45_000 },
  commercial: { min: 10_000, max: 20_00_000, step: 5_000, default: 2_00_000 },
};

/** Monthly consumption (kWh) per segment, for the units mode of the calculator. */
export const KWH_BOUNDS: Record<Segment, InputBounds> = {
  home: { min: 50, max: 5_000, step: 50, default: 350 },
  "housing-society": { min: 500, max: 60_000, step: 100, default: 5_000 },
  commercial: { min: 1_000, max: 2_50_000, step: 500, default: 25_000 },
};

/** Sizing limits so a "home" never becomes a 40 kWp plant (04 §7.4-I). */
export const SYSTEM_SIZE_LIMITS = {
  id: "system-size-limits",
  label: "System size limits per segment",
  value: {
    minKwp: 1,
    stepKwp: 0.5,
    maxKwp: { home: 10, "housing-society": 500, commercial: 1_000 } as Record<Segment, number>,
  },
  unit: "kWp",
  source: "Modelling assumption: 10 kWp is a common domestic rooftop ceiling, 500 kWp matches the society subsidy ceiling; owner to confirm",
  citation: "Modelling assumption: a common domestic rooftop ceiling, and the society subsidy ceiling",
  effectiveFrom: "2026-09-19",
  status: "assumption",
} as const satisfies EngineConstant<{ minKwp: number; stepKwp: number; maxKwp: Record<Segment, number> }>;

/** Every constant, for a methodology page or a review checklist. */
export const ENGINE_CONSTANTS: readonly EngineConstant<unknown>[] = [
  PM_SURYA_GHAR_RESIDENTIAL,
  PM_SURYA_GHAR_SOCIETY,
  BESCOM_DOMESTIC_SLABS,
  DEFAULT_NON_DOMESTIC_TARIFF,
  SPECIFIC_YIELD,
  OFFSET_CAP,
  INSTALL_COST_PER_KWP,
  ROOF_SQFT_PER_KWP,
  ANNUAL_DEGRADATION,
  ANNUAL_TARIFF_INFLATION,
  PROJECTION_HORIZON_YEARS,
  GRID_EMISSION_FACTOR,
  SYSTEM_SIZE_LIMITS,
];

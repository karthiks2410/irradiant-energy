"use client";

/**
 * The home page's working estimate panel: the white half of the prototype's `.calc-shell`.
 *
 * It is the only client code in the band — the dark half, the heading and the CTA are server
 * rendered and passed around it — and it holds nothing but the inputs. Every figure it prints
 * comes from `buildEstimate` (src/lib/solar/calc.ts), the same engine /get-quote and the lead
 * alert use, so the home page can never quote a number the proposal flow disagrees with.
 * No constant is defined here.
 *
 * The prototype's own maths is deliberately not reproduced: it multiplied savings by an invented
 * daytime-use factor and priced systems at a flat ₹52,000/kWp. The engine's constants carry a
 * source and a status, and the panel shows them under the figures.
 *
 * Owner review round 2:
 * - point 8: the PIN code is required, and no figure is computed until one is present. The PIN
 *   decides which tariffs apply, so without it the engine would quietly price a Karnataka
 *   (BESCOM) estimate for a visitor anywhere in India.
 * - point 9: the "Average tariff" input is gone. It overrode the slab table, which is the
 *   documented basis for every figure here; the estimate now always uses the BESCOM domestic
 *   slabs (home) or the flat default (society and business), both named under "Assumptions".
 *   The engine keeps that input in its API — it is simply no longer offered to visitors.
 * - the fields sit in <FieldRow>s so the inputs line up whatever the helper text says.
 *
 * Redesign (#14): the bill is typed, the sanctioned load from the bill is required and caps the
 * size, a society gives its number of homes, and the recommended system leads in its own
 * callout above three tiles. Every engine note carries a small warning mark.
 */

import { useMemo, useState, type ChangeEvent, type ReactNode } from "react";
import { parseSegment } from "@/components/quote/copy";
import { FieldRow, fieldCell, fieldCellNoHelper } from "@/components/quote/FieldRow";
import { ChevronDownIcon, NoteMark, SelectField, StatTile, TextField } from "@/components/ui";
import { fill } from "@/i18n/format";
import { describeAssumptions, type AssumptionCopy } from "@/lib/solar/assumptions";
import { buildEstimate, type EstimateFlag } from "@/lib/solar/calc";
import { ROOF_SQFT_PER_KWP, SEGMENTS, type Segment } from "@/lib/solar/constants";
import { TickerNumber } from "@/components/motion/TickerNumber";
import { useHomeEstimate } from "./HomeEstimateProvider";
import { formatInr } from "@/lib/solar/format";

/** The visitor may type a city, a PIN code or both; only a well-formed PIN reaches the engine. */
const PINCODE_RE = /(?:^|\D)([1-9][0-9]{5})(?!\d)/;

/**
 * Every word this panel prints, handed down by <HomeCalculator>.
 *
 * It is a client island, so it may not import a content module: that would put both languages'
 * copy in the browser bundle, and Kannada strings in an English page's payload. The engine keeps
 * the keys — segment ids, flag ids — and this carries the wording for them.
 */
export type CalculatorUi = {
  pincodePlaceholder: string;
  pincodeError: string;
  /** Under the payback tile when a subsidy is counted in it. */
  subsidyNote: string;
  /** "~{sqft} sq ft of roof" under the recommended size. */
  roofNeeded: string;
  yearsUnit: string;
  kwpUnit: string;
  kwhUnit: string;
  segments: Record<Segment, string>;
  flags: Record<EstimateFlag, string>;
};

const digitsOnly = (value: string, max: number) => value.replace(/\D/g, "").slice(0, max);

const positive = (value: string): number | undefined => {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : undefined;
};

type FieldCopy = { label: string; hint?: string };

type Tile = { label: string; value: ReactNode; unit?: string; note?: string };

/**
 * Figures travel to their new value rather than cutting to it. `key` is deliberately absent:
 * React must keep the same TickerNumber instance across an estimate change, or the spring
 * restarts from the new value and nothing moves.
 */
const ticker = (value: number, format: (n: number) => string) => (
  <TickerNumber value={value} format={format} />
);

export type HomeCalculatorPanelProps = {
  fields: Record<"segment" | "location" | "bill" | "load" | "houses", FieldCopy>;
  results: { title: string; size: string; savings: string; payback: string; subsidy: string; cost: string };
  assumptionsLabel: string;
  disclaimer: string;
  /**
   * The templates behind the assumptions panel. The engine returns keys and figures, never
   * prose (src/lib/solar/calc.ts), so the words for them arrive with the rest of the copy.
   */
  assumptions: AssumptionCopy;
  ui: CalculatorUi;
  /** The "(optional)" marker beside an optional field's label. */
  optionalMarker: string;
  className?: string;
};

export function HomeCalculatorPanel({
  fields,
  results,
  assumptionsLabel,
  disclaimer,
  assumptions,
  ui,
  optionalMarker,
  className = "",
}: HomeCalculatorPanelProps) {
  const segmentOptions = SEGMENTS.map((value) => ({ value, label: ui.segments[value] }));
  // Segment, bill and PIN come from the page-level provider, so the hero's estimate entry and
  // this panel are working on the same numbers rather than two copies of them.
  const { segment, setSegment, bill, setBill, location, setLocation } = useHomeEstimate();
  const [locationTouched, setLocationTouched] = useState(false);
  const [sanctionedLoad, setSanctionedLoad] = useState("");
  const [houses, setHouses] = useState("");

  const pincode = PINCODE_RE.exec(location)?.[1];

  const estimate = useMemo(
    () => {
      const loadKw = positive(sanctionedLoad);
      return loadKw !== undefined
        ? buildEstimate({
            segment,
            pincode,
            monthlyBillInr: positive(bill),
            sanctionedLoadKw: loadKw,
            houses: segment === "housing-society" ? positive(houses) : undefined,
          })
        : null;
    },
    [segment, pincode, bill, sanctionedLoad, houses],
  );

  const changeSegment = (event: ChangeEvent<HTMLSelectElement>) => setSegment(parseSegment(event.target.value));

  const payback = estimate?.paybackYears ?? null;

  const tiles: Tile[] = estimate
    ? [
        {
          label: results.savings,
          value: ticker(estimate.monthlySavingsInr, (n) => formatInr(Math.round(n))),
        },
        {
          label: results.payback,
          value: payback === null ? "—" : ticker(payback, (n) => n.toFixed(1)),
          unit: payback === null ? undefined : ui.yearsUnit,
          note: estimate.subsidyInr > 0 ? ui.subsidyNote : undefined,
        },
        estimate.subsidyInr > 0
          ? {
              label: results.subsidy,
              value: ticker(estimate.subsidyInr, (n) => formatInr(Math.round(n))),
            }
          : {
              label: results.cost,
              value: ticker(estimate.netCostInr, (n) => formatInr(Math.round(n))),
            },
      ]
    : [
        { label: results.savings, value: formatInr(0) },
        { label: results.payback, value: "0", unit: ui.yearsUnit },
        { label: results.cost, value: formatInr(0) },
      ];

  return (
    <div className={`p-[22px] md:p-6 ${className}`}>
      <div className="grid gap-4">
        <FieldRow>
          <SelectField
            className={fieldCellNoHelper}
            id="home-calc-segment"
            name="home-calc-segment"
            label={fields.segment.label}
            options={segmentOptions}
            value={segment}
            onChange={changeSegment}
          />

          <TextField
            className={fieldCell}
            id="home-calc-location"
            name="home-calc-location"
            label={fields.location.label}
            hint={fields.location.hint}
            required
            type="text"
            inputMode="numeric"
            autoComplete="postal-code"
            maxLength={6}
            placeholder={ui.pincodePlaceholder}
            value={location}
            onChange={(event) => setLocation(digitsOnly(event.target.value, 6))}
            onBlur={() => setLocationTouched(true)}
            error={locationTouched && pincode === undefined ? ui.pincodeError : undefined}
          />
        </FieldRow>

        <FieldRow>
          <TextField
            className={fieldCell}
            id="home-calc-bill"
            name="home-calc-bill"
            label={fields.bill.label}
            hint={fields.bill.hint}
            type="text"
            inputMode="numeric"
            autoComplete="off"
            prefix="₹"
            maxLength={8}
            value={bill}
            onChange={(event) => setBill(digitsOnly(event.target.value, 8))}
          />

          <TextField
            className={fieldCell}
            id="home-calc-load"
            name="home-calc-load"
            label={fields.load.label}
            hint={fields.load.hint}
            type="text"
            inputMode="numeric"
            autoComplete="off"
            maxLength={4}
            value={sanctionedLoad}
            onChange={(event) => setSanctionedLoad(digitsOnly(event.target.value, 4))}
          />
        </FieldRow>

        {segment === "housing-society" && (
          <TextField
            id="home-calc-houses"
            name="home-calc-houses"
            label={fields.houses.label}
            hint={fields.houses.hint}
            optional
            optionalLabel={optionalMarker}
            type="text"
            inputMode="numeric"
            autoComplete="off"
            maxLength={4}
            value={houses}
            onChange={(event) => setHouses(digitsOnly(event.target.value, 4))}
          />
        )}
      </div>

      <h3 className="mt-7 font-label text-label text-grey-600 uppercase">{results.title}</h3>

      <div aria-live="polite" className="mt-3">
        {/* Promoted system size callout */}
        {estimate && (
          <div className="mb-3 rounded-md border border-green-600/20 bg-soft-green p-4">
            <span className="block font-label text-label text-green-700 uppercase">{results.size}</span>
            <span className="mt-2 flex items-baseline gap-1.5">
              <span className="font-mono text-data-xl font-medium tabular-nums text-carbon">
                <TickerNumber value={estimate.systemKwp} format={(n) => n.toFixed(1)} />
              </span>
              <span className="text-data text-green-700">{ui.kwpUnit}</span>
            </span>
            <span className="mt-1 block text-small text-grey-600">
              {fill(ui.roofNeeded, { sqft: String(Math.round(estimate.systemKwp * ROOF_SQFT_PER_KWP.value)) })}
            </span>
          </div>
        )}

        <ul className="grid grid-cols-3 gap-2.5">
          {tiles.map((tile) => (
            <StatTile
              as="li"
              key={tile.label}
              label={tile.label}
              value={tile.value}
              unit={tile.unit}
              note={tile.note}
              estimated={estimate !== null}
              labelEstimated={false}
            />
          ))}
        </ul>

        {estimate !== null && estimate.flags.length > 0 && (
          <ul className="mt-4 grid gap-2">
            {estimate.flags.map((flag) => (
              <li key={flag} className="flex items-start gap-2 text-small text-ink-2">
                <NoteMark />
                <span>{ui.flags[flag]}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {estimate !== null && (
        <details className="group mt-5 border-t border-mist pt-3">
          <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-3 text-ui font-medium text-teal-900 [&::-webkit-details-marker]:hidden">
            <span>{assumptionsLabel}</span>
            <ChevronDownIcon className="size-4 shrink-0 transition-transform duration-200 ease-controlled group-open:rotate-180" />
          </summary>
          <dl className="mt-3 grid gap-3">
            {describeAssumptions(estimate.assumptions, assumptions).map((assumption) => (
              <div key={assumption.key}>
                <dt className="font-label text-label text-grey-600 uppercase">{assumption.label}</dt>
                <dd className="mt-1 text-small text-ink-2">{assumption.value}</dd>
                <dd className="mt-1 text-small text-grey-600">{assumption.citation}</dd>
              </div>
            ))}
          </dl>
        </details>
      )}

      <p className="mt-4 text-small text-grey-600">{disclaimer}</p>
    </div>
  );
}

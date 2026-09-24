"use client";

import { useMemo, useState, type ChangeEvent, type ReactNode } from "react";
import { enIn, flagNotes, parseSegment } from "@/components/quote/copy";
import { FieldRow, fieldCell, fieldCellNoHelper } from "@/components/quote/FieldRow";
import { ChevronDownIcon, SelectField, StatTile, TextField } from "@/components/ui";
import { buildEstimate } from "@/lib/solar/calc";
import { SEGMENTS, SEGMENT_LABELS, ROOF_SQFT_PER_KWP } from "@/lib/solar/constants";
import { TickerNumber } from "@/components/motion/TickerNumber";
import { useHomeEstimate } from "./HomeEstimateProvider";
import { formatInr } from "@/lib/solar/format";

const PINCODE_RE = /(?:^|\D)([1-9][0-9]{5})(?!\d)/;
const PINCODE_ERROR = "Enter a 6-digit PIN code, for example 560001.";

const segmentOptions = SEGMENTS.map((value) => ({ value, label: SEGMENT_LABELS[value] }));

const digitsOnly = (value: string, max: number) => value.replace(/\D/g, "").slice(0, max);

const positive = (value: string): number | undefined => {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : undefined;
};

type FieldCopy = { label: string; hint?: string };

type Tile = { label: string; value: ReactNode; unit?: string; note?: string };

const ticker = (value: number, format: (n: number) => string) => (
  <TickerNumber value={value} format={format} />
);

export type HomeCalculatorPanelProps = {
  fields: Record<"segment" | "location" | "bill" | "load" | "houses", FieldCopy>;
  results: { title: string; size: string; savings: string; payback: string; subsidy: string; cost: string };
  assumptionsLabel: string;
  disclaimer: string;
  className?: string;
};

export function HomeCalculatorPanel({ fields, results, assumptionsLabel, disclaimer, className = "" }: HomeCalculatorPanelProps) {
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
          unit: payback === null ? undefined : "years",
          note: estimate.subsidyInr > 0 ? "After the estimated subsidy" : undefined,
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
        { label: results.payback, value: "0", unit: "years" },
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
            placeholder="e.g. 560001"
            value={location}
            onChange={(event) => setLocation(digitsOnly(event.target.value, 6))}
            onBlur={() => setLocationTouched(true)}
            error={locationTouched && pincode === undefined ? PINCODE_ERROR : undefined}
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
            type="text"
            inputMode="numeric"
            autoComplete="off"
            maxLength={4}
            value={houses}
            onChange={(event) => setHouses(digitsOnly(event.target.value, 4))}
          />
        )}
      </div>

      <h3 className="mt-7 font-mono text-label text-grey-600 uppercase">{results.title}</h3>

      <div aria-live="polite" className="mt-3">
        {/* Promoted system size callout */}
        {estimate && (
          <div className="mb-3 rounded-md border border-green-600/20 bg-green-50 p-4">
            <span className="block font-mono text-label text-green-800 uppercase">{results.size}</span>
            <span className="mt-2 flex items-baseline gap-1.5">
              <span className="font-mono text-data-xl font-medium tabular-nums text-carbon">
                <TickerNumber value={estimate.systemKwp} format={(n) => n.toFixed(1)} />
              </span>
              <span className="text-data text-green-800">kWp</span>
            </span>
            <span className="mt-1 block text-small text-grey-600">
              ~{Math.round(estimate.systemKwp * ROOF_SQFT_PER_KWP.value)} sq ft of roof
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
              <li key={flag} className="text-small text-ink-2">
                {flagNotes[flag]}
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
            {estimate.assumptions.map((assumption) => (
              <div key={assumption.label}>
                <dt className="font-mono text-label text-grey-600 uppercase">{assumption.label}</dt>
                <dd className="mt-1 text-small text-ink-2">{assumption.value}</dd>
                <dd className="mt-1 text-small text-grey-600">{assumption.source}</dd>
              </div>
            ))}
          </dl>
        </details>
      )}

      <p className="mt-4 text-small text-grey-600">{disclaimer}</p>
    </div>
  );
}

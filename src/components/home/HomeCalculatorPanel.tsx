"use client";

/**
 * The home page's working estimate panel: the white half of the prototype's `.calc-shell`.
 *
 * It is the only client code in the band — the dark half, the heading and the CTA are server
 * rendered and passed around it — and it holds nothing but the six inputs. Every figure it
 * prints comes from `buildEstimate` (src/lib/solar/calc.ts), the same engine /get-quote and the
 * lead alert use, so the home page can never quote a number the proposal flow disagrees with.
 * No constant is defined here.
 *
 * The prototype's own maths is deliberately not reproduced: it multiplied savings by an invented
 * daytime-use factor and priced systems at a flat ₹52,000/kWp. The engine's constants carry a
 * source and a status, and the panel shows them under the figures.
 */

import { useMemo, useState, type ChangeEvent } from "react";
import { enIn, flagNotes, parseSegment } from "@/components/quote/copy";
import { ChevronDownIcon, SelectField, StatTile, TextField } from "@/components/ui";
import { billBounds, buildEstimate } from "@/lib/solar/calc";
import { SEGMENTS, SEGMENT_LABELS, type Segment } from "@/lib/solar/constants";
import { formatInr } from "@/lib/solar/format";

/** The visitor may type a city, a PIN code or both; only a well-formed PIN reaches the engine. */
const PINCODE_RE = /(?:^|\D)([1-9][0-9]{5})(?!\d)/;

const segmentOptions = SEGMENTS.map((value) => ({ value, label: SEGMENT_LABELS[value] }));

const digitsOnly = (value: string, max: number) => value.replace(/\D/g, "").slice(0, max);

/** Digits and a single decimal point, for the tariff field. */
const decimalOnly = (value: string) =>
  value
    .replace(/[^\d.]/g, "")
    .replace(/(\.\d*)\./g, "$1")
    .slice(0, 6);

const positive = (value: string): number | undefined => {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : undefined;
};

type FieldCopy = { label: string; hint?: string };

export type HomeCalculatorPanelProps = {
  fields: Record<"segment" | "location" | "bill" | "tariff" | "roof" | "houses", FieldCopy>;
  results: { title: string; size: string; generation: string; savings: string; payback: string };
  assumptionsLabel: string;
  disclaimer: string;
  className?: string;
};

export function HomeCalculatorPanel({ fields, results, assumptionsLabel, disclaimer, className = "" }: HomeCalculatorPanelProps) {
  const [segment, setSegment] = useState<Segment>("home");
  const [location, setLocation] = useState("");
  const [bill, setBill] = useState(() => String(billBounds("home").default));
  const [tariff, setTariff] = useState("");
  const [roofArea, setRoofArea] = useState("");
  const [houses, setHouses] = useState("");

  const pincode = PINCODE_RE.exec(location)?.[1];

  const estimate = useMemo(
    () =>
      buildEstimate({
        segment,
        pincode,
        monthlyBillInr: positive(bill),
        averageTariffInrPerKwh: positive(tariff),
        roofAreaSqft: positive(roofArea),
        houses: segment === "housing-society" ? positive(houses) : undefined,
      }),
    [segment, pincode, bill, tariff, roofArea, houses],
  );

  /** Bill ranges differ per segment, so the bill restarts at the new segment's typical value. */
  const changeSegment = (event: ChangeEvent<HTMLSelectElement>) => {
    const next = parseSegment(event.target.value);
    setSegment(next);
    setBill(String(billBounds(next).default));
  };

  const payback = estimate.paybackYears;
  const tiles = [
    { label: results.size, value: estimate.systemKwp.toFixed(1), unit: "kWp" as const, note: undefined },
    { label: results.generation, value: enIn.format(estimate.annualGenerationKwh), unit: "kWh" as const, note: undefined },
    {
      label: results.savings,
      value: formatInr(estimate.projection.cumulativeSavingsInr),
      unit: undefined,
      note: `Over ${estimate.projection.horizonYears} years`,
    },
    {
      label: results.payback,
      value: payback === null ? "—" : payback.toFixed(1),
      unit: payback === null ? undefined : ("years" as const),
      note: estimate.subsidyInr > 0 ? "After the estimated subsidy" : undefined,
    },
  ];

  return (
    <div className={`p-[22px] md:p-6 ${className}`}>
      {/* Not a <form>: nothing is submitted here. The figures follow what is typed. */}
      <div className="grid gap-4 sm:grid-cols-2">
        <SelectField
          id="home-calc-segment"
          name="home-calc-segment"
          label={fields.segment.label}
          options={segmentOptions}
          value={segment}
          onChange={changeSegment}
        />

        <TextField
          id="home-calc-location"
          name="home-calc-location"
          label={fields.location.label}
          hint={fields.location.hint}
          optional
          type="text"
          inputMode="text"
          autoComplete="off"
          maxLength={48}
          placeholder="Bengaluru 560001"
          value={location}
          onChange={(event) => setLocation(event.target.value)}
        />

        <TextField
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
          id="home-calc-tariff"
          name="home-calc-tariff"
          label={fields.tariff.label}
          hint={fields.tariff.hint}
          optional
          type="text"
          inputMode="decimal"
          autoComplete="off"
          prefix="₹"
          maxLength={6}
          value={tariff}
          onChange={(event) => setTariff(decimalOnly(event.target.value))}
        />

        <TextField
          className="sm:col-span-2"
          id="home-calc-roof"
          name="home-calc-roof"
          label={fields.roof.label}
          hint={fields.roof.hint}
          optional
          type="text"
          inputMode="numeric"
          autoComplete="off"
          maxLength={7}
          value={roofArea}
          onChange={(event) => setRoofArea(digitsOnly(event.target.value, 7))}
        />

        {segment === "housing-society" && (
          <TextField
            className="sm:col-span-2"
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

      {/* Polite, so the figures are announced once the visitor stops typing rather than per keystroke. */}
      <div aria-live="polite" className="mt-3">
        <ul className="grid gap-2.5 sm:grid-cols-2 xl:grid-cols-4">
          {tiles.map((tile) => (
            <StatTile as="li" key={tile.label} label={tile.label} value={tile.value} unit={tile.unit} note={tile.note} estimated />
          ))}
        </ul>

        {estimate.flags.length > 0 && (
          <ul className="mt-4 grid gap-2">
            {estimate.flags.map((flag) => (
              <li key={flag} className="text-small text-ink-2">
                {flagNotes[flag]}
              </li>
            ))}
          </ul>
        )}
      </div>

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

      <p className="mt-4 text-small text-grey-600">{disclaimer}</p>
    </div>
  );
}

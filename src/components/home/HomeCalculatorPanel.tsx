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
 */

import { useMemo, useState, type ChangeEvent } from "react";
import { enIn, flagNotes, parseSegment } from "@/components/quote/copy";
import { FieldRow, fieldCell, fieldCellNoHelper } from "@/components/quote/FieldRow";
import { ChevronDownIcon, SelectField, StatTile, TextField } from "@/components/ui";
import { billBounds, buildEstimate } from "@/lib/solar/calc";
import { SEGMENTS, SEGMENT_LABELS, type Segment } from "@/lib/solar/constants";
import { formatInr } from "@/lib/solar/format";

/** The visitor may type a city, a PIN code or both; only a well-formed PIN reaches the engine. */
const PINCODE_RE = /(?:^|\D)([1-9][0-9]{5})(?!\d)/;

/**
 * PROPOSED CONTENT — REQUIRES CLIENT APPROVAL. Validation and empty-state microcopy: it describes
 * what the calculator does, and makes no claim about solar, tariffs or the business.
 */
const REQUIRED_MARK = "(required)";
const PINCODE_ERROR = "Enter a 6-digit PIN code, for example 560001.";
const PINCODE_PROMPT = "Enter your PIN code above to see your estimate — it decides which tariffs the figures use.";

const segmentOptions = SEGMENTS.map((value) => ({ value, label: SEGMENT_LABELS[value] }));

const digitsOnly = (value: string, max: number) => value.replace(/\D/g, "").slice(0, max);

const positive = (value: string): number | undefined => {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : undefined;
};

type FieldCopy = { label: string; hint?: string };

type Tile = { label: string; value: string; unit?: string; note?: string };

export type HomeCalculatorPanelProps = {
  fields: Record<"segment" | "location" | "bill" | "roof" | "houses", FieldCopy>;
  results: { title: string; size: string; generation: string; savings: string; payback: string };
  assumptionsLabel: string;
  disclaimer: string;
  className?: string;
};

export function HomeCalculatorPanel({ fields, results, assumptionsLabel, disclaimer, className = "" }: HomeCalculatorPanelProps) {
  const [segment, setSegment] = useState<Segment>("home");
  const [location, setLocation] = useState("");
  /** The error waits for the visitor to leave the field: an empty form is not a mistake yet. */
  const [locationTouched, setLocationTouched] = useState(false);
  const [bill, setBill] = useState(() => String(billBounds("home").default));
  const [roofArea, setRoofArea] = useState("");
  const [houses, setHouses] = useState("");

  const pincode = PINCODE_RE.exec(location)?.[1];

  const estimate = useMemo(
    () =>
      pincode === undefined
        ? null
        : buildEstimate({
            segment,
            pincode,
            monthlyBillInr: positive(bill),
            roofAreaSqft: positive(roofArea),
            houses: segment === "housing-society" ? positive(houses) : undefined,
          }),
    [segment, pincode, bill, roofArea, houses],
  );

  /** Bill ranges differ per segment, so the bill restarts at the new segment's typical value. */
  const changeSegment = (event: ChangeEvent<HTMLSelectElement>) => {
    const next = parseSegment(event.target.value);
    setSegment(next);
    setBill(String(billBounds(next).default));
  };

  const payback = estimate?.paybackYears ?? null;
  const tiles: Tile[] = estimate
    ? [
        { label: results.size, value: estimate.systemKwp.toFixed(1), unit: "kWp" },
        { label: results.generation, value: enIn.format(estimate.annualGenerationKwh), unit: "kWh" },
        {
          label: results.savings,
          value: formatInr(estimate.projection.cumulativeSavingsInr),
          note: `Over ${estimate.projection.horizonYears} years`,
        },
        {
          label: results.payback,
          value: payback === null ? "—" : payback.toFixed(1),
          unit: payback === null ? undefined : "years",
          note: estimate.subsidyInr > 0 ? "After the estimated subsidy" : undefined,
        },
      ]
    : // Placeholders, so the panel keeps its shape while it waits for a PIN code and nothing
      // reads as a figure: no value, and no "(estimated)" label on an empty tile.
      [results.size, results.generation, results.savings, results.payback].map((label) => ({ label, value: "—" }));

  return (
    <div className={`p-[22px] md:p-6 ${className}`}>
      {/* Not a <form>: nothing is submitted here. The figures follow what is typed. */}
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
            label={`${fields.location.label} ${REQUIRED_MARK}`}
            hint={fields.location.hint}
            required
            type="text"
            inputMode="text"
            autoComplete="postal-code"
            maxLength={48}
            placeholder="Bengaluru 560001"
            value={location}
            onChange={(event) => setLocation(event.target.value)}
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

      {/* Polite, so the figures are announced once the visitor stops typing rather than per keystroke. */}
      <div aria-live="polite" className="mt-3">
        <ul className="grid gap-2.5 sm:grid-cols-2 xl:grid-cols-4">
          {tiles.map((tile) => (
            <StatTile
              as="li"
              key={tile.label}
              label={tile.label}
              value={tile.value}
              unit={tile.unit}
              note={tile.note}
              estimated={estimate !== null}
            />
          ))}
        </ul>

        {estimate === null ? (
          <p className="mt-4 text-small text-ink-2">{PINCODE_PROMPT}</p>
        ) : (
          estimate.flags.length > 0 && (
            <ul className="mt-4 grid gap-2">
              {estimate.flags.map((flag) => (
                <li key={flag} className="text-small text-ink-2">
                  {flagNotes[flag]}
                </li>
              ))}
            </ul>
          )
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

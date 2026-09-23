"use client";

/**
 * Live figures for step 1. Rendered inside the Deep Teal panel, so every primitive below picks
 * up its dark-surface colours from the panel's data-surface="dark".
 *
 * Every tile is marked `estimated` (brand PDF p.31): these are modelled numbers, never measured
 * ones, and the assumptions they rest on are one disclosure away.
 *
 * The figures do not wait for a PIN code. It changes none of them — see EstimateProvider — so
 * the bill alone produces a complete estimate, and the tiles carry a note saying which tariffs
 * were assumed until a PIN narrows it.
 *
 * The engine hands this component keys, not sentences: a flag id, and an assumption's key with
 * its figures (src/lib/solar/calc.ts). The words for them arrive as props, so the same estimate
 * renders in either language and no English string reaches a Kannada page's payload.
 */

import { TickerNumber } from "@/components/motion/TickerNumber";
import type { ReactNode } from "react";
import { ChevronDownIcon, StatTile } from "@/components/ui";
import type { QuotePage } from "@/content/quote";
import { describeAssumptions } from "@/lib/solar/assumptions";
import type { EstimateFlag } from "@/lib/solar/calc";
import { formatInr } from "@/lib/solar/format";
import { enIn } from "./copy";
import { useEstimate } from "./EstimateProvider";

interface Tile {
  /** Stable across locales, so React keeps the same TickerNumber when the copy changes. */
  id: string;
  label: string;
  value: ReactNode;
  unit?: string;
  note?: string;
}

export interface EstimateResultsCopy {
  results: QuotePage["results"];
  assumptions: QuotePage["assumptions"];
  citations: QuotePage["citations"];
  flags: Readonly<Record<EstimateFlag, string>>;
  units: { kwp: string; kwh: string; years: string };
}

/**
 * Figures travel to their new value rather than cutting to it, so that moving a control reads
 * as the same number changing. `key` is deliberately absent from the tiles: React must keep the
 * same TickerNumber instance across an estimate change, or the spring restarts from the new
 * value and nothing moves.
 */
const ticker = (value: number, format: (n: number) => string) => (
  <TickerNumber value={value} format={format} />
);

export function EstimateResults({ copy }: { copy: EstimateResultsCopy }) {
  const { estimate } = useEstimate();
  const { results } = copy;

  const waiting: { id: string; label: string }[] = [
    { id: "savings", label: results.savingsLabel },
    { id: "payback", label: results.paybackLabel },
    { id: "size", label: results.sizeLabel },
    { id: "generation", label: results.generationLabel },
  ];

  let tiles: Tile[] = waiting.map((tile) => ({ ...tile, value: "—" }));
  if (estimate) {
    tiles = [
      {
        id: "savings",
        label: results.savingsLabel,
        value: ticker(estimate.annualSavingsInr, (n) => formatInr(Math.round(n))),
        note: results.savingsNote,
      },
      {
        id: "payback",
        label: results.paybackLabel,
        // Payback can be genuinely unavailable, and an em dash is not a number to count to.
        value: estimate.paybackYears === null ? "—" : ticker(estimate.paybackYears, (n) => n.toFixed(1)),
        unit: estimate.paybackYears === null ? undefined : copy.units.years,
      },
      {
        id: "size",
        label: results.sizeLabel,
        value: ticker(estimate.systemKwp, (n) => n.toFixed(1)),
        unit: copy.units.kwp,
      },
      {
        id: "generation",
        label: results.generationLabel,
        value: ticker(estimate.annualGenerationKwh, (n) => enIn.format(Math.round(n))),
        unit: copy.units.kwh,
      },
    ];
    if (estimate.subsidyInr > 0) {
      tiles.push({
        id: "subsidy",
        label: results.subsidyLabel,
        value: ticker(estimate.subsidyInr, (n) => formatInr(Math.round(n))),
        note: estimate.flags.includes("subsidy-house-count-unknown") ? results.subsidyNote : undefined,
      });
    }
    // Payback already leads the block above; cost closes it.
    tiles.push({
      id: "cost",
      label: estimate.subsidyInr > 0 ? results.netCostLabel : results.indicativeCostLabel,
      value: ticker(estimate.netCostInr, (n) => formatInr(Math.round(n))),
    });
  }

  return (
    <div className="mt-8">
      {/* The word "estimate" does the labelling here, and the dashed rule under each figure is
          the brand's own mark for a modelled number (brand PDF p.31). "(estimated)" on each of
          six tiles as well — under a heading that already says estimate and above a line that
          says it again — read as doubt about our own engine rather than as candour. The
          substance is untouched: the assumptions stay one click away and the disclaimer stays
          below. */}
      <h2 className="font-label text-label text-on-dark-muted uppercase">{results.heading}</h2>

      <div aria-live="polite" className="mt-3">
        <ul className="grid grid-cols-2 gap-3">
          {tiles.map((tile) => (
            <StatTile
              as="li"
              key={tile.id}
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
              <li key={flag} className="text-small text-white/80">
                {copy.flags[flag]}
              </li>
            ))}
          </ul>
        )}
      </div>

      {estimate !== null && (
        <details className="group mt-6 border-t border-white/15 pt-4">
          <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-3 text-ui font-medium text-white [&::-webkit-details-marker]:hidden">
            <span>{results.assumptionsLabel}</span>
            <ChevronDownIcon className="size-4 shrink-0 transition-transform duration-200 ease-controlled group-open:rotate-180" />
          </summary>
          <dl className="mt-4 grid gap-4">
            {/* No figure on this page is projected, so the projection assumption is left out here. */}
            {describeAssumptions(
              estimate.assumptions.filter((assumption) => assumption.key !== "projection"),
              copy,
            ).map((assumption) => (
              <div key={assumption.key}>
                <dt className="font-label text-label text-on-dark-muted uppercase">{assumption.label}</dt>
                <dd className="mt-1 text-small text-white/90">{assumption.value}</dd>
                <dd className="mt-1 text-small text-on-dark-muted">{assumption.citation}</dd>
              </div>
            ))}
          </dl>
        </details>
      )}

      <p className="mt-6 text-small text-white/80">{results.disclaimer}</p>
    </div>
  );
}

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
 */

import { TickerNumber } from "@/components/motion/TickerNumber";
import type { ReactNode } from "react";
import { ChevronDownIcon, StatTile } from "@/components/ui";
import { formatInr } from "@/lib/solar/format";
import { enIn, estimateDisclaimer, flagNotes } from "./copy";
import { useEstimate } from "./EstimateProvider";

interface Tile {
  label: string;
  value: ReactNode;
  unit?: string;
  note?: string;
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

const waitingTiles: Tile[] = ["Annual savings", "Payback", "System size", "Annual generation"].map((label) => ({
  label,
  value: "—",
}));

export function EstimateResults() {
  const { estimate } = useEstimate();

  let tiles: Tile[] = waitingTiles;
  if (estimate) {
    tiles = [
      {
        label: "Annual savings",
        value: ticker(estimate.annualSavingsInr, (n) => formatInr(Math.round(n))),
        note: "Year one",
      },
      {
        label: "Payback",
        // Payback can be genuinely unavailable, and an em dash is not a number to count to.
        value: estimate.paybackYears === null ? "—" : ticker(estimate.paybackYears, (n) => n.toFixed(1)),
        unit: estimate.paybackYears === null ? undefined : "years",
      },
      { label: "System size", value: ticker(estimate.systemKwp, (n) => n.toFixed(1)), unit: "kWp" },
      {
        label: "Annual generation",
        value: ticker(estimate.annualGenerationKwh, (n) => enIn.format(Math.round(n))),
        unit: "kWh",
      },
    ];
    if (estimate.subsidyInr > 0) {
      tiles.push({
        label: "PM Surya Ghar subsidy",
        value: ticker(estimate.subsidyInr, (n) => formatInr(Math.round(n))),
        note: estimate.flags.includes("subsidy-house-count-unknown") ? "Upper limit" : undefined,
      });
    }
    // Payback already leads the block above; cost closes it.
    tiles.push({
      label: estimate.subsidyInr > 0 ? "Net cost after subsidy" : "Indicative cost",
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
      <h2 className="font-label text-label text-on-dark-muted uppercase">Your estimate</h2>

      <div aria-live="polite" className="mt-3">
        <ul className="grid grid-cols-2 gap-3">
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
              <li key={flag} className="text-small text-white/80">
                {flagNotes[flag]}
              </li>
            ))}
          </ul>
        )}
      </div>

      {estimate !== null && (
        <details className="group mt-6 border-t border-white/15 pt-4">
          <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-3 text-ui font-medium text-white [&::-webkit-details-marker]:hidden">
            <span>Assumptions</span>
            <ChevronDownIcon className="size-4 shrink-0 transition-transform duration-200 ease-controlled group-open:rotate-180" />
          </summary>
          <dl className="mt-4 grid gap-4">
            {/* No figure on this page is projected, so the projection assumption is left out here. */}
            {estimate.assumptions
              .filter((assumption) => assumption.label !== "Projection")
              .map((assumption) => (
                <div key={assumption.label}>
                  <dt className="font-label text-label text-on-dark-muted uppercase">{assumption.label}</dt>
                  <dd className="mt-1 text-small text-white/90">{assumption.value}</dd>
                  <dd className="mt-1 text-small text-on-dark-muted">{assumption.source}</dd>
                </div>
              ))}
          </dl>
        </details>
      )}

      <p className="mt-6 text-small text-white/80">{estimateDisclaimer}</p>
    </div>
  );
}

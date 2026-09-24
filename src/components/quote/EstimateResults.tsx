"use client";

import { TickerNumber } from "@/components/motion/TickerNumber";
import type { ReactNode } from "react";
import { ChevronDownIcon, StatTile } from "@/components/ui";
import { formatInr } from "@/lib/solar/format";
import { ROOF_SQFT_PER_KWP } from "@/lib/solar/constants";
import { estimateDisclaimer, flagNotes } from "./copy";
import { useEstimate } from "./EstimateProvider";

interface Tile {
  label: string;
  value: ReactNode;
  unit?: string;
  note?: string;
}

const ticker = (value: number, format: (n: number) => string) => (
  <TickerNumber value={value} format={format} />
);

const waitingTiles: Tile[] = [
  { label: "Monthly savings", value: formatInr(0) },
  { label: "Payback", value: "0", unit: "years" },
  { label: "Indicative cost", value: formatInr(0) },
];

export function EstimateResults() {
  const { estimate } = useEstimate();

  let tiles: Tile[] = waitingTiles;
  if (estimate) {
    tiles = [
      {
        label: "Monthly savings",
        value: ticker(estimate.monthlySavingsInr, (n) => formatInr(Math.round(n))),
      },
      {
        label: "Payback",
        value: estimate.paybackYears === null ? "—" : ticker(estimate.paybackYears, (n) => n.toFixed(1)),
        unit: estimate.paybackYears === null ? undefined : "years",
      },
      estimate.subsidyInr > 0
        ? {
            label: "PM Surya Ghar subsidy",
            value: ticker(estimate.subsidyInr, (n) => formatInr(Math.round(n))),
            note: estimate.flags.includes("subsidy-house-count-unknown") ? "Upper limit" : undefined,
          }
        : {
            label: "Indicative cost",
            value: ticker(estimate.netCostInr, (n) => formatInr(Math.round(n))),
          },
    ];
  }

  return (
    <div className="mt-8">
      <h2 className="font-mono text-label text-on-dark-muted uppercase">Your estimate</h2>

      <div aria-live="polite" className="mt-3">
        {/* Promoted system size callout */}
        {estimate && (
          <div className="mb-3 rounded-md border border-white/15 bg-teal-950 p-4">
            <span className="block font-mono text-label text-green-400 uppercase">Recommended system</span>
            <span className="mt-2 flex items-baseline gap-1.5">
              <span className="font-mono text-data-xl font-medium tabular-nums text-white">
                <TickerNumber value={estimate.systemKwp} format={(n) => n.toFixed(1)} />
              </span>
              <span className="text-data text-green-400">kWp</span>
            </span>
            <span className="mt-1 block text-small text-white/60">
              ~{Math.round(estimate.systemKwp * ROOF_SQFT_PER_KWP.value)} sq ft of roof
            </span>
          </div>
        )}

        <ul className="grid grid-cols-1 gap-3 @sm:grid-cols-3">
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
            {estimate.assumptions
              .filter((assumption) => assumption.label !== "Projection")
              .map((assumption) => (
                <div key={assumption.label}>
                  <dt className="font-mono text-label text-on-dark-muted uppercase">{assumption.label}</dt>
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

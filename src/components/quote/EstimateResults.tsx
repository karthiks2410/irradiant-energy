"use client";

/**
 * Live figures for step 1. Rendered inside the Deep Teal panel, so every primitive below picks
 * up its dark-surface colours from the panel's data-surface="dark".
 *
 * Every tile is marked `estimated` (brand PDF p.31): these are modelled numbers, never measured
 * ones, and the assumptions they rest on are one disclosure away.
 */

import { ChevronDownIcon, StatTile } from "@/components/ui";
import { formatInr } from "@/lib/solar/format";
import { enIn, estimateDisclaimer, flagNotes } from "./copy";
import { useEstimate } from "./EstimateProvider";

interface Tile {
  label: string;
  value: string;
  unit?: string;
  note?: string;
}

export function EstimateResults() {
  const { estimate } = useEstimate();

  const tiles: Tile[] = [
    { label: "System size", value: estimate.systemKwp.toFixed(1), unit: "kWp" },
    { label: "Annual generation", value: enIn.format(estimate.annualGenerationKwh), unit: "kWh" },
    { label: "Annual savings", value: formatInr(estimate.annualSavingsInr), note: "Year one" },
  ];
  if (estimate.subsidyInr > 0) {
    tiles.push({
      label: "PM Surya Ghar subsidy",
      value: formatInr(estimate.subsidyInr),
      note: estimate.flags.includes("subsidy-house-count-unknown") ? "Upper limit" : undefined,
    });
  }
  tiles.push(
    { label: estimate.subsidyInr > 0 ? "Net cost after subsidy" : "Indicative cost", value: formatInr(estimate.netCostInr) },
    {
      label: "Payback",
      value: estimate.paybackYears === null ? "—" : estimate.paybackYears.toFixed(1),
      unit: estimate.paybackYears === null ? undefined : "years",
    },
  );

  return (
    <div className="mt-8">
      <h2 className="font-mono text-label text-on-dark-muted uppercase">
        Your estimate
      </h2>

      <div aria-live="polite" className="mt-3">
        <ul className="grid gap-3 sm:grid-cols-2">
          {tiles.map((tile) => (
            <StatTile
              as="li"
              key={tile.label}
              label={tile.label}
              value={tile.value}
              unit={tile.unit}
              note={tile.note}
              estimated
            />
          ))}
        </ul>

        {estimate.flags.length > 0 && (
          <ul className="mt-4 grid gap-2">
            {estimate.flags.map((flag) => (
              <li key={flag} className="text-small text-white/80">
                {flagNotes[flag]}
              </li>
            ))}
          </ul>
        )}
      </div>

      <details className="group mt-6 border-t border-white/15 pt-4">
        <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-3 text-ui font-medium text-white [&::-webkit-details-marker]:hidden">
          <span>Assumptions</span>
          <ChevronDownIcon className="size-4 shrink-0 transition-transform duration-200 ease-controlled group-open:rotate-180" />
        </summary>
        <dl className="mt-4 grid gap-4">
          {estimate.assumptions.map((assumption) => (
            <div key={assumption.label}>
              <dt className="font-mono text-label text-on-dark-muted uppercase">{assumption.label}</dt>
              <dd className="mt-1 text-small text-white/90">{assumption.value}</dd>
              <dd className="mt-1 text-small text-on-dark-muted">{assumption.source}</dd>
            </div>
          ))}
        </dl>
      </details>

      <p className="mt-6 text-small text-white/80">{estimateDisclaimer}</p>
    </div>
  );
}

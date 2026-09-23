/**
 * Turning the engine's assumption keys back into sentences.
 *
 * `buildEstimate` returns `{ key, params, citation }` and no prose (see `Assumption` in calc.ts).
 * This is the other half: hand it the templates for a locale and it gives back the three lines
 * the panel prints. It takes the copy as an argument rather than importing it, because both
 * calculators are client islands and a client module may not reach a content module
 * (scripts/check-client-content.ts) — the strings arrive as props from the Server Component.
 *
 * Client-safe: `fill` and plain types, nothing else.
 */

import { fill } from "@/i18n/format";
import type { Assumption, AssumptionKey, CitationKey } from "./calc";

/** The slice of `content.quote` this needs. Typed here so an island can take it as a prop. */
export interface AssumptionCopy {
  readonly assumptions: Readonly<Record<AssumptionKey, { readonly label: string; readonly value: string }>>;
  readonly citations: Readonly<Record<CitationKey, string>>;
}

export interface DescribedAssumption {
  /** Stable across locales, so React can key on it. */
  key: AssumptionKey;
  label: string;
  value: string;
  /** The provenance line printed under the value. */
  citation: string;
}

export function describeAssumption(assumption: Assumption, copy: AssumptionCopy): DescribedAssumption {
  const template = copy.assumptions[assumption.key];
  return {
    key: assumption.key,
    label: template.label,
    value: fill(template.value, assumption.params),
    citation: copy.citations[assumption.citation],
  };
}

export const describeAssumptions = (assumptions: readonly Assumption[], copy: AssumptionCopy): DescribedAssumption[] =>
  assumptions.map((assumption) => describeAssumption(assumption, copy));

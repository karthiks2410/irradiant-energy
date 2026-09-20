import { Reveal, RevealItem } from "@/components/motion/Reveal";
import type { Step } from "@/content/types";

/**
 * Energy Path (brand PDF p.54; docs/design-system.md §6.3) — the single implementation.
 *
 * There used to be two: one under `pages/` for About and one under `solutions/` for the audience
 * pages. They drew the same device with different node markup, different label typography and
 * only one of them staggered, so the same brand element looked subtly different depending on
 * which page you were on (owner review round 2, point 13). `solutions/EnergyPath` now re-exports
 * this file, so both routes draw one device.
 *
 * Geometry is the PDF's: a 2px Radiant Green line, 13px nodes ringed in the surface colour so the
 * halo reads against the line, Plex Mono stage numerals, and **exactly one** Solar Yellow node —
 * the step where the decision or the system changes hands — which keeps yellow inside its 3–8%
 * budget. Vertical below `lg`, horizontal above.
 */

// Tailwind cannot extract a computed `lg:grid-cols-${n}`, so the widths are listed.
const columns: Record<number, string> = {
  2: "lg:grid-cols-2",
  3: "lg:grid-cols-3",
  4: "lg:grid-cols-4",
  5: "lg:grid-cols-5",
  6: "lg:grid-cols-6",
};

/** The node halo has to match the surface the path is drawn on (PDF p.54). */
const halos = {
  canvas: "ring-canvas",
  white: "ring-white",
  dark: "ring-teal-900",
} as const;

type PathStep = Pick<Step, "number" | "title" | "description">;

type EnergyPathProps = {
  steps: readonly PathStep[];
  /**
   * Index of the single Solar Yellow node. The brand allows one per path, and only at the key
   * decision or handover; the default of -1 draws an all-green path.
   */
  highlightIndex?: number;
  halo?: keyof typeof halos;
  /**
   * `stage` — one- or two-word stage names (AUDIT · DESIGN · INSTALL), set in Plex Mono uppercase
   * exactly as the PDF draws them. `sentence` — steps written as sentences, which uppercase mono
   * would make unreadable, so they take the display face at the same size.
   */
  variant?: "stage" | "sentence";
  className?: string;
};

export function EnergyPath({
  steps,
  highlightIndex = -1,
  halo = "canvas",
  variant = "sentence",
  className = "",
}: EnergyPathProps) {
  const lastIndex = steps.length - 1;
  const highlight = highlightIndex < 0 ? -1 : Math.min(highlightIndex, lastIndex);
  // z-10 keeps the surface-coloured halo painted over the line, as the brand device draws it.
  const node = (index: number) =>
    `relative z-10 size-[13px] shrink-0 rounded-full ring-2 ${halos[halo]} ${
      index === highlight ? "bg-yellow-400" : "bg-green-500"
    }`;

  return (
    <Reveal
      as="ol"
      stagger={0.08}
      className={`grid gap-x-(--grid-gutter) gap-y-10 ${columns[steps.length] ?? columns[4]} ${className}`}
    >
      {steps.map((step, index) => {
        const isLast = index === lastIndex;
        return (
          <RevealItem as="li" key={step.number} className="grid grid-cols-[13px_1fr] gap-x-4 lg:block">
            {/* Vertical connector, phones and tablets. */}
            <span aria-hidden="true" className="flex flex-col items-center lg:hidden">
              <span className={`mt-[3px] ${node(index)}`} />
              {!isLast && <span className="-mb-10 w-0.5 flex-1 bg-green-500" />}
            </span>

            <div>
              {/* Horizontal connector, from lg: it runs across the column gap to the next node. */}
              <span aria-hidden="true" className="mb-6 hidden h-[13px] items-center lg:flex">
                <span className={node(index)} />
                {!isLast && <span className="mr-[calc(var(--grid-gutter)*-1)] h-0.5 flex-1 bg-green-500" />}
              </span>
              <span
                aria-hidden="true"
                className="block font-mono text-label font-medium text-green-700 uppercase in-data-[surface=dark]:text-green-300"
              >
                {step.number}
              </span>
              <h3
                className={
                  variant === "stage"
                    ? "mt-2 font-mono text-h4 font-medium tracking-[0.08em] uppercase"
                    : "mt-2 font-display text-h4 font-semibold"
                }
              >
                {step.title}
              </h3>
              <p className="mt-3 text-body text-ink-2 in-data-[surface=dark]:text-white/80">{step.description}</p>
            </div>
          </RevealItem>
        );
      })}
    </Reveal>
  );
}

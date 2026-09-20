import { Reveal, RevealItem } from "@/components/motion/Reveal";
import type { Step } from "@/content/types";

/**
 * Energy Path (brand PDF p.54; report §5.7): a 2 px Radiant Green line with 13 px nodes, each
 * ringed in the surface colour, and Plex Mono stage numerals. Horizontal from `lg`, vertical
 * below. Exactly one node is Solar Yellow — the step where the decision or the system changes
 * hands — which keeps the yellow inside its 3–8 % budget.
 */

const columns: Record<number, string> = {
  3: "lg:grid-cols-3",
  4: "lg:grid-cols-4",
  5: "lg:grid-cols-5",
  6: "lg:grid-cols-6",
};

const halos = { white: "ring-white", canvas: "ring-canvas" } as const;

type EnergyPathProps = {
  steps: readonly Step[];
  /** Index of the single Solar Yellow node. */
  highlightIndex: number;
  /** Surface the path sits on, so the node halo matches it. */
  halo?: keyof typeof halos;
  className?: string;
};

export function EnergyPath({ steps, highlightIndex, halo = "white", className = "" }: EnergyPathProps) {
  const lastIndex = steps.length - 1;
  const highlight = Math.min(Math.max(highlightIndex, 0), lastIndex);
  const node = (index: number) =>
    // z-10 keeps the surface-coloured halo painted over the line, as the brand device draws it.
    `relative z-10 size-[13px] shrink-0 rounded-full ring-2 ${halos[halo]} ${index === highlight ? "bg-yellow-400" : "bg-green-500"}`;

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
            <span aria-hidden="true" className="flex flex-col items-center lg:hidden">
              <span className={`mt-[3px] ${node(index)}`} />
              {!isLast && <span className="-mb-10 w-0.5 flex-1 bg-green-500" />}
            </span>

            <div>
              <span aria-hidden="true" className="mb-6 hidden h-[13px] items-center lg:flex">
                <span className={node(index)} />
                {!isLast && (
                  <span className="h-0.5 flex-1 bg-green-500 mr-[calc(var(--grid-gutter)*-1)]" />
                )}
              </span>
              <span aria-hidden="true" className="block font-mono text-label font-medium text-green-700 uppercase">
                {step.number}
              </span>
              <h3 className="mt-2 font-display text-h4 font-semibold">{step.title}</h3>
              <p className="mt-3 text-small text-ink-2">{step.description}</p>
            </div>
          </RevealItem>
        );
      })}
    </Reveal>
  );
}

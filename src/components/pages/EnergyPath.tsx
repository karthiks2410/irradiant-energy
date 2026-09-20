import type { Step } from "@/content/types";

type PathStep = Pick<Step, "number" | "title" | "description">;

/** Node halo colour: it must match the surface the path is drawn on (brand PDF p.54). */
type Halo = "canvas" | "white" | "dark";

const halos: Record<Halo, string> = {
  canvas: "ring-canvas",
  white: "ring-white",
  dark: "ring-teal-900",
};

// A dynamic `lg:grid-cols-${n}` cannot be extracted by Tailwind, so the widths are listed.
const columns: Record<number, string> = {
  2: "lg:grid-cols-2",
  3: "lg:grid-cols-3",
  4: "lg:grid-cols-4",
  5: "lg:grid-cols-5",
};

type EnergyPathProps = {
  steps: readonly PathStep[];
  /**
   * Index of the single Solar Yellow node. The brand allows exactly one per path and only at the
   * key decision or handover; pass -1 (the default) for an all-green path.
   */
  highlightIndex?: number;
  halo?: Halo;
  className?: string;
};

/**
 * Energy Path (brand PDF p.54): a 2px Radiant Green line with 13px nodes haloed against the
 * surface, mono stage labels, and at most one Solar Yellow node. Vertical on phones, horizontal
 * from lg — the node stays at the block's top-left in both, only the connector turns.
 */
export function EnergyPath({ steps, highlightIndex = -1, halo = "canvas", className = "" }: EnergyPathProps) {
  const ring = halos[halo];
  return (
    <ol className={`grid gap-y-10 gap-x-(--grid-gutter) ${columns[steps.length] ?? columns[4]} ${className}`}>
      {steps.map((step, index) => {
        const last = index === steps.length - 1;
        return (
          <li key={step.number} className="relative pl-9 lg:pt-9 lg:pl-0">
            {!last && (
              <>
                {/* Vertical connector down to the next node; the gap below the block is gap-y-10. */}
                <span aria-hidden="true" className="absolute top-[13px] -bottom-10 left-[5.5px] w-0.5 bg-green-500 lg:hidden" />
                {/* Horizontal connector across the column gap. */}
                <span
                  aria-hidden="true"
                  className="absolute top-[5.5px] left-[13px] right-[calc(var(--grid-gutter)*-1)] hidden h-0.5 bg-green-500 lg:block"
                />
              </>
            )}
            <span
              aria-hidden="true"
              className={`absolute top-0 left-0 size-[13px] rounded-full ring-2 ${ring} ${
                index === highlightIndex ? "bg-yellow-400" : "bg-green-500"
              }`}
            />
            <p className="font-mono text-label font-medium text-grey-600 uppercase in-data-[surface=dark]:text-on-dark-muted">
              {step.number}
            </p>
            <h3 className="mt-3 font-mono text-h4 font-medium tracking-[0.08em] uppercase">{step.title}</h3>
            <p className="mt-2 text-body text-ink-2 in-data-[surface=dark]:text-white/80">{step.description}</p>
          </li>
        );
      })}
    </ol>
  );
}

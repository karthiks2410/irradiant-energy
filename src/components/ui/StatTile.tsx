import type { ReactNode } from "react";

type StatTileProps = {
  /**
   * The figure. A pre-formatted string ("5.7", "₹8,63,718"), or a node where it has to move —
   * <TickerNumber> for a live calculator result. Anything passed here inherits the tile's
   * `tabular-nums`, so a changing figure does not reflow the line.
   */
  value: ReactNode;
  unit?: string;
  label: string;
  /** Estimated figures look different from measured ones (brand PDF p.31): muted and dashed. */
  estimated?: boolean;
  /**
   * Whether the tile also spells out "(estimated)" beside its label. Turn it off where every
   * tile in the group is estimated and the group says so once — four identical parentheses
   * around one answer read as a lack of confidence in the figures rather than as candour.
   */
  labelEstimated?: boolean;
  /** Scope or period, e.g. "per month". */
  note?: string;
  size?: "md" | "xl";
  /** Tile fill: canvas inside white panels (default), white directly on the canvas. */
  surface?: "canvas" | "white";
  as?: "div" | "li";
  className?: string;
};

const muted = "text-grey-600 in-data-[surface=dark]:text-on-dark-muted";

export function StatTile({
  value,
  unit,
  label,
  estimated = false,
  labelEstimated = true,
  note,
  size = "md",
  surface = "canvas",
  as: Tag = "div",
  className = "",
}: StatTileProps) {
  return (
    <Tag
      className={`rounded-md border border-mist p-4 in-data-[surface=dark]:border-white/15 in-data-[surface=dark]:bg-teal-950 ${
        surface === "white" ? "bg-white" : "bg-canvas"
      } ${className}`}
    >
      <span className={`block text-small ${muted}`}>
        {label}
        {estimated && labelEstimated && <span className="font-mono text-label uppercase"> (estimated)</span>}
      </span>
      <span
        className={`mt-2 block font-mono font-medium tabular-nums ${size === "xl" ? "text-data-xl" : "text-data"} ${
          estimated ? "text-ink-2 in-data-[surface=dark]:text-white/80" : "text-carbon in-data-[surface=dark]:text-white"
        }`}
      >
        <span className={estimated ? "border-b border-dashed border-grey-600 in-data-[surface=dark]:border-on-dark-muted" : ""}>
          {value}
        </span>
        {unit && <span className={`ml-1 ${size === "xl" ? "text-data" : "text-small"} ${muted}`}>{unit}</span>}
      </span>
      {note && <span className={`mt-1 block text-small ${muted}`}>{note}</span>}
    </Tag>
  );
}

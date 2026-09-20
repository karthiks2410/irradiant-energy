/**
 * A row of two form fields whose inputs sit on one baseline, whatever their helper text says.
 *
 * The defect (owner review round 2, point 8): <FieldShell> stacks label → helper → control →
 * error in its own grid, so a field whose helper wraps to two lines pushes its input lower than
 * the single-line field beside it, and a row of inputs reads ragged. Trimming the copy to fit
 * would only hide it until the next wrap, so the fix is structural.
 *
 * At >=sm the row itself owns four tracks — label, helper, control, error — and each field
 * subgrids into them, so every label, helper, input and error message in the row shares a track:
 *
 *   row 1  label            label
 *   row 2  helper (tallest helper in the row sets the height)
 *   row 3  input            input      <- always level
 *   row 4  error (zero-height until one of the fields actually fails)
 *
 * Because the error lives in its own shared track, a failing field grows the row rather than
 * shoving its own input up past its neighbour's.
 *
 * Below sm the fields stack one per line, there is nothing to align, and each field keeps
 * FieldShell's own spacing.
 */

import type { ReactNode } from "react";

const gaps = {
  /** The compact panel form on the home page. */
  compact: "gap-4 sm:gap-x-4 sm:gap-y-2",
  /** The roomier page-level forms on /get-quote. */
  roomy: "gap-6 sm:gap-x-6 sm:gap-y-2",
} as const;

export type FieldRowGap = keyof typeof gaps;

/**
 * Hand this to every field inside a <FieldRow> as its `className`. The vertical rhythm inside the
 * field then comes from the row's `gap-y` (8px, the same as FieldShell's own `gap-2`).
 */
export const fieldCell = "sm:row-span-4 sm:grid-rows-subgrid";

/**
 * For a field with no helper text. An empty ::before is placed on the helper track, which keeps
 * the track occupied so the field's own control is auto-placed onto the control track and lands
 * level with the helped field beside it. Without it the control would slide up into the helper
 * track — which is exactly the misalignment this row exists to remove.
 */
export const fieldCellNoHelper = `${fieldCell} sm:before:row-start-2 sm:before:content-['']`;

export function FieldRow({
  gap = "compact",
  className = "",
  children,
}: {
  gap?: FieldRowGap;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={`grid ${gaps[gap]} sm:grid-cols-2 sm:grid-rows-[auto_auto_auto_auto] ${className}`}>{children}</div>
  );
}

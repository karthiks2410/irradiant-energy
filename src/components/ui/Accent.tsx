import type { AccentSplit } from "./accent-split";
import type { ReactNode } from "react";

/**
 * Green trailing phrase in display/H2 headlines (the brand's two-tone headline).
 * Display sizes only: green-600 on canvas/white and green-500 on teal pass large-text AA, nothing smaller does.
 */
export function Accent({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <span className={`text-green-600 in-data-[surface=dark]:text-green-500 ${className}`}>{children}</span>;
}

/**
 * A headline split around its accent run.
 *
 * The space before the accent is rendered as its own child, exactly as `{head} <Accent>…`
 * does in the position-derived branch the two headline components still fall back to. React
 * writes a `<!-- -->` separator between two adjacent text children, so keeping the same child
 * sequence is what lets English switch to an explicit accent without a byte of its markup
 * moving (`accent-split.test.ts` checks that split against the old rule, headline by headline).
 */
export function AccentRun({ split }: { split: AccentSplit }) {
  const spaced = split.before.endsWith(" ");
  const head = spaced ? split.before.slice(0, -1) : split.before;
  return (
    <>
      {head || null}
      {spaced ? " " : null}
      <Accent>{split.accent}</Accent>
      {split.after || null}
    </>
  );
}

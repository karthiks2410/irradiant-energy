import type { ReactNode } from "react";
import { Eyebrow, type EyebrowTone } from "./Eyebrow";

type HeadingLevel = 1 | 2 | 3;

const headingClass: Record<HeadingLevel, string> = {
  1: "font-display text-display font-extrabold",
  2: "font-display text-h2 font-bold",
  3: "font-display text-h3 font-bold",
};

const leadClass = "text-lead text-ink-2 in-data-[surface=dark]:text-white/80";

type SectionHeadingProps = {
  eyebrow?: string;
  eyebrowTone?: EyebrowTone;
  /** ReactNode so an <Accent> phrase fits. Sentence case. */
  title: ReactNode;
  lead?: ReactNode;
  /**
   * split: title 7 / lead 5 on the 12-column grid from lg, stacked below (prototype S5; use in at most a third
   * of a page's sections). stacked: left-aligned. center: closing CTA bands only.
   */
  align?: "split" | "stacked" | "center";
  headingLevel?: HeadingLevel;
  /** Set on the heading element so the parent <Section aria-labelledby> can point at it. */
  id?: string;
  className?: string;
};

export function SectionHeading({
  eyebrow,
  eyebrowTone,
  title,
  lead,
  align = "split",
  headingLevel = 2,
  id,
  className = "",
}: SectionHeadingProps) {
  const Heading = `h${headingLevel}` as const;
  const heading = (
    <Heading id={id} className={headingClass[headingLevel]}>
      {title}
    </Heading>
  );

  if (align === "split") {
    return (
      <div className={`grid-page items-end gap-y-6 ${className}`}>
        <div className="col-span-4 md:col-span-8 lg:col-span-7">
          {eyebrow && (
            <Eyebrow tone={eyebrowTone} className="mb-4">
              {eyebrow}
            </Eyebrow>
          )}
          {heading}
        </div>
        {lead && <p className={`col-span-4 md:col-span-8 lg:col-span-5 lg:max-w-xl lg:pb-1 ${leadClass}`}>{lead}</p>}
      </div>
    );
  }

  const centered = align === "center";
  return (
    <div className={`${centered ? "mx-auto text-center" : ""} max-w-3xl ${className}`}>
      {eyebrow && (
        <Eyebrow tone={eyebrowTone} className={`mb-4 ${centered ? "justify-center" : ""}`}>
          {eyebrow}
        </Eyebrow>
      )}
      {heading}
      {lead && <p className={`mt-5 ${centered ? "mx-auto" : ""} max-w-2xl ${leadClass}`}>{lead}</p>}
    </div>
  );
}

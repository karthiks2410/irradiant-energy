import type { ReactNode } from "react";
import { Card, type CardTag } from "./Card";

type FeatureCardProps = {
  title: string;
  /** Body copy. */
  children: ReactNode;
  /** Monoline SVG, no container (brand PDF p.57). Sized to 32px. */
  icon?: ReactNode;
  /** Mono numeral such as "01" (prototype S8 proof cards). */
  numeral?: string;
  headingLevel?: 3 | 4;
  as?: CardTag;
  /**
   * Rise slightly off the page under the pointer (owner request, 2026-09-21).
   *
   * Deliberately not the site's interactive-card hover, which pairs its lift with a teal border
   * to say "this is a link". These cards go nowhere, so the border stays put and the cursor stays
   * an arrow: the card reads as raised, not as clickable. Tailwind's `hover:` only fires on
   * devices that can hover, so a tap on a phone does not leave a card stuck in the air. Under a
   * reduced-motion preference the shadow still appears but the card does not move.
   */
  lift?: boolean;
  className?: string;
};

const liftClass =
  "transition-[translate,box-shadow] duration-300 ease-controlled motion-safe:hover:-translate-y-1.5 hover:shadow-[0_18px_40px_-12px_rgb(2_52_43/0.22)] in-data-[surface=dark]:hover:shadow-[0_18px_40px_-12px_rgb(0_0_0/0.5)]";

/** Non-interactive proof/feature card: green top rule, numeral, icon, title, body. */
export function FeatureCard({
  title,
  children,
  icon,
  numeral,
  headingLevel = 3,
  as = "li",
  lift = false,
  className = "",
}: FeatureCardProps) {
  const Heading = `h${headingLevel}` as const;
  const hasTopRow = Boolean(numeral || icon);
  return (
    <Card as={as} className={`flex flex-col border-t-2 border-t-green-500 ${lift ? liftClass : ""} ${className}`}>
      {hasTopRow && (
        <div className="flex items-start justify-between gap-4">
          <span className="font-mono text-label font-medium text-green-700 uppercase in-data-[surface=dark]:text-green-300">{numeral}</span>
          {icon && (
            <span aria-hidden="true" className="shrink-0 text-teal-900 in-data-[surface=dark]:text-green-300 [&>svg]:size-8">
              {icon}
            </span>
          )}
        </div>
      )}
      <Heading className={`font-display text-h3 font-semibold ${hasTopRow ? "mt-5" : ""}`}>{title}</Heading>
      <div className="mt-2 text-body text-ink-2 in-data-[surface=dark]:text-white/80">{children}</div>
    </Card>
  );
}

import Link from "next/link";
import type { ReactNode } from "react";
import { Eyebrow } from "./Eyebrow";
import { ArrowRightIcon } from "./Icons";

export type CardTag = "div" | "li" | "article" | "section";
type CardPadding = "none" | "md" | "lg";

const paddings: Record<CardPadding, string> = { none: "", md: "p-6", lg: "p-6 md:p-8" };

/** Flat white card on canvas; deep-teal tile on dark surfaces. No shadow (report §6.10). */
export const cardSurface =
  "rounded-md border border-mist bg-white text-carbon in-data-[surface=dark]:border-white/15 in-data-[surface=dark]:bg-teal-950 in-data-[surface=dark]:text-white";

const interactive =
  "transition-[transform,border-color] duration-200 ease-controlled hover:-translate-y-0.5 hover:border-teal-900 in-data-[surface=dark]:hover:border-green-300";

type CardProps = {
  as?: CardTag;
  /** Hover lift + teal border. Only for cards that are (or contain) a link. */
  interactive?: boolean;
  padding?: CardPadding;
  id?: string;
  className?: string;
  children: ReactNode;
};

export function Card({ as: Tag = "div", interactive: isInteractive = false, padding = "md", id, className = "", children }: CardProps) {
  return (
    <Tag id={id} className={`${cardSurface} ${paddings[padding]} ${isInteractive ? interactive : ""} ${className}`}>
      {children}
    </Tag>
  );
}

type LinkCardProps = {
  href: string;
  /** Becomes the link's accessible name. */
  title: ReactNode;
  headingLevel?: 2 | 3 | 4;
  eyebrow?: string;
  /** Image slot, rendered edge to edge above the body (next/image with sizes; alt="" if it repeats the title). */
  media?: ReactNode;
  /** Visible action line, e.g. "Explore solar for your home". Decorative for AT: the title is the link. */
  cta?: string;
  as?: CardTag;
  className?: string;
  /** Short description. */
  children?: ReactNode;
};

/**
 * Whole-card link pattern: one tab stop, the title link's ::after covers the card, the focus ring is
 * drawn on the card (report §5.8 S10 fixes the prototype's cards that looked clickable but were not).
 */
export function LinkCard({ href, title, headingLevel = 3, eyebrow, media, cta, as, className = "", children }: LinkCardProps) {
  const Heading = `h${headingLevel}` as const;
  return (
    <Card
      as={as}
      interactive
      padding="none"
      className={`group relative flex flex-col has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-teal-900 in-data-[surface=dark]:has-focus-visible:outline-yellow-400 ${className}`}
    >
      {media && (
        <div className="overflow-hidden rounded-t-md [&_img]:transition-transform [&_img]:duration-500 [&_img]:ease-controlled group-hover:[&_img]:scale-103">
          {media}
        </div>
      )}
      <div className="flex flex-1 flex-col p-6">
        {eyebrow && (
          <Eyebrow as="span" rule={false} className="mb-3">
            {eyebrow}
          </Eyebrow>
        )}
        <Heading className="font-display text-h3 font-semibold">
          <Link href={href} className="after:absolute after:inset-0 after:rounded-md after:content-[''] focus-visible:outline-none">
            {title}
          </Link>
        </Heading>
        {children && <div className="mt-2 text-body text-ink-2 in-data-[surface=dark]:text-white/80">{children}</div>}
        {cta && (
          <span
            aria-hidden="true"
            className="mt-auto inline-flex items-center gap-2 pt-5 text-ui font-semibold text-green-700 in-data-[surface=dark]:text-green-300"
          >
            {cta}
            <ArrowRightIcon className="size-4 transition-transform duration-200 ease-controlled group-hover:translate-x-0.5" />
          </span>
        )}
      </div>
    </Card>
  );
}

type CardGridColumns = 1 | 2 | 3 | 4;

// Column gaps equal the page gutter, so 3-up = 4 columns each on the 12-column grid, 2-up on the 8-column grid.
const columnClasses: Record<CardGridColumns, string> = {
  1: "grid-cols-1",
  2: "grid-cols-1 md:grid-cols-2",
  3: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
  4: "grid-cols-2 lg:grid-cols-4",
};

type CardGridProps = {
  columns?: CardGridColumns;
  as?: "ul" | "ol" | "div";
  className?: string;
  children: ReactNode;
};

export function CardGrid({ columns = 3, as: Tag = "ul", className = "", children }: CardGridProps) {
  // Cards arrive one after another as the grid scrolls into view (components/motion/ScrollReveal.tsx).
  return (
    <Tag data-reveal-children="stagger" className={`grid gap-x-(--grid-gutter) gap-y-6 ${columnClasses[columns]} ${className}`}>
      {children}
    </Tag>
  );
}

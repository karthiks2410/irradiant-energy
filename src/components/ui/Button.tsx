import { Link } from "@/components/i18n/LocaleLink";
import type { ComponentProps, ReactNode } from "react";

/**
 * Pill CTA with a circular arrow node — the prototype's signature interaction
 * (report §5.8 S6), rebuilt on accessible brand pairings (report §6.4):
 * - primary: white label on green-700 (5.58:1)
 * - light:   carbon label on white, for dark/photo surfaces
 * - outline: teal-900 outline + label on light surfaces
 * - outline-light: white outline + label on dark surfaces
 *
 * The label span is `whitespace-nowrap` (layout-risks.md M4): a wrapped pill puts the circular
 * arrow beside the last line instead of the middle and turns `rounded-full` into a stadium around
 * two lines. The header CTA did that at 768 and 1280 on every route under Kannada-length copy.
 * The cost is that a label longer than the viewport would overflow rather than wrap, so Kannada
 * CTA copy carries a width budget (layout-risks.md §4 M4) and the e2e overflow check covers /kn.
 *
 * `className` is appended after the base classes, but Tailwind resolves conflicts by the order
 * rules appear in the stylesheet, not in the attribute — and `.inline-flex` is emitted after
 * `.hidden`. A display utility passed here therefore loses to the base `inline-flex`: put
 * `hidden`/`sm:block` on a wrapper element instead (see SiteHeader.tsx).
 */
type Variant = "primary" | "light" | "outline" | "outline-light";

const base =
  "group inline-flex min-h-11 items-center gap-3 rounded-full font-sans text-ui font-semibold transition-colors duration-200 ease-controlled";

const variants: Record<Variant, { root: string; node: string }> = {
  primary: {
    root: "bg-green-700 text-white hover:bg-teal-900",
    node: "bg-white text-green-700",
  },
  light: {
    root: "bg-white text-carbon hover:bg-canvas",
    node: "bg-green-700 text-white",
  },
  outline: {
    root: "border-2 border-teal-900 text-teal-900 hover:bg-teal-900 hover:text-white",
    node: "bg-teal-900 text-white group-hover:bg-white group-hover:text-teal-900",
  },
  "outline-light": {
    root: "border-2 border-white/80 text-white hover:bg-white hover:text-teal-900",
    node: "bg-white text-teal-900 group-hover:bg-teal-900 group-hover:text-white",
  },
};

function Arrow({ className }: { className: string }) {
  return (
    <span
      aria-hidden="true"
      className={`inline-grid size-8 shrink-0 place-items-center rounded-full transition-[transform,background-color,color] duration-200 ease-controlled group-hover:translate-x-0.5 ${className}`}
    >
      <svg viewBox="0 0 16 16" className="size-4" fill="none" stroke="currentColor" strokeWidth="1.75">
        <path d="M3 8h10M9 4l4 4-4 4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </span>
  );
}

type ButtonLinkProps = Omit<ComponentProps<typeof Link>, "className"> & {
  variant?: Variant;
  arrow?: boolean;
  className?: string;
  children: ReactNode;
};

export function ButtonLink({ variant = "primary", arrow = true, className = "", children, ...props }: ButtonLinkProps) {
  const v = variants[variant];
  return (
    <Link {...props} className={`${base} ${v.root} ${arrow ? "py-1.5 pr-1.5 pl-5" : "px-5 py-2.5"} ${className}`}>
      {/* An arrow pill must not wrap (its arrow would drop to a second line); an arrowless button
          may, so a long Kannada label wraps inside a 320px screen instead of pushing past it. */}
      <span className={arrow ? "whitespace-nowrap" : "text-center"}>{children}</span>
      {arrow && <Arrow className={v.node} />}
    </Link>
  );
}

type ButtonProps = Omit<ComponentProps<"button">, "className"> & {
  variant?: Variant;
  arrow?: boolean;
  className?: string;
};

export function Button({ variant = "primary", arrow = false, className = "", children, type = "button", ...props }: ButtonProps) {
  const v = variants[variant];
  return (
    <button
      type={type}
      {...props}
      className={`${base} ${v.root} ${arrow ? "py-1.5 pr-1.5 pl-5" : "px-5 py-2.5"} disabled:cursor-not-allowed disabled:opacity-60 ${className}`}
    >
      <span className="whitespace-nowrap">{children}</span>
      {arrow && <Arrow className={v.node} />}
    </button>
  );
}

import type { ReactNode } from "react";

export type EyebrowTone = "green" | "signal";

const tones: Record<EyebrowTone, string> = {
  green: "text-green-700 in-data-[surface=dark]:text-green-300",
  // Solar Yellow only on dark surfaces and only for major section openers (yellow is never text on light).
  signal: "text-green-700 in-data-[surface=dark]:text-yellow-400",
};

type EyebrowProps = {
  as?: "p" | "span" | "div";
  /** 28px leading rule in the text colour (prototype S4). */
  rule?: boolean;
  tone?: EyebrowTone;
  id?: string;
  className?: string;
  children: ReactNode;
};

/** Mono uppercase label. Rendered as a <p> before the heading, never as a heading. */
export function Eyebrow({ as: Tag = "p", rule = true, tone = "green", id, className = "", children }: EyebrowProps) {
  return (
    <Tag
      id={id}
      className={`${Tag === "span" ? "inline-flex" : "flex"} items-center gap-3 font-mono text-eyebrow font-medium uppercase ${tones[tone]} ${
        rule ? "before:h-0.5 before:w-7 before:shrink-0 before:bg-current before:content-['']" : ""
      } ${className}`}
    >
      {children}
    </Tag>
  );
}

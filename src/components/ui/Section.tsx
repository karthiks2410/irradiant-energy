import type { ComponentProps, ReactNode } from "react";

export type Surface = "canvas" | "white" | "dark";

const surfaces: Record<Surface, string> = {
  canvas: "bg-canvas text-carbon",
  white: "bg-white text-carbon",
  dark: "bg-teal-900 text-white",
};

type SectionProps = Omit<ComponentProps<"section">, "className" | "ref"> & {
  /** Surfaces alternate canvas → white → teal for rhythm (report §6.9). Dark sets data-surface="dark". */
  surface?: Surface;
  /** Use "div" when the block is not a landmark of its own. */
  as?: "section" | "div";
  /** Wrap children in the page container (default). */
  container?: boolean;
  /** Apply the section-y rhythm padding (default). */
  padded?: boolean;
  className?: string;
  containerClassName?: string;
  /**
   * Blocks inside the container ease up the first time they scroll into view (default). Turn it off
   * for a section whose content runs its own motion. See components/motion/ScrollReveal.tsx.
   */
  reveal?: boolean;
  children: ReactNode;
};

export function Section({
  surface = "canvas",
  as: Tag = "section",
  container = true,
  padded = true,
  className = "",
  containerClassName = "",
  reveal = true,
  children,
  ...props
}: SectionProps) {
  return (
    <Tag
      {...props}
      data-surface={surface === "dark" ? "dark" : undefined}
      className={`${surfaces[surface]} ${padded ? "section-y" : ""} ${className}`}
    >
      {container ? (
        <div className={`container-page ${containerClassName}`} data-reveal-children={reveal ? "" : undefined}>
          {children}
        </div>
      ) : (
        children
      )}
    </Tag>
  );
}

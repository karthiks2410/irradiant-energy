import type { ReactNode } from "react";
import { Eyebrow, Section } from "@/components/ui";
import { Breadcrumbs, type Crumb } from "./Breadcrumbs";

/**
 * Inner-page title size. globals.css has no `text-h1` token yet (docs/design-system.md §3.3
 * specifies one at 53–64 px), so inner pages sit one step below the home hero's `text-display`.
 */
const pageTitleClass = "font-display text-h2 font-extrabold";

type SolutionsHeroProps = {
  trail?: readonly Crumb[];
  /** Breadcrumb label for this page. */
  current: string;
  eyebrow?: string;
  title: string;
  lead: string;
  /** Button row under the lead. */
  actions?: ReactNode;
  /** Supporting text link under the buttons (report §11.1 level 4). */
  support?: ReactNode;
  /** Right-hand panel: a photo or a photography placeholder. */
  media?: ReactNode;
};

/** Deep Teal opener shared by /solutions and the three audience pages. */
export function SolutionsHero({ trail, current, eyebrow, title, lead, actions, support, media }: SolutionsHeroProps) {
  return (
    <Section
      surface="dark"
      padded={false}
      className="pt-6 pb-16 lg:pt-8 lg:pb-24"
      aria-labelledby="page-title"
    >
      <Breadcrumbs trail={trail} current={current} />
      <div className="mt-6 grid-page items-center gap-y-10 lg:mt-10">
        <div className={media ? "col-span-4 md:col-span-8 lg:col-span-7" : "col-span-4 md:col-span-8 lg:col-span-9"}>
          {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
          <h1 id="page-title" className={`${eyebrow ? "mt-5" : ""} ${pageTitleClass}`}>
            {title}
          </h1>
          <p className="mt-6 max-w-2xl text-lead text-white/85">{lead}</p>
          {actions && <div className="mt-8 flex flex-wrap items-center gap-4">{actions}</div>}
          {support && <div className="mt-6">{support}</div>}
        </div>
        {media && <div className="col-span-4 md:col-span-8 lg:col-span-5">{media}</div>}
      </div>
    </Section>
  );
}

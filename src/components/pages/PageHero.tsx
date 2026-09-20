import type { ReactNode } from "react";
import { Eyebrow } from "@/components/ui";
import { Breadcrumbs, type Crumb } from "./Breadcrumbs";
import { RadiantField } from "./RadiantField";

/**
 * The inner-page opener. Every page that is not the home page uses this — About, Contact, the
 * Solutions hub, the three audience pages and the three legal notices — so a visitor can tell in
 * one glance that they have navigated.
 *
 * Owner review round 2, point 1: "when I click on About the page is still in the home hero
 * section". It was not a scroll bug. About opened with a near-clone of the home hero — the same
 * full-bleed photograph, the same Deep Teal scrim, the same mono eyebrow and the same giant white
 * headline with a green accent word — so nothing on screen said the page had changed.
 *
 * What makes this band unmistakably *not* the home hero:
 *
 * | | Home hero | Inner-page hero |
 * |---|---|---|
 * | Height | full viewport (`min-h-svh`) | ~40–50svh; never full height |
 * | Surface | rotating full-bleed photograph + scrim | flat Deep Teal + one brand device |
 * | Type | `text-display` (up to 96px) | `text-h1` (up to 72px), one step down |
 * | Context | none — it is the front door | breadcrumb trail, always first |
 * | Base | dots and a transport control | Light Horizon rule |
 *
 * Devices (brand PDF pp.52–56, docs/design-system.md §6.3), never invented decoration:
 * - **Radiant Field** — a cropped fragment of the approved symbol, tonal, behind the copy.
 *   Rendered only when the band has no photograph, because the PDF allows one device per surface.
 * - **Light Horizon** — a 2px Solar Yellow rule on the band's base edge, the PDF's "first
 *   sunlight / selected transition" mark. It is the same rule that opens the footer's base band,
 *   which is what makes it read as a system rather than a stripe. Two hairlines per page keep the
 *   3–8% yellow budget untouched.
 *
 * Accessibility: exactly one `<h1>` per page, rendered here; both devices are `aria-hidden`; the
 * band is labelled by its own heading; nothing animates.
 */

type PageHeroProps = {
  /** Crumbs between Home and this page. Home is added by <Breadcrumbs>. */
  trail?: readonly Crumb[];
  /** Breadcrumb label for the current page. */
  current: string;
  eyebrow?: string;
  /** ReactNode so an <AccentedTitle> fits. Sentence case. */
  title: ReactNode;
  lead?: ReactNode;
  /** Mono supporting line under the lead (legal notices print their version and date here). */
  meta?: ReactNode;
  /** Button row. */
  actions?: ReactNode;
  /** Supporting text link under the buttons (report §11.1 level 4). */
  support?: ReactNode;
  /**
   * Contained image beside the copy — a single cropped picture, which is a different object from
   * the home hero's full-bleed stage. Suppresses the Radiant Field (one device per surface).
   */
  media?: ReactNode;
};

export function PageHero({ trail, current, eyebrow, title, lead, meta, actions, support, media }: PageHeroProps) {
  return (
    <section
      data-surface="dark"
      aria-labelledby="page-title"
      className="relative isolate overflow-hidden bg-teal-900 text-white"
    >
      {/* One device per surface: the field steps aside for a photograph. */}
      {!media && <RadiantField className="right-0 w-[min(34rem,78%)] lg:w-[min(46rem,52%)]" />}

      <div className="relative container-page flex min-h-[34svh] flex-col pt-6 pb-12 lg:min-h-[40svh] lg:pt-8 lg:pb-16">
        <Breadcrumbs trail={trail} current={current} />

        <div className="mt-6 flex flex-1 flex-col justify-center lg:mt-8">
          <div className="grid-page items-center gap-y-10">
            <div className={media ? "col-span-4 md:col-span-8 lg:col-span-7" : "col-span-4 md:col-span-8 lg:col-span-9"}>
              {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
              <h1 id="page-title" className={`font-display text-h1 font-extrabold ${eyebrow ? "mt-5" : ""}`}>
                {title}
              </h1>
              {/* 62ch keeps the lead inside the 60–72ch measure the rest of the site reads at. */}
              {lead && <p className="mt-6 max-w-[62ch] text-lead text-white/85">{lead}</p>}
              {meta && <p className="mt-6 font-mono text-label text-on-dark-muted uppercase">{meta}</p>}
              {actions && <div className="mt-8 flex flex-wrap items-center gap-4">{actions}</div>}
              {support && <div className="mt-6">{support}</div>}
            </div>
            {media && <div className="col-span-4 md:col-span-8 lg:col-span-5">{media}</div>}
          </div>
        </div>
      </div>

      {/* Light Horizon (PDF pp.52, 71, 84): the transition off the band. */}
      <div aria-hidden="true" className="absolute inset-x-0 bottom-0 h-0.5 bg-yellow-400" />
    </section>
  );
}

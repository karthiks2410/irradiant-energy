import { PlaceholderPanel, Section, SectionHeading } from "@/components/ui";
import { Reveal } from "@/components/motion/Reveal";
import { homePage } from "@/content/home";
import { showPlaceholders } from "@/lib/env";
import { AccentTitle } from "./AccentTitle";

const { projects } = homePage;

/** Bento shape of the prototype's project wall, kept for when real case studies land. */
const bento = [
  { span: "col-span-4 md:col-span-5 lg:col-span-7", aspect: "3/2" },
  { span: "col-span-4 md:col-span-3 lg:col-span-5", aspect: "3/2" },
  { span: "col-span-4 md:col-span-8 lg:col-span-12", aspect: "21/9" },
] as const;

/**
 * Featured projects. D-009 allows only verified, consented case studies here and none
 * exist yet (homePage.projects.items is empty), so the band shows labelled photo
 * placeholders in previews and nothing at all in production — a section of demo
 * projects would be the exact claim the content rules forbid.
 *
 * TODO(content): render the case-study cards once the owner supplies the first project
 * with its consent, capacity and commissioning date.
 */
export function ProjectsBand() {
  if (!showPlaceholders) return null;

  return (
    <Section aria-labelledby="projects-heading">
      <Reveal>
        <SectionHeading
          id="projects-heading"
          align="stacked"
          eyebrow={projects.copy.eyebrow}
          title={<AccentTitle text={projects.copy.title} />}
        />

        <div className="mt-12 grid-page gap-y-(--grid-gutter)">
          {projects.placeholderSubjects.map((subject, position) => {
            const cell = bento[position % bento.length];
            return (
              <PlaceholderPanel key={subject} subject={subject} aspect={cell.aspect} className={cell.span} />
            );
          })}
        </div>
      </Reveal>
    </Section>
  );
}

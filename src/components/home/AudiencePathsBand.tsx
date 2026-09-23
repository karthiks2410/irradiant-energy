import { CardGrid, LinkCard, Section, SectionHeading } from "@/components/ui";
import { Reveal } from "@/components/motion/Reveal";
import type { Content } from "@/i18n/content";
import { fill } from "@/i18n/format";
import { AccentTitle } from "./AccentTitle";

/** The three rooftop-solar audiences of v1 (D-009), each linking to its segment page. */
export function AudiencePathsBand({ content }: { content: Content }) {
  const { audiencePaths } = content.home;
  // Link label only — the card title is what assistive technology announces. The segment name
  // is a hole in the sentence rather than a suffix: Kannada puts it first.
  const exploreLabel = (label: string) =>
    fill(content.ui.home.audienceCardCta, { segment: label.toLowerCase() });

  return (
    <Section aria-labelledby="audiences-heading">
      <Reveal>
        <SectionHeading
          id="audiences-heading"
          align="stacked"
          title={<AccentTitle text={audiencePaths.copy.title} accent={audiencePaths.copy.accent} />}
        />

        <CardGrid columns={3} as="ul" className="mt-12">
          {audiencePaths.items.map((path) => (
            <LinkCard
              key={path.slug}
              as="li"
              href={path.href}
              title={path.label}
              cta={exploreLabel(path.label)}
            >
              {path.description}
            </LinkCard>
          ))}
        </CardGrid>
      </Reveal>
    </Section>
  );
}

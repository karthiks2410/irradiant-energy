import { CardGrid, LinkCard, Section, SectionHeading } from "@/components/ui";
import { Reveal } from "@/components/motion/Reveal";
import { homePage } from "@/content/home";
import { AccentTitle } from "./AccentTitle";

const { audiencePaths } = homePage;

/** Link label only — the card title is what assistive technology announces. */
const exploreLabel = (label: string) => `See solar for ${label.toLowerCase()}`;

/** The three rooftop-solar audiences of v1 (D-009), each linking to its segment page. */
export function AudiencePathsBand() {
  return (
    <Section aria-labelledby="audiences-heading">
      <Reveal>
        <SectionHeading
          id="audiences-heading"
          align="stacked"
          eyebrow={audiencePaths.copy.eyebrow}
          title={<AccentTitle text={audiencePaths.copy.title} />}
        />

        <CardGrid columns={3} as="ul" className="mt-12">
          {audiencePaths.items.map((path) => (
            <LinkCard
              key={path.slug}
              as="li"
              href={path.href}
              eyebrow={path.label}
              title={path.tile}
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

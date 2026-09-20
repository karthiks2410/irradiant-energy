import { Reveal } from "@/components/motion/Reveal";
import { Card, CardGrid, Section, SectionHeading } from "@/components/ui";
import { segmentNoun, systemTypes, systemTypesAnchor, systemTypesCopy } from "@/content/solutions";
import type { SegmentSlug } from "@/content/types";

/**
 * "Which system fits": on-grid / off-grid / hybrid, explained in place (report §9.2 replaces the
 * nine "Learn more" cards that ended on Coming Soon stubs, so these cards carry no links).
 * Homes get the plain-language body; the other audiences get the audience-neutral one-liner,
 * because the plain copy was written for homeowners (shared.ts `sharedHeld`).
 */
export function SystemTypesSection({ slug }: { slug: SegmentSlug }) {
  const copy = systemTypesCopy(segmentNoun[slug]);
  const plain = slug === "home";

  return (
    <Section id={systemTypesAnchor} aria-labelledby="system-types-heading">
      <SectionHeading
        id="system-types-heading"
        eyebrow={copy.eyebrow}
        title={copy.title}
        lead={copy.lead}
        align="split"
      />
      <Reveal className="mt-12 lg:mt-16">
        <CardGrid columns={3}>
          {systemTypes.map((type) => (
            // Same green top rule and mono label-above-title order as <FeatureCard>, so the three
            // card families on an audience page read as one set (owner review round 2, point 13).
            <Card as="li" key={type.id} padding="lg" className="flex flex-col border-t-2 border-t-green-500">
              <span className="font-mono text-label font-medium text-green-700 uppercase">{type.name}</span>
              <h3 className="mt-4 font-display text-h3 font-semibold">{type.plainName}</h3>
              <p className="mt-3 text-body text-ink-2">{plain ? type.plainDescription : type.description}</p>
            </Card>
          ))}
        </CardGrid>
      </Reveal>
    </Section>
  );
}

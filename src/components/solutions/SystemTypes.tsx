import { Reveal } from "@/components/motion/Reveal";
import { Card, CardGrid, Section, SectionHeading } from "@/components/ui";
import { systemTypesAnchor } from "@/content/solutions";
import type { SegmentSlug } from "@/content/types";
import type { Content } from "@/i18n/content";
import { fill } from "@/i18n/format";

/**
 * "Which system fits": on-grid / off-grid / hybrid, explained in place (report §9.2 replaces the
 * nine "Learn more" cards that ended on Coming Soon stubs, so these cards carry no links).
 * Homes get the plain-language body; the other audiences get the headline alone, because the
 * plain copy was written for homeowners (shared.ts `sharedHeld`).
 *
 * The heading is a template with a `{noun}` hole, filled from the same locale's own noun. It used
 * to be a TypeScript template literal, which fixed the word order in English; Kannada needs the
 * noun in the dative and the three nouns do not share a suffix, so the frame is copy too
 * (src/content/solutions/shared.ts).
 */
export function SystemTypesSection({ content, slug }: { content: Content; slug: SegmentSlug }) {
  const { copy, items } = content.solutionsShared.systemTypes;
  const noun = content.solutionsShared.segmentNoun[slug];
  const plain = slug === "home";

  return (
    <Section id={systemTypesAnchor} aria-labelledby="system-types-heading">
      <SectionHeading
        id="system-types-heading"
        eyebrow={copy.eyebrow}
        title={fill(copy.title, { noun })}
        lead={copy.lead}
        align="split"
      />
      <Reveal className="mt-12 lg:mt-16">
        <CardGrid columns={3}>
          {items.map((type) => (
            // Same green top rule and mono label-above-title order as <FeatureCard>, so the three
            // card families on an audience page read as one set (owner review round 2, point 13).
            <Card as="li" key={type.id} padding="lg" className="flex flex-col border-t-2 border-t-green-500">
              <span className="font-label text-label font-medium text-green-700 uppercase">{type.label}</span>
              <h3 className="mt-4 font-display text-h3 font-semibold">{type.plainName}</h3>
              {plain && <p className="mt-3 text-body text-ink-2">{type.plainDescription}</p>}
            </Card>
          ))}
        </CardGrid>
      </Reveal>
    </Section>
  );
}

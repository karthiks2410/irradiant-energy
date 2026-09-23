import { CardGrid, FeatureCard, FeatureIcon, Section, SectionHeading } from "@/components/ui";
import { Reveal } from "@/components/motion/Reveal";
import type { Content } from "@/i18n/content";
import { AccentTitle } from "./AccentTitle";

/** Six proof cards, numbered 01–06 as in the prototype. No numbers or credentials: positioning only. */
export function WhyBand({ content }: { content: Content }) {
  const { why } = content.home;

  return (
    <Section surface="white" aria-labelledby="why-heading">
      <Reveal>
        <SectionHeading
          id="why-heading"
          eyebrow={why.copy.eyebrow}
          title={<AccentTitle text={why.copy.title} accent={why.copy.accent} />}
        />

        <CardGrid columns={3} as="ul" className="mt-12">
          {why.cards.map((card) => (
            <FeatureCard
              key={card.title}
              lift
              numeral={card.number}
              icon={<FeatureIcon name={card.icon} />}
              title={card.title}
            >
              {card.description}
            </FeatureCard>
          ))}
        </CardGrid>
      </Reveal>
    </Section>
  );
}

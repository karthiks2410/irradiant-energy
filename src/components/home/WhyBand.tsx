import { CardGrid, FeatureCard, FeatureIcon, Section, SectionHeading } from "@/components/ui";
import { Reveal } from "@/components/motion/Reveal";
import { homePage } from "@/content/home";
import { AccentTitle } from "./AccentTitle";

const { why } = homePage;

/** Six proof cards, numbered 01–06 as in the prototype. No numbers or credentials: positioning only. */
export function WhyBand() {
  return (
    <Section surface="white" aria-labelledby="why-heading">
      <Reveal>
        <SectionHeading
          id="why-heading"
          eyebrow={why.copy.eyebrow}
          title={<AccentTitle text={why.copy.title} words={3} />}
          lead={why.copy.lead}
        />

        <CardGrid columns={3} as="ul" className="mt-12">
          {why.cards.map((card) => (
            <FeatureCard
              key={card.title}
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

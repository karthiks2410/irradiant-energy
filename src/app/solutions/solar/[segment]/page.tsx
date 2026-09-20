import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Reveal } from "@/components/motion/Reveal";
import { BreadcrumbJsonLd, FaqJsonLd } from "@/components/seo/JsonLd";
import { ClosingCtaBand } from "@/components/solutions/ClosingCta";
import { EnergyPath } from "@/components/solutions/EnergyPath";
import { SegmentFaq } from "@/components/solutions/SegmentFaq";
import { SegmentHero } from "@/components/solutions/SegmentHero";
import { SystemTypesSection } from "@/components/solutions/SystemTypes";
import { CardGrid, CheckIcon, FeatureCard, FeatureIcon, Section, SectionHeading } from "@/components/ui";
import { closingCta, getSegment, proofFallback, segmentSlugs, whatsappPrompts } from "@/content/solutions";
import type { SegmentSlug } from "@/content/types";
import { pageMetadata } from "@/lib/seo";

type SegmentPageProps = PageProps<"/solutions/solar/[segment]">;

/**
 * The single Solar Yellow node on each Energy Path (brand PDF p.54): the step where the decision
 * or the system changes hands. For a society that is the AGM approval (report §9, R-04); for a
 * home and a business it is switch-on.
 */
const keyStepIndex: Record<SegmentSlug, number> = {
  home: 3,
  "housing-society": 2,
  commercial: 4,
};

export function generateStaticParams() {
  return segmentSlugs.map((segment) => ({ segment }));
}

export async function generateMetadata({ params }: SegmentPageProps): Promise<Metadata> {
  const { segment } = await params;
  const data = getSegment(segment);
  if (!data) return {};
  return pageMetadata({
    title: data.meta.title,
    description: data.meta.description,
    path: `/solutions/solar/${data.slug}`,
  });
}

export default async function SegmentPage({ params }: SegmentPageProps) {
  const { segment } = await params;
  const data = getSegment(segment);
  if (!data) notFound();

  const { slug, whoItsFor, journey, included, trust, faq } = data;
  // The status filter leaves the business page without trust cards, so it falls back to the
  // owner-approved prototype proof cards (src/content/solutions/index.ts).
  const trustCards = trust.cards.length > 0 ? trust.cards : proofFallback.cards;
  const faqs = faq.groups.flatMap((group) => group.items);

  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: "Solutions", path: "/solutions" },
          { name: data.label, path: `/solutions/solar/${slug}` },
        ]}
      />
      <FaqJsonLd faqs={faqs.map((item) => ({ question: item.q, answer: item.a }))} />

      <SegmentHero segment={data} />

      <Section aria-labelledby="who-heading">
        <SectionHeading
          id="who-heading"
          align="stacked"
          eyebrow={whoItsFor.copy.eyebrow}
          title={whoItsFor.copy.title}
        />
        <Reveal className="mt-8 lg:mt-10">
          <ul className="flex flex-wrap gap-3">
            {whoItsFor.items.map((item) => (
              <li
                key={item.text}
                className="inline-flex min-h-11 items-center gap-2.5 rounded-md border border-mist bg-white px-4 py-2 text-ui font-semibold"
              >
                <span aria-hidden="true" className="size-2 shrink-0 rounded-full bg-green-500" />
                {item.text}
              </li>
            ))}
          </ul>
        </Reveal>
      </Section>

      <Section surface="white" aria-labelledby="journey-heading">
        <SectionHeading
          id="journey-heading"
          eyebrow={journey.copy.eyebrow}
          title={journey.copy.title}
          lead={journey.copy.lead}
        />
        <EnergyPath
          className="mt-14 lg:mt-20"
          steps={journey.steps}
          highlightIndex={keyStepIndex[slug]}
          halo="white"
        />
      </Section>

      <SystemTypesSection slug={slug} />

      <Section surface="dark" id="whats-included" aria-labelledby="included-heading">
        <SectionHeading
          id="included-heading"
          align="stacked"
          eyebrow={included.copy.eyebrow}
          title={included.copy.title}
        />
        <Reveal className="mt-10 lg:mt-14">
          <ul className="grid gap-x-(--grid-gutter) sm:grid-cols-2">
            {included.items.map((item) => (
              <li key={item.text} className="flex items-start gap-3 border-t border-white/15 py-5">
                <CheckIcon className="mt-1 size-5 shrink-0 text-green-300" />
                <span className="text-lead text-white/85">{item.text}</span>
              </li>
            ))}
          </ul>
        </Reveal>
      </Section>

      <Section aria-labelledby="trust-heading">
        <SectionHeading
          id="trust-heading"
          eyebrow={trust.copy.eyebrow}
          title={trust.copy.title}
          lead={trust.copy.lead}
        />
        <Reveal className="mt-12 lg:mt-16">
          <CardGrid columns={trustCards.length === 4 ? 2 : 3}>
            {trustCards.map((card) => (
              <FeatureCard
                key={card.title}
                title={card.title}
                numeral={card.number}
                icon={card.icon ? <FeatureIcon name={card.icon} /> : undefined}
              >
                {card.description}
              </FeatureCard>
            ))}
          </CardGrid>
        </Reveal>
      </Section>

      <SegmentFaq faq={faq} />

      <ClosingCtaBand
        copy={closingCta.copy}
        primary={closingCta.primary(slug)}
        whatsappText={whatsappPrompts[slug].text}
      />
    </>
  );
}

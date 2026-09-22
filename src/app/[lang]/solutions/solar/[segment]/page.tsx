import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Reveal } from "@/components/motion/Reveal";
import { BreadcrumbJsonLd, FaqJsonLd } from "@/components/seo/JsonLd";
import { ClosingCtaBand } from "@/components/solutions/ClosingCta";
import { EnergyPath } from "@/components/solutions/EnergyPath";
import { SegmentFaq } from "@/components/solutions/SegmentFaq";
import { SegmentHero } from "@/components/solutions/SegmentHero";
import { SystemTypesSection } from "@/components/solutions/SystemTypes";
import { CardGrid, FeatureCard, FeatureIcon, Section, SectionHeading } from "@/components/ui";
import { closingCta, getSegment, proofFallback, segmentSlugs, whatsappPrompts } from "@/content/solutions";
import type { SegmentSlug } from "@/content/types";
import { langParams, type RouteKey } from "@/i18n/registry";
import { getLocale } from "@/i18n/server";
import { pageMetadata } from "@/lib/seo";

type SegmentPageProps = PageProps<"/[lang]/solutions/solar/[segment]">;

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

/**
 * Publishing gate for all three audience pages at once. A page's generateStaticParams may also
 * generate the segments above it (Next 16.3.5 docs, generate-static-params.md), so this returns
 * the locale/segment pairs the registry publishes — and `dynamicParams = false` on the [lang]
 * layout 404s everything else, including an unknown segment.
 */
export function generateStaticParams() {
  return segmentSlugs.flatMap((segment) =>
    langParams(`solutions-${segment}` as RouteKey).map(({ lang }) => ({ lang, segment })),
  );
}

export async function generateMetadata({ params }: SegmentPageProps): Promise<Metadata> {
  const { segment } = await params;
  const data = getSegment(segment);
  if (!data) return {};
  return pageMetadata({
    title: data.meta.title,
    description: data.meta.description,
    path: `/solutions/solar/${data.slug}`,
    locale: await getLocale(),
  });
}

export default async function SegmentPage({ params }: SegmentPageProps) {
  const { segment } = await params;
  const data = getSegment(segment);
  if (!data) notFound();

  const { slug, journey, trust, faq } = data;
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

      <Section surface="dark" aria-labelledby="trust-heading">
        <SectionHeading
          id="trust-heading"
          eyebrow={trust.copy.eyebrow}
          title={trust.copy.title}
          lead={trust.copy.lead}
        />
        <Reveal className="mt-12 lg:mt-16">
          <CardGrid columns={trustCards.length === 4 ? 2 : 3}>
            {trustCards.map((card) => (
              // Lifts like the home Why cards: on Business these are the same cards, and every
              // audience page's "Why us" plays the same role, so they behave the same everywhere.
              <FeatureCard
                key={card.title}
                lift
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

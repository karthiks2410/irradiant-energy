import { Reveal } from "@/components/motion/Reveal";
import { AccentedTitle } from "@/components/pages/AccentedTitle";
import { PageHero } from "@/components/pages/PageHero";
import { BreadcrumbJsonLd } from "@/components/seo/JsonLd";
import { ClosingCtaBand } from "@/components/solutions/ClosingCta";
import { WhatsAppButton } from "@/components/solutions/Contact";
import { ButtonLink, CardGrid, LinkCard, Section } from "@/components/ui";
import { getContent } from "@/i18n/content";
import { fill } from "@/i18n/format";
import { langParams } from "@/i18n/registry";
import { getLocale } from "@/i18n/server";
import { pageMetadata } from "@/lib/seo";

// PROPOSED CONTENT — REQUIRES CLIENT APPROVAL (place qualifier). Karnataka is owner-stated
// (content-inventory F-40); docs/discovery/16-seo-deep-dive.md H3 prescribes it on this page.
// The title and description live in src/content/solutions/shared.ts so the Kannada overlay can
// reach them.
/** Publishing gate: this page exists only in the locales the registry publishes it in. */
export const generateStaticParams = () => langParams("solutions");

export async function generateMetadata() {
  const locale = await getLocale();
  const { meta } = getContent(locale).solutionsShared.hub;
  return pageMetadata({ title: meta.title, description: meta.description, path: "/solutions", locale });
}

export default async function SolutionsPage() {
  const content = getContent(await getLocale());
  const { copy, items } = content.home.audiencePaths;
  const { hub, segmentNoun, closingCta } = content.solutionsShared;

  return (
    <>
      <BreadcrumbJsonLd items={[{ name: hub.breadcrumb, path: "/solutions" }]} />

      <PageHero
        current={hub.breadcrumb}
        title={<AccentedTitle text={copy.title} accent={copy.accent} />}
        // The hub is a junction, so the estimate route is offered here too rather than only in the
        // closing band; the three audience pages open with the same pair.
        actions={
          <>
            <ButtonLink href={content.primaryCta.href} variant="light">
              {content.primaryCta.label}
            </ButtonLink>
            <WhatsAppButton label={content.faqCardLabels.whatsappLabel} variant="outline-light" />
          </>
        }
      />

      <Section aria-label={hub.sectionLabel}>
        <Reveal>
          <CardGrid columns={3}>
            {items.map((path) => (
              <LinkCard
                as="li"
                key={path.slug}
                href={path.href}
                title={path.label}
                headingLevel={2}
                // A frame with a hole, not English word order plus a noun: Kannada takes the
                // segment noun uninflected and rebuilds the line around it (shared.ts).
                cta={fill(hub.cardCta, { noun: segmentNoun[path.slug] })}
              >
                {path.description}
              </LinkCard>
            ))}
          </CardGrid>
        </Reveal>
      </Section>

      <ClosingCtaBand content={content} copy={closingCta} primary={content.primaryCta} />
    </>
  );
}

import { Reveal } from "@/components/motion/Reveal";
import { AccentedTitle } from "@/components/pages/AccentedTitle";
import { PageHero } from "@/components/pages/PageHero";
import { BreadcrumbJsonLd } from "@/components/seo/JsonLd";
import { ClosingCtaBand } from "@/components/solutions/ClosingCta";
import { WhatsAppButton } from "@/components/solutions/Contact";
import { ButtonLink, CardGrid, LinkCard, Section } from "@/components/ui";
import { homePage } from "@/content/home";
import { closingCta, segmentNoun } from "@/content/solutions";
import { primaryCta } from "@/content/site";
import { pageMetadata } from "@/lib/seo";

// PROPOSED CONTENT — REQUIRES CLIENT APPROVAL (place qualifier). Bengaluru is VERIFIED-LIVE
// (content-inventory F-40); docs/discovery/16-seo-deep-dive.md H3 prescribes it on this page.
export const metadata = pageMetadata({
  title: "Solar solutions in Bengaluru",
  description:
    "Rooftop solar for homes, housing societies and businesses in Bengaluru. Choose your audience to see who it is for, how the work runs and which system fits.",
  path: "/solutions",
});

export default function SolutionsPage() {
  const { copy, items } = homePage.audiencePaths;

  return (
    <>
      <BreadcrumbJsonLd items={[{ name: "Solutions", path: "/solutions" }]} />

      <PageHero
        current="Solutions"
        eyebrow={copy.eyebrow}
        title={<AccentedTitle text={copy.title} tail={1} />}
        // PROPOSED CONTENT — REQUIRES CLIENT APPROVAL (navigational copy; states no fact).
        lead="Three starting points, one way of working. Each page shows who it is for, how the project runs and which system fits."
        // The hub is a junction, so the estimate route is offered here too rather than only in the
        // closing band; the three audience pages open with the same pair.
        actions={
          <>
            <ButtonLink href={primaryCta.href} variant="light">
              {primaryCta.label}
            </ButtonLink>
            <WhatsAppButton variant="outline-light" />
          </>
        }
      />

      <Section aria-label="Solar solutions by audience">
        <Reveal>
          <CardGrid columns={3}>
            {items.map((path) => (
              <LinkCard
                as="li"
                key={path.slug}
                href={path.href}
                eyebrow={path.label}
                title={path.tile}
                headingLevel={2}
                cta={`Explore solar for your ${segmentNoun[path.slug]}`}
              >
                {path.description}
              </LinkCard>
            ))}
          </CardGrid>
        </Reveal>
      </Section>

      <ClosingCtaBand copy={closingCta.copy} primary={primaryCta} />
    </>
  );
}

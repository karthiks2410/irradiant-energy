import { Reveal } from "@/components/motion/Reveal";
import { BreadcrumbJsonLd } from "@/components/seo/JsonLd";
import { ClosingCtaBand } from "@/components/solutions/ClosingCta";
import { SolutionsHero } from "@/components/solutions/SolutionsHero";
import { CardGrid, LinkCard, Section } from "@/components/ui";
import { homePage } from "@/content/home";
import { closingCta, segmentNoun } from "@/content/solutions";
import { primaryCta } from "@/content/site";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Solar solutions",
  description:
    "Rooftop solar for homes, housing societies and businesses. Choose your audience to see who it is for, how the work runs and which system fits.",
  path: "/solutions",
});

export default function SolutionsPage() {
  const { copy, items } = homePage.audiencePaths;

  return (
    <>
      <BreadcrumbJsonLd items={[{ name: "Solutions", path: "/solutions" }]} />

      <SolutionsHero
        current="Solutions"
        eyebrow={copy.eyebrow}
        title={copy.title}
        // PROPOSED CONTENT — REQUIRES CLIENT APPROVAL (navigational copy; states no fact).
        lead="Three starting points, one way of working. Each page shows who it is for, how the project runs and which system fits."
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

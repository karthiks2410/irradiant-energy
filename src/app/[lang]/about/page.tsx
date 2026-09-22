import { AccentedTitle } from "@/components/pages/AccentedTitle";
import { EnergyPath } from "@/components/pages/EnergyPath";
import { PageHero } from "@/components/pages/PageHero";
import { PlaceholderTag } from "@/components/pages/PlaceholderTag";
import { Reveal } from "@/components/motion/Reveal";
import { BreadcrumbJsonLd } from "@/components/seo/JsonLd";
import { ClosingCtaBand } from "@/components/solutions/ClosingCta";
import { Card, CardGrid, Eyebrow, FeatureCard, Section, SectionHeading } from "@/components/ui";
import { aboutPage } from "@/content/about";
import { langParams } from "@/i18n/registry";
import { getLocale } from "@/i18n/server";
import { showPlaceholders } from "@/lib/env";
import { pageMetadata } from "@/lib/seo";

export const generateStaticParams = () => langParams("about");

export async function generateMetadata() {
  return pageMetadata({
    title: "About us",
    description:
      "How Irradiant Energy works — understand, design, deliver, support — plus the mission, values and people behind the company.",
    path: "/about",
    locale: await getLocale(),
  });
}

const { mission, story, brand, facts, values, team, closingCta } = aboutPage;

function initials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("");
}

export default function AboutPage() {
  return (
    <>
      <BreadcrumbJsonLd items={[{ name: "About", path: "/about" }]} />

      {/*
       * Not the home hero (owner review round 2, point 1): the full-bleed photograph and the
       * display-size headline are gone, and the page opens on the shared inner-page band —
       * breadcrumb first, Deep Teal, Radiant Field, `text-h1`. Dropping the photo also removes a
       * second eager LCP image from the route.
       */}
      <PageHero
        current="About"
        eyebrow={mission.eyebrow}
        title={<AccentedTitle text={mission.title} />}
        lead={mission.lead}
      />

      <Section surface="canvas" aria-labelledby="about-story-heading">
        <SectionHeading id="about-story-heading" title={<AccentedTitle text={story.copy.title} />} />
        {/* Exactly one Solar Yellow node, on the handover the whole path leads to (brand PDF p.54). */}
        <EnergyPath className="mt-14 lg:mt-20" steps={story.steps} highlightIndex={2} halo="canvas" variant="stage" />
      </Section>

      <Section surface="white" aria-labelledby="about-stands-heading">
        <SectionHeading
          id="about-stands-heading"
          align="stacked"
          eyebrow="What we stand for"
          title={brand.positioning.text}
          lead={brand.promise.text}
        />
        {/* Three things a customer can act on, in the slot the brand-guideline cards used to take.
            Same card language as the rest of the site: the green top rule on a plain card. */}
        <Reveal className="mt-12 lg:mt-16">
          <CardGrid columns={3}>
            {facts.map((item) => (
              <Card key={item.label} as="li" padding="lg" className="border-t-2 border-t-green-500">
                <Eyebrow rule={false}>{item.label}</Eyebrow>
                <p className="mt-4 font-display text-h4 font-semibold text-carbon">{item.value}</p>
              </Card>
            ))}
          </CardGrid>
        </Reveal>
      </Section>

      <Section surface="dark" aria-labelledby="about-values-heading">
        <SectionHeading
          id="about-values-heading"
          align="stacked"
          eyebrowTone="signal"
          eyebrow={values.copy.eyebrow}
          title={<AccentedTitle text={values.copy.title} tail={2} />}
        />
        <Reveal className="mt-12 lg:mt-16">
          <CardGrid columns={3}>
            {values.items.map((item) => (
              <FeatureCard key={item.number} title={item.title} numeral={item.number}>
                {item.description}
              </FeatureCard>
            ))}
          </CardGrid>
        </Reveal>
      </Section>

      <Section surface="white" aria-labelledby="about-team-heading">
        <SectionHeading
          id="about-team-heading"
          align="stacked"
          eyebrow={team.copy.eyebrow}
          title={team.copy.title}
        />
        <Reveal className="mt-12 lg:mt-16">
          <CardGrid columns={3}>
            {team.members.map((member) => (
              <Card key={member.name} as="li" padding="lg" className="flex items-center gap-5">
                <span
                  aria-hidden="true"
                  className="grid size-16 shrink-0 place-items-center rounded-full bg-soft-green font-display text-h4 font-bold text-green-700"
                >
                  {initials(member.name)}
                </span>
                <span>
                  <span className="block font-display text-h4 font-semibold text-carbon">{member.name}</span>
                  <span className="mt-1 block text-small text-grey-600">{member.role}</span>
                </span>
              </Card>
            ))}
          </CardGrid>
        </Reveal>
        {showPlaceholders && (
          <p className="mt-8 max-w-prose border-l-4 border-yellow-400 py-1 pl-4 text-small text-ink-2">
            <PlaceholderTag>Headshots and profiles held</PlaceholderTag> Photographs, biographies and profile links
            go live only once each person approves their own.
          </p>
        )}
      </Section>

      <ClosingCtaBand
        copy={closingCta.copy}
        primary={closingCta.primary}
        whatsappText={closingCta.whatsappPrompt.text}
      />
    </>
  );
}

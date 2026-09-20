import Image from "next/image";
import { AccentedTitle } from "@/components/pages/AccentedTitle";
import { EnergyPath } from "@/components/pages/EnergyPath";
import { PlaceholderTag } from "@/components/pages/PlaceholderTag";
import { Reveal } from "@/components/motion/Reveal";
import { BreadcrumbJsonLd } from "@/components/seo/JsonLd";
import { ButtonLink, Card, CardGrid, Eyebrow, FeatureCard, Section, SectionHeading } from "@/components/ui";
import { aboutPage } from "@/content/about";
import { templateImages } from "@/content/images";
import { site, whatsappLink } from "@/content/site";
import { showPlaceholders } from "@/lib/env";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "About us",
  description:
    "How Irradiant Energy works — understand, design, deliver, support — plus the mission, values and people behind the company.",
  path: "/about",
});

const { mission, story, brand, values, team, newName, closingCta } = aboutPage;

const heroPhoto = templateImages.heroCityCampus;

/** Short, quotable lines from the brand guidelines, each under its own mono label. */
const stands = [
  { label: "Essence", value: brand.essence.text },
  { label: "Personality", value: brand.personality.text },
  { label: "Who we serve", value: brand.audience.text },
  { label: "Our promise", value: brand.promise.text },
];

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

      <Section
        surface="dark"
        padded={false}
        container={false}
        className="relative isolate overflow-hidden"
        aria-labelledby="about-hero-heading"
      >
        {/* TODO(photography): replace with approved photo. Decorative backdrop, so the alt is empty. */}
        {/* Above-the-fold hero. Next 16 deprecated `priority` in favour of loading/fetchPriority. */}
        <Image src={heroPhoto.src} alt="" fill sizes="100vw" loading="eager" fetchPriority="high" className="object-cover" />
        <div aria-hidden="true" className="absolute inset-0 bg-teal-900/88" />
        <div className="relative container-page section-y">
          <SectionHeading
            id="about-hero-heading"
            headingLevel={1}
            align="stacked"
            eyebrow={mission.eyebrow}
            title={<AccentedTitle text={mission.title} />}
            lead={mission.lead}
          />
        </div>
      </Section>

      <Section surface="canvas" aria-labelledby="about-story-heading">
        <SectionHeading
          id="about-story-heading"
          eyebrow={story.copy.eyebrow}
          title={<AccentedTitle text={story.copy.title} />}
          lead={story.copy.lead}
        />
        <Reveal className="mt-14">
          {/* Exactly one Solar Yellow node, on the handover the whole path leads to (brand PDF p.54). */}
          <EnergyPath steps={story.steps} highlightIndex={2} halo="canvas" />
        </Reveal>
      </Section>

      <Section surface="white" aria-labelledby="about-stands-heading">
        <SectionHeading
          id="about-stands-heading"
          eyebrow="What we stand for"
          title={brand.purpose.text}
          lead={brand.positioning.text}
        />
        <Reveal className="mt-12">
          <CardGrid columns={2}>
            {stands.map((item) => (
              <Card key={item.label} as="li" padding="lg">
                <Eyebrow rule={false}>
                  {item.label}
                </Eyebrow>
                <p className="mt-3 font-display text-h4 font-semibold text-carbon">{item.value}</p>
              </Card>
            ))}
          </CardGrid>
        </Reveal>
      </Section>

      <Section surface="canvas" aria-labelledby="about-name-heading">
        <div className="grid-page items-start gap-y-10">
          <div className="col-span-4 md:col-span-8 lg:col-span-6">
            {/* PROPOSED CONTENT — REQUIRES CLIENT APPROVAL: the rename note (decisions.md D-001). */}
            <Eyebrow>{newName.eyebrow}</Eyebrow>
            <h2 id="about-name-heading" className="mt-4 font-display text-h2 font-bold">
              <AccentedTitle text={newName.title} tail={2} />
            </h2>
            <p className="mt-5 text-lead text-ink-2">{newName.lead}</p>
          </div>
          <div className="col-span-4 md:col-span-8 lg:col-span-5 lg:col-start-8">
            <blockquote className="border-l-2 border-green-500 pl-6">
              <p className="font-display text-h3 font-semibold text-carbon">{brand.nameStory.text}</p>
            </blockquote>
          </div>
        </div>
      </Section>

      <Section surface="dark" aria-labelledby="about-values-heading">
        <SectionHeading
          id="about-values-heading"
          eyebrowTone="signal"
          eyebrow={values.copy.eyebrow}
          title={<AccentedTitle text={values.copy.title} tail={2} />}
        />
        <Reveal className="mt-12">
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
        <SectionHeading id="about-team-heading" eyebrow={team.copy.eyebrow} title={team.copy.title} lead={team.copy.lead} />
        <Reveal className="mt-12">
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
          <p className="mt-6 text-small text-grey-600">
            <PlaceholderTag>Headshots and profiles held</PlaceholderTag> Photographs, biographies and profile links
            go live only once each person approves their own.
          </p>
        )}
      </Section>

      <Section surface="dark" aria-labelledby="about-cta-heading">
        <SectionHeading
          id="about-cta-heading"
          align="center"
          title={<AccentedTitle text={closingCta.copy.title} tail={2} />}
          lead={closingCta.copy.lead}
        />
        <div className="mt-10 flex flex-wrap justify-center gap-4">
          <ButtonLink href={closingCta.primary.href} variant="light">
            {closingCta.primary.label}
          </ButtonLink>
          <ButtonLink
            href={whatsappLink(closingCta.whatsappPrompt.text)}
            variant="outline-light"
            target="_blank"
            rel="noopener noreferrer"
            arrow={false}
          >
            WhatsApp {site.name}
          </ButtonLink>
        </div>
      </Section>
    </>
  );
}

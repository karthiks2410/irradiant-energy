import { LogoSymbol } from "@/components/brand/Logo";
import { Reveal } from "@/components/motion/Reveal";
import { ButtonLink, Card, CardGrid, Eyebrow, Section, SectionHeading } from "@/components/ui";
import { homePage } from "@/content/home";
import { AccentTitle } from "./AccentTitle";

const { about } = homePage;

/**
 * About band. The prototype's orbiting glass card is replaced by a flat Deep Teal panel
 * carrying the brand symbol as a low-opacity Radiant Field fragment (report §6.10 rules
 * out glassmorphism, blur and glow). The panel sets data-surface="dark" itself, so the
 * kit components inside it switch to their dark pairings.
 */
export function AboutBand() {
  return (
    <Section surface="white" aria-labelledby="about-heading">
      <Reveal>
        <div className="grid-page gap-y-10">
          <div
            data-surface="dark"
            className="relative order-last col-span-4 overflow-hidden rounded-md bg-teal-900 p-8 text-white md:col-span-8 lg:order-first lg:col-span-5 lg:p-10"
          >
            <LogoSymbol
              decorative
              className="pointer-events-none absolute -right-14 -bottom-16 size-64 text-green-500/10 lg:-right-20 lg:-bottom-24 lg:size-88"
            />
            <div className="relative">
              <Eyebrow tone="signal">{about.capEyebrow}</Eyebrow>
              <p className="mt-6 font-display text-h3 font-semibold">{about.caption}</p>
              <ul className="mt-8 flex flex-wrap gap-2">
                {about.tags.map((tag) => (
                  <li
                    key={tag}
                    className="rounded-full border border-white/25 px-4 py-2 text-small text-white/85"
                  >
                    {tag}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="col-span-4 md:col-span-8 lg:col-span-7">
            <SectionHeading
              id="about-heading"
              align="stacked"
              eyebrow={about.copy.eyebrow}
              title={<AccentTitle text={about.copy.title} />}
              lead={about.copy.lead}
            />

            <CardGrid columns={2} as="ul" className="mt-10">
              {about.points.map((point) => (
                <Card key={point.label} as="li">
                  <Eyebrow as="p" rule={false}>
                    {point.label}
                  </Eyebrow>
                  <p className="mt-3 font-display text-h4 font-semibold">{point.value}</p>
                </Card>
              ))}
            </CardGrid>

            <ButtonLink href={about.cta.href} variant="outline" className="mt-10">
              {about.cta.label}
            </ButtonLink>
          </div>
        </div>
      </Reveal>
    </Section>
  );
}

import Link from "next/link";
import { ArrowRightIcon, Card, FeatureIcon, Section, SectionHeading } from "@/components/ui";
import { Reveal } from "@/components/motion/Reveal";
import { homePage } from "@/content/home";
import type { Feature } from "@/content/types";
import { AccentTitle } from "./AccentTitle";

const { system } = homePage;

/** Where "Generate" goes; the other three are not offerings in v1 (D-009). */
const generateHref = "/solutions";
const generateCta = "Explore rooftop solar";

/**
 * Icon-led card with two states. The linked one repeats the kit's whole-card link
 * pattern (one tab stop, the title's ::after covers the card, the focus ring is drawn on
 * the card) because <LinkCard> has no icon slot above the title; the rest carry a mono
 * "Coming next" label and, per D-009, no call to action at all.
 */
function SystemCard({ card, comingNextLabel }: { card: Feature; comingNextLabel: string }) {
  const href = card.comingNext ? null : generateHref;

  return (
    <Card
      as="li"
      interactive={Boolean(href)}
      className="group relative flex flex-col has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-teal-900"
    >
      <FeatureIcon name={card.icon} className="size-8 text-teal-900" />

      <h3 className="mt-5 font-display text-h3 font-semibold">
        {href ? (
          <Link
            href={href}
            className="after:absolute after:inset-0 after:rounded-md after:content-[''] focus-visible:outline-none"
          >
            {card.title}
          </Link>
        ) : (
          card.title
        )}
      </h3>

      <p className="mt-2 text-body text-ink-2">{card.description}</p>

      {href ? (
        <span
          aria-hidden="true"
          className="mt-auto inline-flex items-center gap-2 pt-6 text-ui font-semibold text-green-700"
        >
          {generateCta}
          <ArrowRightIcon className="size-4 transition-transform duration-200 ease-controlled group-hover:translate-x-0.5" />
        </span>
      ) : (
        <span className="mt-auto pt-6 font-mono text-label text-ink-2 uppercase">{comingNextLabel}</span>
      )}
    </Card>
  );
}

/** Generate · Store · Charge · Monitor. Only Generate is sold today (D-009). */
export function SystemBand() {
  return (
    <Section surface="canvas" aria-labelledby="system-heading">
      <Reveal>
        <SectionHeading
          id="system-heading"
          align="stacked"
          eyebrow={system.copy.eyebrow}
          title={<AccentTitle text={system.copy.title} words={4} />}
        />

        {/* Not <CardGrid columns={4}>: its 4-up layout is 2-up on phones, which leaves these
            cards about 100px of text width. One per row below sm reads properly. */}
        <ul className="mt-12 grid gap-x-(--grid-gutter) gap-y-6 sm:grid-cols-2 lg:grid-cols-4">
          {system.cards.map((card) => (
            <SystemCard key={card.title} card={card} comingNextLabel={system.comingNextLabel} />
          ))}
        </ul>
      </Reveal>
    </Section>
  );
}

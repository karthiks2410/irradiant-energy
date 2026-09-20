import Image from "next/image";
import { PageHero } from "@/components/pages/PageHero";
import { ArrowRightIcon, ButtonLink, PlaceholderPanel } from "@/components/ui";
import { projectImages, type ProjectImage } from "@/content/images";
import { whatsappPrompts } from "@/content/solutions";
import type { Segment, SegmentSlug } from "@/content/types";
import { showPlaceholders } from "@/lib/env";
import { WhatsAppButton } from "./Contact";

// The owner's own installation photography (src/content/images.ts), so these may be shown as our work.
const heroPhoto: Partial<Record<SegmentSlug, ProjectImage>> = {
  home: projectImages.palmRooftop,
  "housing-society": projectImages.terraceArray,
  commercial: projectImages.industrialRoofArray,
};

/** Photo brief for the segments with no matching template scene (report §16, shot list A1/A7). */
const photoSubject: Record<SegmentSlug, string> = {
  home: "Rooftop array on a family home",
  "housing-society": "Shared rooftop array on an apartment block",
  commercial: "Rooftop array on a factory or warehouse",
};

/**
 * A single contained picture beside the copy — deliberately not the home hero's full-bleed,
 * rotating, full-viewport stage. It is cropped to a card, it sits inside the page grid, and the
 * copy never crosses it, so no scrim is needed and the picture stays legible as a picture.
 *
 * With no photo and no placeholder to show (production, housing society), this renders nothing
 * and the hero falls back to the Radiant Field — the brand's own answer to missing photography
 * (docs/design-system.md §6.2 "honest placeholder"), instead of the blank teal rectangle the
 * band used to leave there.
 */
function HeroMedia({ slug }: { slug: SegmentSlug }) {
  const photo = heroPhoto[slug];
  if (!photo) return <PlaceholderPanel subject={photoSubject[slug]} aspect="3/2" />;
  return (
    <div className="relative aspect-3/2 overflow-hidden rounded-lg ring-1 ring-white/12">
      <Image
        src={photo.src}
        alt={photo.alt}
        fill
        // Above-the-fold hero image. Next 16 deprecated `priority` in favour of `preload`, and
        // node_modules/next/dist/docs/01-app/03-api-reference/02-components/image.md recommends
        // loading="eager" + fetchPriority="high" over `preload` in most cases.
        loading="eager"
        fetchPriority="high"
        sizes="(min-width: 1024px) 40vw, 100vw"
        style={{ objectPosition: photo.focal }}
        className="object-cover"
      />
    </div>
  );
}

/** Audience-page opener: breadcrumb, audience eyebrow, H1, lead, estimate CTA and WhatsApp. */
export function SegmentHero({ segment }: { segment: Segment }) {
  const { hero } = segment;
  // No photo and no placeholder means no media column at all, so <PageHero> draws its brand
  // device rather than reserving a column for an empty block.
  const hasMedia = Boolean(heroPhoto[segment.slug]) || showPlaceholders;
  return (
    <PageHero
      trail={[{ name: "Solutions", href: "/solutions" }]}
      current={segment.label}
      eyebrow={hero.eyebrow}
      title={hero.title}
      lead={hero.lead}
      media={hasMedia ? <HeroMedia slug={segment.slug} /> : undefined}
      actions={
        <>
          <ButtonLink href={hero.cta.href} variant="light">
            {hero.cta.label}
          </ButtonLink>
          <WhatsAppButton text={whatsappPrompts[segment.slug].text} variant="outline-light" />
        </>
      }
      support={
        hero.secondaryCta && (
          // Plain anchor, so Lenis applies the header offset (ui-kit README § Motion islands).
          <a
            href={hero.secondaryCta.href}
            className="group inline-flex min-h-11 items-center gap-2 text-ui font-semibold text-green-300 underline-offset-4 transition-colors duration-200 hover:text-white hover:underline"
          >
            {hero.secondaryCta.label}
            <ArrowRightIcon className="size-4 transition-transform duration-200 ease-controlled group-hover:translate-x-0.5" />
          </a>
        )
      }
    />
  );
}

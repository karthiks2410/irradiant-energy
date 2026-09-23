import Image from "next/image";
import { PageHero } from "@/components/pages/PageHero";
import { localizePath } from "@/i18n/paths";
import { getLocale } from "@/i18n/server";
import { ArrowRightIcon, ButtonLink, PlaceholderPanel } from "@/components/ui";
import type { Segment, SegmentSlug } from "@/content/types";
import type { Content } from "@/i18n/content";
import { showPlaceholders } from "@/lib/env";
import { WhatsAppButton } from "./Contact";

/**
 * The owner's own installation photography (src/content/images.ts), so these may be shown as our
 * work. Named by key rather than by value: the alt text is copy and comes from the locale's own
 * `content.images`, while the file, its size and its crop are the same picture in both locales.
 */
const heroPhotoKey: Partial<Record<SegmentSlug, keyof Content["images"]>> = {
  home: "palmRooftop",
  "housing-society": "terraceArray",
  commercial: "industrialRoofArray",
};

/**
 * Photo brief for the segments with no matching template scene (report §16, shot list A1/A7).
 *
 * Development scaffolding, not copy: <PlaceholderPanel> renders nothing in production
 * (lib/env.ts `showPlaceholders`), so no reader in either language ever sees these words.
 */
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
function HeroMedia({ images, slug }: { images: Content["images"]; slug: SegmentSlug }) {
  const key = heroPhotoKey[slug];
  if (!key) return <PlaceholderPanel subject={photoSubject[slug]} aspect="3/2" />;
  const photo = images[key];
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
export async function SegmentHero({ content, segment }: { content: Content; segment: Segment }) {
  const { hero } = segment;
  // Plain anchor below (Lenis header offset), so the prefix is applied by hand.
  const locale = await getLocale();
  // No photo and no placeholder means no media column at all, so <PageHero> draws its brand
  // device rather than reserving a column for an empty block.
  const hasMedia = Boolean(heroPhotoKey[segment.slug]) || showPlaceholders;
  return (
    <PageHero
      trail={[{ name: content.solutionsShared.hub.breadcrumb, href: "/solutions" }]}
      current={segment.label}
      eyebrow={hero.eyebrow}
      title={hero.title}
      lead={hero.lead}
      media={hasMedia ? <HeroMedia images={content.images} slug={segment.slug} /> : undefined}
      actions={
        <>
          <ButtonLink href={hero.cta.href} variant="light">
            {hero.cta.label}
          </ButtonLink>
          <WhatsAppButton
            text={content.solutionsShared.whatsappPrompts[segment.slug].text}
            label={content.faqCardLabels.whatsappLabel}
            variant="outline-light"
          />
        </>
      }
      support={
        hero.secondaryCta && (
          // Plain anchor, so Lenis applies the header offset (ui-kit README § Motion islands).
          <a
            href={localizePath(hero.secondaryCta.href, locale)}
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

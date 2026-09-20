import Image from "next/image";
import { ArrowRightIcon, ButtonLink, PlaceholderPanel } from "@/components/ui";
import { templateImages, type TemplateImage } from "@/content/images";
import { whatsappPrompts } from "@/content/solutions";
import type { Segment, SegmentSlug } from "@/content/types";
import { WhatsAppButton } from "./Contact";
import { SolutionsHero } from "./SolutionsHero";

// TODO(photography): replace with approved photos. Template imagery is temporary hero/section
// dressing only — never presented as our projects, customers or team (D-009).
const heroPhoto: Partial<Record<SegmentSlug, TemplateImage>> = {
  home: templateImages.heroHomeFamily,
  commercial: templateImages.heroCommercialRooftop,
};

/** Photo brief for the segments with no matching template scene (report §16, shot list A1/A7). */
const photoSubject: Record<SegmentSlug, string> = {
  home: "Rooftop array on a family home",
  "housing-society": "Shared rooftop array on an apartment block",
  commercial: "Rooftop array on a factory or warehouse",
};

function HeroMedia({ slug }: { slug: SegmentSlug }) {
  const photo = heroPhoto[slug];
  if (!photo) return <PlaceholderPanel subject={photoSubject[slug]} aspect="3/2" fallback="solid" />;
  return (
    <div className="relative aspect-3/2 overflow-hidden rounded-md">
      <Image
        src={photo.src}
        alt={photo.alt}
        fill
        // Above-the-fold hero image. Next 16 deprecated `priority`; the docs recommend
        // loading="eager" + fetchPriority="high" over `preload` in most cases.
        loading="eager"
        fetchPriority="high"
        sizes="(min-width: 1024px) 40vw, 100vw"
        className="object-cover"
      />
    </div>
  );
}

/** Audience-page opener: breadcrumb, audience eyebrow, H1, lead, estimate CTA and WhatsApp. */
export function SegmentHero({ segment }: { segment: Segment }) {
  const { hero } = segment;
  return (
    <SolutionsHero
      trail={[{ name: "Solutions", href: "/solutions" }]}
      current={segment.label}
      eyebrow={hero.eyebrow}
      title={hero.title}
      lead={hero.lead}
      media={<HeroMedia slug={segment.slug} />}
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

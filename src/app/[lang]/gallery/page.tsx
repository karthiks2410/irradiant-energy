import Image from "next/image";
import { PageHero } from "@/components/pages/PageHero";
import { Section } from "@/components/ui";
import { Reveal } from "@/components/motion/Reveal";
import { BreadcrumbJsonLd } from "@/components/seo/JsonLd";
import { galleryImageKeys } from "@/content/images";
import { getContent } from "@/i18n/content";
import { getLocale } from "@/i18n/server";
import { langParams } from "@/i18n/registry";
import { pageMetadata } from "@/lib/seo";

export const generateStaticParams = () => langParams("gallery");

export async function generateMetadata() {
  const locale = await getLocale();
  const { meta } = getContent(locale).gallery;
  return pageMetadata({ title: meta.title, description: meta.description, path: "/gallery", locale });
}

export default async function GalleryPage() {
  const { gallery, images } = getContent(await getLocale());
  const { breadcrumb, hero, heading } = gallery;
  const photos = galleryImageKeys.map((key) => images[key]);

  return (
    <>
      <BreadcrumbJsonLd items={[{ name: breadcrumb, path: "/gallery" }]} />

      <PageHero current={breadcrumb} eyebrow={hero.eyebrow} title={hero.title} lead={hero.lead} />

      <Section aria-labelledby="gallery-heading">
        <h2 id="gallery-heading" className="sr-only">
          {heading}
        </h2>
        <Reveal>
          <ul className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3">
            {photos.map((photo) => (
              <li key={photo.src}>
                <div className="relative aspect-4/5 overflow-hidden rounded-lg ring-1 ring-carbon/10">
                  <Image
                    src={photo.src}
                    alt={photo.alt}
                    fill
                    sizes="(min-width: 1024px) 31vw, 50vw"
                    style={{ objectPosition: photo.focal }}
                    className="object-cover"
                  />
                </div>
              </li>
            ))}
          </ul>
        </Reveal>
      </Section>
    </>
  );
}

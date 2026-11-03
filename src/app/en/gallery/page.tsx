import Image from "next/image";
import { PageHero } from "@/components/pages/PageHero";
import { Section } from "@/components/ui";
import { Reveal } from "@/components/motion/Reveal";
import { BreadcrumbJsonLd } from "@/components/seo/JsonLd";
import { projectImages, galleryImageKeys } from "@/content/images";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Installation gallery",
  description:
    "Photographs of rooftop solar systems installed by Irradiant Energy — homes, housing societies and commercial buildings across Karnataka.",
  path: "/en/gallery",
});

const photos = galleryImageKeys.map((key) => projectImages[key]);

export default function GalleryPage() {
  return (
    <>
      <BreadcrumbJsonLd items={[{ name: "Gallery", path: "/en/gallery" }]} />

      <PageHero
        current="Gallery"
        eyebrow="Our work"
        title="Rooftop systems we have installed."
        lead="Every photograph is a real installation completed by our team — homes, housing societies and commercial rooftops across Karnataka."
      />

      <Section aria-labelledby="gallery-heading">
        <h2 id="gallery-heading" className="sr-only">
          Installation photographs
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

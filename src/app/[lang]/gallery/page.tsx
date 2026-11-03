import Image from "next/image";
import { PageHero } from "@/components/pages/PageHero";
import { Section } from "@/components/ui";
import { Reveal } from "@/components/motion/Reveal";
import { BreadcrumbJsonLd } from "@/components/seo/JsonLd";
import { projectImages, galleryImageKeys } from "@/content/images";
import { getLocale } from "@/i18n/server";
import { langParams } from "@/i18n/registry";
import { pageMetadata } from "@/lib/seo";

export const generateStaticParams = () => langParams("gallery");

const content = {
  en: {
    breadcrumb: "Gallery",
    eyebrow: "Our work",
    title: "Rooftop systems we have installed.",
    lead: "Every photograph is a real installation completed by our team — homes, housing societies and commercial rooftops across Karnataka.",
    heading: "Installation photographs",
    meta: {
      title: "Installation gallery",
      description:
        "Photographs of rooftop solar systems installed by Irradiant Energy — homes, housing societies and commercial buildings across Karnataka.",
    },
  },
  kn: {
    breadcrumb: "ಗ್ಯಾಲರಿ",
    eyebrow: "ನಮ್ಮ ಕೆಲಸ",
    title: "ನಾವು ಅಳವಡಿಸಿದ ಚಾವಣಿ ವ್ಯವಸ್ಥೆಗಳು.",
    lead: "ಪ್ರತಿಯೊಂದು ಛಾಯಾಚಿತ್ರವೂ ನಮ್ಮ ತಂಡ ಪೂರ್ಣಗೊಳಿಸಿದ ನೈಜ ಅಳವಡಿಕೆ — ಕರ್ನಾಟಕದಾದ್ಯಂತ ಮನೆಗಳು, ಗೃಹ ಸಂಕೀರ್ಣಗಳು ಮತ್ತು ವಾಣಿಜ್ಯ ಚಾವಣಿಗಳು.",
    heading: "ಅಳವಡಿಕೆ ಛಾಯಾಚಿತ್ರಗಳು",
    meta: {
      title: "ಅಳವಡಿಕೆ ಗ್ಯಾಲರಿ",
      description:
        "ಇರ್ರೇಡಿಯಂಟ್ ಎನರ್ಜಿ ಅಳವಡಿಸಿದ ಚಾವಣಿ ಸೌರ ವ್ಯವಸ್ಥೆಗಳ ಛಾಯಾಚಿತ್ರಗಳು — ಕರ್ನಾಟಕದಾದ್ಯಂತ ಮನೆಗಳು, ಗೃಹ ಸಂಕೀರ್ಣಗಳು ಮತ್ತು ವಾಣಿಜ್ಯ ಕಟ್ಟಡಗಳು.",
    },
  },
} as const;

const photos = galleryImageKeys.map((key) => projectImages[key]);

export async function generateMetadata() {
  const locale = await getLocale();
  const { meta } = content[locale];
  return pageMetadata({ title: meta.title, description: meta.description, path: "/gallery", locale });
}

export default async function GalleryPage() {
  const locale = await getLocale();
  const { breadcrumb, eyebrow, title, lead, heading } = content[locale];

  return (
    <>
      <BreadcrumbJsonLd items={[{ name: breadcrumb, path: "/gallery" }]} />

      <PageHero current={breadcrumb} eyebrow={eyebrow} title={title} lead={lead} />

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

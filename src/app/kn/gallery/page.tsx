import Image from "next/image";
import { PageHero } from "@/components/pages/PageHero";
import { Section } from "@/components/ui";
import { Reveal } from "@/components/motion/Reveal";
import { BreadcrumbJsonLd } from "@/components/seo/JsonLd";
import { projectImages, galleryImageKeys } from "@/content/images";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "ಅಳವಡಿಕೆ ಗ್ಯಾಲರಿ",
  description:
    "ಇರ್ರೇಡಿಯಂಟ್ ಎನರ್ಜಿ ಅಳವಡಿಸಿದ ಚಾವಣಿ ಸೌರ ವ್ಯವಸ್ಥೆಗಳ ಛಾಯಾಚಿತ್ರಗಳು — ಕರ್ನಾಟಕದಾದ್ಯಂತ ಮನೆಗಳು, ಗೃಹ ಸಂಕೀರ್ಣಗಳು ಮತ್ತು ವಾಣಿಜ್ಯ ಕಟ್ಟಡಗಳು.",
  path: "/kn/gallery",
  locale: "kn",
});

const photos = galleryImageKeys.map((key) => projectImages[key]);

export default function GalleryPage() {
  return (
    <>
      <BreadcrumbJsonLd items={[{ name: "ಗ್ಯಾಲರಿ", path: "/kn/gallery" }]} />

      <PageHero
        current="ಗ್ಯಾಲರಿ"
        eyebrow="ನಮ್ಮ ಕೆಲಸ"
        title="ನಾವು ಅಳವಡಿಸಿದ ಚಾವಣಿ ವ್ಯವಸ್ಥೆಗಳು."
        lead="ಪ್ರತಿಯೊಂದು ಛಾಯಾಚಿತ್ರವೂ ನಮ್ಮ ತಂಡ ಪೂರ್ಣಗೊಳಿಸಿದ ನೈಜ ಅಳವಡಿಕೆ — ಕರ್ನಾಟಕದಾದ್ಯಂತ ಮನೆಗಳು, ಗೃಹ ಸಂಕೀರ್ಣಗಳು ಮತ್ತು ವಾಣಿಜ್ಯ ಚಾವಣಿಗಳು."
      />

      <Section aria-labelledby="gallery-heading">
        <h2 id="gallery-heading" className="sr-only">
          ಅಳವಡಿಕೆ ಛಾಯಾಚಿತ್ರಗಳು
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

import Image from "next/image";
import { Section, SectionHeading } from "@/components/ui";
import { Reveal } from "@/components/motion/Reveal";
import { homePage } from "@/content/home";
import { projectImages } from "@/content/images";
import { AccentTitle } from "./AccentTitle";

const { projects } = homePage;

/**
 * The owner's own installation photographs, and nothing else.
 *
 * What is deliberately absent. No per-photo title, because none exists. No segment chip, because
 * a chip on a photograph asserts a building type the frame does not prove, and because the
 * prototype's held `proto:projects:demo` is exactly that — a segment label over a demo picture.
 * No capacity, location, date or saving, because none was supplied. No visible caption: `alt`
 * serves the reader who cannot see the photograph, and a sighted visitor gains nothing from a
 * line describing what is already in front of them. No call to action either — the calculator
 * sits directly above this band and the closing pair directly below.
 *
 * Every frame is portrait, so the cells are portrait too rather than cropping six 3:4 pictures
 * into landscape boxes.
 *
 * The grid tiles exactly at both widths, which is what decides its shape. On three columns the
 * lead photograph takes a two-by-two block and the other five fill the remaining five cells of a
 * three-by-three — no gap, no orphan. It leads because it is the only frame with a person in it,
 * the one that shows a company rather than a product, and six equal cells of what is largely the
 * same shot would read as wallpaper. Below `lg` there are two columns and no feature cell, since
 * six equal portraits tile perfectly there and a wide first cell would strand the sixth.
 */
export function ProjectsBand() {
  const [lead, ...rest] = projects.photos.map((key) => projectImages[key]);

  return (
    <Section aria-labelledby="projects-heading">
      <Reveal>
        <SectionHeading
          id="projects-heading"
          align="stacked"
          eyebrow={projects.copy.eyebrow}
          title={<AccentTitle text={projects.copy.title} words={2} />}
        />

        <ul className="mt-12 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3">
          {/* The frame with a person in it, given the room to be looked at. `focal` is tuned so
              his head, shoulder and both hands stay in the crop with the terraces behind him. */}
          <li className="lg:col-span-2 lg:row-span-2">
            <div className="relative aspect-4/5 overflow-hidden rounded-lg ring-1 ring-carbon/10 lg:aspect-auto lg:h-full">
              <Image
                src={lead.src}
                alt={lead.alt}
                fill
                sizes="(min-width: 1024px) 62vw, 50vw"
                style={{ objectPosition: lead.focal }}
                className="object-cover"
              />
            </div>
          </li>

          {rest.map((photo) => (
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
  );
}

import Image from "next/image";
import { Section, SectionHeading } from "@/components/ui";
import { Reveal } from "@/components/motion/Reveal";
import { homePage } from "@/content/home";
import { projectImages } from "@/content/images";
import { AccentTitle } from "./AccentTitle";

const { projects } = homePage;

/**
 * Two of the owner's own installation photographs, and nothing else.
 *
 * What is deliberately absent. No per-photo title, because none exists. No segment chip, because
 * a chip on a photograph asserts a building type the frame does not prove, and because the
 * prototype's held `proto:projects:demo` is exactly that — a segment label over a demo picture.
 * No capacity, location, date or saving, because none was supplied. No visible caption: `alt`
 * serves the reader who cannot see the photograph, and a sighted visitor gains nothing from a
 * line describing what is already in front of them. No call to action either — the calculator
 * sits directly above this band and the closing pair directly below, and a third would be the
 * accessory to take off before leaving the house.
 *
 * The pair is asymmetric on purpose. Seven of the owner's eight frames are the same shot — a
 * low-angle three-quarter view of an array receding to the upper right — so two equal cells
 * side by side read as one picture printed twice, and matching their horizons would make that
 * worse rather than better. A tall cell against a smaller square dropped below it breaks the
 * diptych, and the eye reads two photographs instead of a repeat.
 *
 * Surface: canvas, the Section default. The calculator above paints itself dark and the closing
 * band below is dark, so canvas is the only value that alternates on both sides. It also suits
 * the pictures: both carry a large pale sky, which meets a dark surface at a hard edge and makes
 * the frame read as pasted on, while against canvas the sky runs into the page.
 *
 * Loading: seventh band of nine, far below the fold, so both images take the lazy default. Next
 * 16 deprecated `priority`; eager loading here would compete with the hero for bandwidth.
 */
export function ProjectsBand() {
  const [tall, small] = projects.photos.map((key) => projectImages[key]);

  return (
    <Section aria-labelledby="projects-heading">
      <Reveal>
        <SectionHeading
          id="projects-heading"
          align="split"
          eyebrow={projects.copy.eyebrow}
          title={<AccentTitle text={projects.copy.title} words={2} />}
          lead={projects.copy.lead}
        />

        <div className="mt-12 grid-page gap-y-8">
          {/* The frame with a person in it, given the room to be looked at. `focal` is tuned so
              his head, shoulder and both hands stay inside the crop along with the terraces
              behind him; a landscape window loses the person at every value. */}
          <div className="col-span-4 md:col-span-5 lg:col-span-7">
            <div className="relative aspect-4/5 overflow-hidden rounded-lg ring-1 ring-carbon/10 lg:aspect-square">
              <Image
                src={tall.src}
                alt={tall.alt}
                fill
                sizes="(min-width: 1024px) 58vw, (min-width: 768px) 62vw, 100vw"
                style={{ objectPosition: tall.focal }}
                className="object-cover"
              />
            </div>
          </div>

          {/* Bottom-aligned with its neighbour from lg rather than top-aligned. The tops then
              sit apart by the difference in height, which is what stops the two horizons lining
              up and the pair reading as one panorama cut in half — and unlike a fixed top margin
              it leaves no dead space under the smaller frame at any width. */}
          <div className="col-span-4 md:col-span-3 lg:col-span-4 lg:col-start-9 lg:flex lg:h-full lg:items-end">
            <div className="relative aspect-4/5 w-full overflow-hidden rounded-lg ring-1 ring-carbon/10">
              <Image
                src={small.src}
                alt={small.alt}
                fill
                sizes="(min-width: 1024px) 32vw, (min-width: 768px) 36vw, 100vw"
                style={{ objectPosition: small.focal }}
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </Reveal>
    </Section>
  );
}

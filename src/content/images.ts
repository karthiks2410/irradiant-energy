/**
 * Photography of Irradiant Energy's own installations, supplied by the owner on 2026-09-20.
 *
 * These are the company's own photographs of real completed work — no stock, no AI, no licensing
 * question (which closes the copyright exposure raised in docs/discovery/13-asset-audit.md and
 * the production audit). They may be shown as our installations.
 *
 * Originals: 5712x4284 HEIC from the owner's phone. They carry an EXIF rotation tag, so the
 * stored buffer is landscape while a browser renders them portrait. The rotation is baked in
 * during conversion, so the width/height below are exactly what the browser paints — next/image
 * needs that to be true or it reserves the wrong space.
 *
 * Exported at 2600px wide. The first pass used 1800, which is less than a 1440px laptop needs at
 * device-pixel-ratio 2 for a full-bleed hero (about 2880), so the hero was being upscaled on
 * every retina screen. These are source files, not what ships: next/image resizes per viewport.
 *
 * Every frame is portrait and every landscape slot crops it, so each entry carries its own
 * `focal` (`object-position`). A centred crop lands on bare panel texture in most of these
 * shots — the context (roof, horizon, sky, surroundings) sits in the upper third. Retune
 * `focal` against the real slot on screen before changing it; the right value differs between
 * the full-bleed home stage and the 3:2 card on an audience page.
 */

export interface ProjectImage {
  readonly src: `/images/projects/${string}`;
  /** Intrinsic size as rendered (rotation already applied). */
  readonly width: number;
  readonly height: number;
  readonly alt: string;
  /** What the shot shows, for captions and the photo brief. */
  readonly subject: string;
  /**
   * `object-position` for a card-shaped crop of this portrait frame (roughly 3:2, as on the
   * audience-page heroes). A blind centre crop lands on bare panel texture in most of these
   * shots; this pulls the window onto the band that carries the roof, horizon and surroundings.
   */
  readonly focal: string;
  /**
   * `object-position` for the full-bleed home stage (roughly 16:10), where the window is much
   * shallower and the same percentage lands somewhere else entirely. Only set where the two
   * genuinely differ; `focal` is the fallback.
   */
  readonly focalWide?: string;
}

export const projectImages = {
  duskSkyline: {
    src: "/images/projects/ie-2095.webp",
    width: 2600,
    height: 3467,
    alt: "Rooftop solar panels catching the last light at dusk, with a low skyline and a dramatic cloudscape behind them.",
    subject: "Rooftop array at dusk over a low skyline",
    focal: "center 58%",
  },
  metalRoofArray: {
    src: "/images/projects/ie-2151.webp",
    width: 2600,
    height: 3467,
    alt: "A solar array laid across a metal industrial roof, with open green land beyond the boundary wall.",
    subject: "Rooftop array on a metal roof",
    // The array in this frame begins 43% down, so 30% left a strip of construction mesh and
    // rubble across the top of every card. Below 20% the whole context band is in view instead.
    focal: "center 10%",
  },
  palmRooftop: {
    src: "/images/projects/ie-2006.webp",
    width: 2600,
    height: 3467,
    alt: "Rooftop solar panels on a home, framed by coconut palms and neighbouring houses under a blue sky.",
    subject: "Home rooftop array among coconut palms",
    focal: "center 38%",
  },
  industrialRoofArray: {
    src: "/images/projects/ie-2159.webp",
    width: 2600,
    height: 3467,
    alt: "A solar array laid across a metal industrial roof, with a transmission tower, tree line and open land beyond.",
    subject: "Industrial metal-roof array beside the grid connection",
    focal: "center 38%",
    // The full-bleed stage is much shallower: 38% there puts the site boundary across the
    // middle of the frame, so the wide crop sits lower, on the array and the ribbed roof.
    focalWide: "center 70%",
  },
  commercialHeroArray: {
    src: "/images/projects/ie-2006.webp",
    width: 2600,
    height: 1950,
    alt: "Solar panels installed on a commercial rooftop.",
    subject: "Commercial rooftop solar installation",
    focal: "center 50%",
    focalWide: "center 50%",
  },
  hillsideArray: {
    src: "/images/projects/ie-2032.webp",
    width: 2600,
    height: 3467,
    alt: "Solar panels angled across a rooftop, with a wooded hillside and palms rising behind.",
    subject: "Rooftop array against a wooded hillside",
    // Only the top 24% of this frame is anything but panel, so 30% rendered bare glass. This is
    // the flattest and dimmest of the eight and is not used anywhere.
    focal: "center 0%",
  },
  roadsideArray: {
    src: "/images/projects/ie-2140.webp",
    width: 2600,
    height: 3467,
    alt: "Rooftop solar panels beside power lines, with open country and a eucalyptus stand behind.",
    subject: "Rooftop array beside the incoming grid connection",
    focal: "center 32%",
  },
  terraceArray: {
    src: "/images/projects/ie-2100.webp",
    width: 2600,
    height: 3467,
    alt: "Solar panels covering a terrace roof, with neighbouring rooftops stretching to the horizon.",
    subject: "Terrace array over a dense neighbourhood",
    focal: "center 42%",
  },
  installerAtWork: {
    src: "/images/projects/ie-2134.webp",
    width: 2600,
    height: 3467,
    // PROPOSED CONTENT — REQUIRES CLIENT APPROVAL (alt). It describes only what is in the
    // frame: the previous wording said he was "steadying" the panel, which infers what he is
    // doing from a still. "One of our installers" is the owner's own statement that this is our
    // work. He is the only recognisable person in the set, so confirm his consent before this
    // ships.
    alt: "One of our installers with both hands on the frame of a rooftop solar panel, with neighbouring terraces, water tanks and a low treeline behind.",
    subject: "Installer working on a terrace array",
    // Tuned for the square and 4:5 windows the projects band uses, where his head, shoulder and
    // both hands are all inside the crop with the terraces still above. A 3:2 window needs about
    // 65% instead: the old 40% cut his head in half at the bottom edge.
    focal: "center 46%",
  },
} as const satisfies Record<string, ProjectImage>;


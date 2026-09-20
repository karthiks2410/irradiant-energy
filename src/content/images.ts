/**
 * Photography of Irradiant Energy's own installations, supplied by the owner on 2026-09-20.
 *
 * These are the company's own photographs of real completed work — no stock, no AI, no licensing
 * question (which closes the copyright exposure raised in docs/discovery/13-asset-audit.md and
 * the production audit). They may be shown as our installations.
 *
 * Originals: HEIC from the owner's phone, 4:3. They carry an EXIF rotation tag, so the stored
 * buffer is landscape while a browser renders them portrait. The rotation is baked in during
 * conversion (sharp `.rotate()` with metadata stripped), so the width/height below are exactly
 * what the browser paints — next/image needs that to be true or it reserves the wrong space.
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
    width: 1800,
    height: 2400,
    alt: "Rooftop solar panels catching the last light at dusk, with the Bengaluru skyline and a dramatic cloudscape behind them.",
    subject: "Rooftop array at dusk over the Bengaluru skyline",
    focal: "center 58%",
  },
  metalRoofArray: {
    src: "/images/projects/ie-2151.webp",
    width: 1800,
    height: 2400,
    alt: "A large solar array laid across a metal industrial roof, with open green land beyond the boundary wall.",
    subject: "Commercial rooftop array on a metal roof",
    focal: "center 30%",
  },
  palmRooftop: {
    src: "/images/projects/ie-2006.webp",
    width: 1800,
    height: 2400,
    alt: "Rooftop solar panels on a home, framed by coconut palms and neighbouring houses under a blue sky.",
    subject: "Home rooftop array among coconut palms",
    focal: "center 38%",
  },
  industrialRoofArray: {
    src: "/images/projects/ie-2159.webp",
    width: 1800,
    height: 2400,
    alt: "A solar array laid across a metal industrial roof, with a transmission tower, tree line and open land beyond.",
    subject: "Industrial metal-roof array beside the grid connection",
    focal: "center 38%",
    // The full-bleed stage is much shallower: 38% there puts the site boundary across the
    // middle of the frame, so the wide crop sits lower, on the array and the ribbed roof.
    focalWide: "center 70%",
  },
  hillsideArray: {
    src: "/images/projects/ie-2032.webp",
    width: 2000,
    height: 2667,
    alt: "Solar panels angled across a rooftop, with a wooded hillside and palms rising behind.",
    subject: "Rooftop array against a wooded hillside",
    focal: "center 30%",
  },
  roadsideArray: {
    src: "/images/projects/ie-2140.webp",
    width: 1800,
    height: 2400,
    alt: "Rooftop solar panels beside power lines, with open country and a eucalyptus stand behind.",
    subject: "Rooftop array beside the incoming grid connection",
    focal: "center 32%",
  },
  terraceArray: {
    src: "/images/projects/ie-2100.webp",
    width: 1800,
    height: 2400,
    alt: "Solar panels covering a terrace roof, with neighbouring rooftops stretching to the horizon.",
    subject: "Terrace array over a dense neighbourhood",
    focal: "center 42%",
  },
  installerAtWork: {
    src: "/images/projects/ie-2134.webp",
    width: 1800,
    height: 2400,
    alt: "An Irradiant installer steadying a panel on a terrace array, with the surrounding neighbourhood behind.",
    subject: "Installer working on a terrace array",
    focal: "center 40%",
  },
} as const satisfies Record<string, ProjectImage>;


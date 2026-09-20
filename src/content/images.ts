/**
 * Template photography carried over from the owner's HTML prototype (docs/discovery/06 §1.3).
 * Temporary hero/section imagery only: never present it as projects, customers or team
 * (decisions.md D-009; brand PDF pp.59–61). Rights are unverified, so every entry is flagged.
 *
 * TODO(photography): replace with approved photos and delete public/images/template/.
 */

export interface TemplateImage {
  readonly src: `/images/template/${string}`;
  readonly width: number;
  readonly height: number;
  readonly alt: string;
  /** What the shot shows, for the photo brief and placeholder captions. */
  readonly subject: string;
  /** Marks template imagery. Not the next/image `placeholder` prop: pass src/width/height/alt individually. */
  readonly placeholder: true;
}

export const templateImages = {
  heroHomeFamily: {
    src: "/images/template/hero-home-family.webp",
    width: 1942,
    height: 809,
    alt: "A parent and child in front of a house with rooftop solar panels at sunset, with a solar farm and a city skyline behind them.",
    subject: "Home rooftop solar with a family in the garden",
    placeholder: true,
  },
  heroCityCampus: {
    src: "/images/template/hero-city-campus.webp",
    width: 1942,
    height: 809,
    alt: "Aerial view of office and warehouse rooftops covered in solar panels, with a city skyline at sunset.",
    subject: "Business campus rooftops with solar arrays",
    placeholder: true,
  },
  heroCommercialRooftop: {
    src: "/images/template/hero-commercial-rooftop.webp",
    width: 1942,
    height: 809,
    alt: "A large commercial building with a rooftop solar array, seen across its car park at sunrise.",
    subject: "Commercial rooftop solar at sunrise",
    placeholder: true,
  },
  /** Lower-resolution copy of the home-family scene; fits 16:7 cards and section images. */
  homeFamilyWide: {
    src: "/images/template/home-family-wide.webp",
    width: 1400,
    height: 583,
    alt: "A parent and child in front of a house with rooftop solar panels at sunset, with a solar farm and a city skyline behind them.",
    subject: "Home rooftop solar with a family in the garden (wide crop)",
    placeholder: true,
  },
} as const satisfies Record<string, TemplateImage>;

/** The prototype's three hero scenes, in its order. A static hero uses the first; no autoplay (report §5.8 S1). */
export const heroSlides: readonly TemplateImage[] = [
  templateImages.heroHomeFamily,
  templateImages.heroCityCampus,
  templateImages.heroCommercialRooftop,
];

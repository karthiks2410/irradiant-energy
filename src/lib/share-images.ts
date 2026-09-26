import type { Locale } from "@/i18n/config";
import type { Content } from "@/i18n/content";
import type { RouteKey } from "@/i18n/registry";

/**
 * Link-preview images: the picture WhatsApp, LinkedIn, X, Facebook and iMessage show when
 * someone shares a page.
 *
 * One static file per page and per locale, in `public/share/<locale>/<page>.jpg`, rendered by
 * `npm run build:share` (scripts/build-share-images.ts) and committed. They are files rather
 * than `next/og` routes because Satori cannot shape Kannada: conjuncts and vowel signs come out
 * as separated glyphs. The generator renders the same headline in Chromium, with the site's own
 * self-hosted Kannada face, so the Kannada card reads as correctly as the Kannada page.
 *
 * This module is the one list both sides read: the generator renders exactly these cards, and
 * `pageMetadata` (src/lib/seo.ts) points each page at its card. `src/lib/share-images.test.ts`
 * fails when a page would reference a file that is missing, the wrong size or too heavy.
 *
 * Plain data and type-only imports on purpose: Node runs the generator with type stripping, and
 * nothing here may pull a content module into a client bundle.
 */

/** Open Graph's recommended size, which is also X's summary_large_image ratio (1.91:1). */
export const SHARE_IMAGE_SIZE = { width: 1200, height: 630 } as const;

export const SHARE_IMAGE_TYPE = "image/jpeg";

/**
 * Hard ceiling per file. WhatsApp drops the picture from a preview when the image is larger than
 * about 300 KB and shows a bare link instead; the generator aims well under this.
 */
export const SHARE_IMAGE_MAX_BYTES = 300_000;

type PhotoKey = keyof Content["images"];

/** A photograph on the card, with the crop that suits a 1200×630 frame. */
export interface SharePhoto {
  readonly key: PhotoKey;
  /**
   * `object-position` for this frame. Every photograph is portrait, so a 1.91:1 window keeps a
   * thin horizontal band; the `focal` values in src/content/images.ts were tuned for 3:2 and
   * 16:10 windows and land somewhere else here. The band is chosen so the horizon sits in the
   * upper half, above the copy panel, and the array fills the flanks either side of it.
   */
  readonly position: string;
  /** Enlarge around `position`, to push something untidy at one edge out of the frame. */
  readonly zoom?: number;
}

/**
 * What one card shows. Every string is the page's own copy, read from the locale's merged
 * content, so a card never says anything its page does not.
 */
export interface ShareCard {
  /** The small label above the headline: the page's eyebrow, or its breadcrumb name. */
  readonly eyebrow: string;
  /** The page's h1, as the page renders it. */
  readonly title: string;
  /** The run of `title` the page paints green, when it paints one. */
  readonly accent?: string;
  /** One photograph, or several side by side. */
  readonly photos: readonly SharePhoto[];
}

/**
 * Photographs, per card: the owner's own installations (src/content/images.ts). Three are left
 * out on purpose. `installerAtWork` shows the one recognisable person in the set, whose consent
 * is not yet confirmed, and a link preview travels further than any page. `hillsideArray` is the
 * dimmest frame and is not used anywhere on the site. `metalRoofArray` has construction mesh
 * and rubble across the only band a 1.91:1 crop can take.
 */
const photo = (key: PhotoKey, position: string, zoom?: number): SharePhoto => ({ key, position, zoom });

// The industrial frame has site mesh and rubble at its right-hand edge, level with the top of
// the array; anchoring left and enlarging slightly takes it out of the frame.
const industrial = photo("industrialRoofArray", "left 37%", 1.35);

const segmentCard = (segment: Content["segments"][keyof Content["segments"]], photos: readonly SharePhoto[]): ShareCard => ({
  eyebrow: segment.hero.eyebrow,
  title: segment.hero.title,
  photos,
});

const SHARE_CARDS = {
  // The home hero's first scene: its h1, its eyebrow and its photograph.
  home: (c: Content): ShareCard => ({
    eyebrow: c.home.hero.eyebrow,
    title: c.home.hero.title,
    photos: [photo("duskSkyline", "center 55%")],
  }),
  // The hub serves all three audiences, so it shows the three audience pages' photographs.
  solutions: (c: Content): ShareCard => ({
    eyebrow: c.solutionsShared.hub.breadcrumb,
    title: c.home.audiencePaths.copy.title,
    accent: c.home.audiencePaths.copy.accent,
    photos: [photo("palmRooftop", "center 42%"), photo("terraceArray", "center 50%"), industrial],
  }),
  // The three audience pages use the photograph their own hero shows (SegmentHero.tsx).
  "solutions-home": (c: Content): ShareCard => segmentCard(c.segments.home, [photo("palmRooftop", "center 42%")]),
  "solutions-housing-society": (c: Content): ShareCard =>
    segmentCard(c.segments["housing-society"], [photo("terraceArray", "center 50%")]),
  "solutions-commercial": (c: Content): ShareCard => segmentCard(c.segments.commercial, [industrial]),
  "get-quote": (c: Content): ShareCard => ({
    eyebrow: c.quote.hero.eyebrow,
    title: c.quote.hero.title,
    photos: [photo("roadsideArray", "center 32%")],
  }),
  about: (c: Content): ShareCard => ({
    eyebrow: c.about.mission.eyebrow,
    title: c.about.mission.title,
    accent: c.about.mission.accent,
    photos: [photo("palmRooftop", "center 34%")],
  }),
  // "Your roof", over a terrace array with the neighbourhood's roofs running to the horizon.
  contact: (c: Content): ShareCard => ({
    eyebrow: c.contact.breadcrumb,
    title: c.contact.hero.title,
    accent: c.contact.hero.accent,
    photos: [photo("terraceArray", "center 44%")],
  }),
} as const satisfies Partial<Record<RouteKey, (c: Content) => ShareCard>>;

/** A page with a card of its own. */
export type SharePage = keyof typeof SHARE_CARDS;

export const SHARE_PAGES = Object.keys(SHARE_CARDS) as readonly SharePage[];

function isSharePage(key: string): key is SharePage {
  return Object.hasOwn(SHARE_CARDS, key);
}

/**
 * The card a route uses. The legal notices, and anything outside the registry (the 404 page),
 * use the home card: a link to the privacy notice needs a picture, not one of its own.
 */
export function sharePageFor(key: RouteKey | null | undefined): SharePage {
  return key && isSharePage(key) ? key : "home";
}

export function shareCard(page: SharePage, content: Content): ShareCard {
  return SHARE_CARDS[page](content);
}

/**
 * The domain printed on every card, read from the owner-confirmed contact address rather than
 * typed again, so the card and the footer cannot disagree about where the site lives.
 */
export function shareDomain(content: Content): string {
  const host = content.site.contact.email.value.split("@")[1];
  if (!host) throw new Error("share-images: site.contact.email has no domain");
  return host;
}

/**
 * Everything a card's picture depends on apart from the template: what it says and which
 * photographs it shows. The generator records this for every file it writes
 * (share-images.manifest.json), and the unit test compares it with what the content says now —
 * so a headline edited without re-running `npm run build:share` fails the tests instead of
 * leaving a preview that no longer matches its page.
 */
export function shareCardRecord(page: SharePage, content: Content) {
  const { eyebrow, title, accent, photos } = shareCard(page, content);
  return {
    eyebrow,
    title,
    ...(accent ? { accent } : {}),
    domain: shareDomain(content),
    photos: photos.map(({ key, position, zoom }) => ({
      src: content.images[key].src,
      position,
      ...(zoom ? { zoom } : {}),
    })),
  };
}

/** Site path of a card, e.g. ("about", "kn") -> "/share/kn/about.jpg". */
export function shareImagePath(page: SharePage, locale: Locale): `/share/${Locale}/${SharePage}.jpg` {
  return `/share/${locale}/${page}.jpg`;
}

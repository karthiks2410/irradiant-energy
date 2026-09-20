/**
 * Solar audience pages (D-009: rooftop solar only). Route params resolve through
 * `getSegment`; unknown slugs return undefined so the page can call notFound().
 */

import { homePage } from "@/content/home";
import type { Segment, SegmentSlug } from "@/content/types";
import { commercialSegment } from "./commercial";
import { homeSegment } from "./home";
import { housingSocietySegment } from "./housing-society";

export {
  closingCta,
  faqCardLabels,
  heroCtas,
  segmentHref,
  sharedHeld,
  systemTypes,
  systemTypesAnchor,
  systemTypesCopy,
  whatsappPrompts,
} from "./shared";

export { homeSegment, housingSocietySegment, commercialSegment };

export const segments: Readonly<Record<SegmentSlug, Segment>> = {
  home: homeSegment,
  "housing-society": housingSocietySegment,
  commercial: commercialSegment,
};

export const segmentSlugs = ["home", "housing-society", "commercial"] as const satisfies readonly SegmentSlug[];

export const isSegmentSlug = (value: string): value is SegmentSlug =>
  (segmentSlugs as readonly string[]).includes(value);

export const getSegment = (slug: string): Segment | undefined => (isSegmentSlug(slug) ? segments[slug] : undefined);

/** Noun for the system-chooser heading ("Which solar system suits your {noun}?"). */
export const segmentNoun: Readonly<Record<SegmentSlug, string>> = {
  home: "home",
  "housing-society": "housing society",
  commercial: "business",
};

/**
 * Owner-approved proof cards from the prototype, for pages whose legacy trust cards were
 * all held by the status filter (today: commercial).
 */
export const proofFallback = homePage.why;

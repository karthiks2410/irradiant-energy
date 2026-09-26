/**
 * Solar audience pages (D-009: rooftop solar only). Route params resolve through
 * `isSegmentSlug`; an unknown slug lets the page call notFound().
 *
 * Page code does NOT read the segments from here — it reads the localized copy through
 * `getContent(locale).segments` (src/i18n/content.ts), which is the same object with the
 * Kannada overlay merged in on `/kn`. What this module exports is the English source those
 * overlays are built and type-checked against, plus the slug helpers, which are locale-neutral.
 */

import type { SegmentSlug } from "@/content/types";
import { segments } from "./segments";

export {
  faqCardLabels,
  heroCtas,
  segmentHref,
  sharedHeld,
  solutionsShared,
  systemTypesAnchor,
} from "./shared";

export { segments };
export { homeSegment } from "./home";
export { housingSocietySegment } from "./housing-society";
export { commercialSegment } from "./commercial";

export const segmentSlugs = ["home", "housing-society", "commercial"] as const satisfies readonly SegmentSlug[];

export const isSegmentSlug = (value: string): value is SegmentSlug =>
  (segmentSlugs as readonly string[]).includes(value);

export const getSegment = (slug: string) => (isSegmentSlug(slug) ? segments[slug] : undefined);

/**
 * The three audience pages, gathered.
 *
 * Its own module rather than a const in `index.ts` so the Kannada generator can name it as an
 * import path (`scripts/build-kn-content.ts` MODULES); `index.ts` re-exports it, so nothing else
 * changes. `as const` is load-bearing: `Translation<typeof segments>` derives the overlay's shape
 * — and the length of every list on all three pages — from this literal.
 */

import type { Segment, SegmentSlug } from "@/content/types";
import { commercialSegment } from "./commercial";
import { homeSegment } from "./home";
import { housingSocietySegment } from "./housing-society";

export const segments = {
  home: homeSegment,
  "housing-society": housingSocietySegment,
  commercial: commercialSegment,
} as const satisfies Readonly<Record<SegmentSlug, Segment>>;

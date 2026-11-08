/**
 * /gallery — every installation photograph the owner has supplied (src/content/images.ts),
 * in one grid. Copy written by the owner with the gallery (#44, 2026-11-03); the "who we work
 * with" line repeats the owner-confirmed fact on /about (about.ts `facts`).
 */

import type { SectionCopy } from "@/content/types";

/** The page's own <title> and meta description, here so the Kannada overlay can reach them. */
const meta = {
  title: "Installation gallery",
  description:
    "Photographs of rooftop solar systems installed by Irradiant Energy — homes, housing societies and commercial buildings across Karnataka.",
  source: "owner · gallery PR #44 (2026-11-03)",
  status: "owner-approved-template",
} as const;

/** Breadcrumb and JSON-LD name for this page. */
const breadcrumb = "Gallery";

const hero = {
  eyebrow: "Our work",
  title: "Rooftop systems we have installed.",
  lead: "Every photograph is a real installation completed by our team — homes, housing societies and commercial rooftops across Karnataka.",
  source: "owner · gallery PR #44 (2026-11-03)",
  status: "owner-approved-template",
} as const satisfies SectionCopy;

/** Visually hidden heading over the grid, for screen-reader navigation. */
const heading = "Installation photographs";

export const galleryPage = { meta, breadcrumb, hero, heading } as const;

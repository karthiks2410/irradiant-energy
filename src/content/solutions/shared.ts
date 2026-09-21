/**
 * Copy shared by the three solar audience pages (inventory §3.3, the legacy
 * `SegmentLandingPage` template) plus small helpers that read site.ts, so the pages
 * cannot drift from the navigation.
 */

import { primaryCta, solutions, type NavLink } from "@/content/site";
import type { Cta, HeldItem, SectionCopy, SegmentSlug, SystemType, TextItem } from "@/content/types";

export const segmentHref = (slug: SegmentSlug) => `/solutions/solar/${slug}`;

/** Nav label and menu description for a segment (inventory G-02), read from site.ts. */
export function navFor(slug: SegmentSlug): NavLink {
  const href = segmentHref(slug);
  const item = solutions.items.find((i) => i.href === href);
  if (!item) throw new Error(`site.ts has no Solutions nav item for ${href}`);
  return item;
}

/**
 * Hero buttons (inventory P-SG-2). The primary label is the site-wide CTA from
 * site.ts; the `segment` query value is the segment slug, which the calculator
 * uses to preselect the property type.
 */
export const heroCtas = (slug: SegmentSlug): { primary: Cta; secondary: Cta } => ({
  primary: {
    label: primaryCta.label,
    href: `${primaryCta.href}?segment=${slug}`,
    source: "site.ts primaryCta · P-SG-2 (pattern)",
    status: "proposed",
  },
  secondary: {
    label: "See which system fits you",
    href: `#${systemTypesAnchor}`,
    source: "P-SG-2",
    status: "verified-live",
  },
});

export const systemTypesAnchor = "system-types";

/** Section head for the system chooser; `noun` is "home", "housing society" or "business". */
export const systemTypesCopy = (noun: string): SectionCopy => ({
  eyebrow: "Choose what fits",
  title: `Which solar system suits your ${noun}?`,
  lead: "Not sure which is right? Our team will help you decide on the call.",
  source: "P-SG-3 · 03 §3.2",
  status: "verified-live",
});

/** Card copy F-54 and the one-liners P-ST-2 (both VERIFIED-LIVE). No sub-page links: the stubs are gone. */
export const systemTypes: readonly SystemType[] = [
  {
    id: "on-grid",
    name: "On-Grid",
    plainName: "Stay connected, sell extra power",
    description: "Connected to utility grid, export excess power",
    plainDescription:
      "Your roof powers the home; the surplus goes to the grid as a bill credit. Most popular for homes with steady electricity.",
    source: "F-54 · P-ST-2 · OLD solutions-data.ts:60-68",
    status: "verified-live",
  },
  {
    id: "off-grid",
    name: "Off-Grid",
    plainName: "Be fully independent with batteries",
    description: "Independent system with battery backup",
    plainDescription:
      "Your roof + a battery pack. Zero dependence on the grid, even during outages. Right for places with bad supply or remote properties.",
    source: "F-54 · P-ST-2 · OLD solutions-data.ts:69-77",
    status: "verified-live",
  },
  {
    id: "hybrid",
    name: "Hybrid",
    plainName: "Best of both — power + backup",
    description: "Best of both - grid + battery storage",
    plainDescription:
      "Run on solar by day, store the extra in batteries, and fall back to the grid only if you need to. The most resilient option.",
    source: "F-54 · P-ST-2 · OLD solutions-data.ts:78-86",
    status: "verified-live",
  },
];

/** Closing band on every audience page (inventory P-SG-6). The "free" promises were owner-confirmed 2026-09-21. */
export const closingCta: { copy: SectionCopy; primary: (slug: SegmentSlug) => Cta } = {
  copy: {
    title: "Ready to see your savings?",
    lead: "Free site visit. Free quote. Zero pressure.",
    source: "P-SG-6 · 03 §3.2",
    status: "verified-live",
  },
  primary: (slug) => heroCtas(slug).primary,
};

/** Buttons on the "Still have questions?" card (inventory P-SG-5). */
export const faqCardLabels = { whatsappLabel: "Chat on WhatsApp", callLabel: "Call us" } as const;

/** Segment WhatsApp prefills W6–W8 (VERIFIED-LIVE). No personal data is ever added to them. */
export const whatsappPrompts: Record<SegmentSlug, TextItem> = {
  home: {
    text: "Hi! I have a question about home solar — could you help?",
    source: "W6",
    status: "verified-live",
  },
  "housing-society": {
    text: "Hi! Our society is exploring rooftop solar — could you share a proposal we can take to the AGM?",
    source: "W7",
    status: "verified-live",
  },
  commercial: {
    text: "Hi! We're a business exploring rooftop solar — can you share a CAPEX vs OPEX comparison for our facility?",
    source: "W8",
    status: "verified-live",
  },
};

/** Held items from the shared template. */
export const sharedHeld: readonly HeldItem[] = [
  {
    id: "shared:lead-form:consent",
    where: "lead form, under the submit button",
    text: "By submitting, you agree to be contacted by our team via WhatsApp or phone. We don't spam, sell your data, or share with third parties.",
    reason:
      "Notice-at-collection wording is for counsel (DPDP); 'don't share with third parties' must match the processors actually used (Resend, Vercel). The form notice ships from the legal module once counsel drafts it.",
    ref: "P-SG-4 · CL-25 · 17 §6.2",
  },
  {
    id: "shared:system-types:learn-more",
    where: "system-type cards",
    text: "Learn more → /solutions/solar/{segment}/{type}",
    reason: "Every destination was a 'Coming Soon' stub. The cards render without links until real system pages exist.",
    ref: "P-SG-3 · P-ST-1",
  },
  {
    id: "shared:system-types:audience",
    where: "system-type cards on the housing-society and business pages",
    text: "Your roof powers the home … Most popular for homes with steady electricity.",
    reason:
      "The plain-language card bodies were written for homeowners but shown to all three audiences. Those pages show the card headline alone.",
    ref: "P-SG-3 · 03 §3.3",
  },
  {
    id: "shared:stat-strip",
    where: "stat strip on every audience page",
    text: "Powering homes across India. — Homes solarized · Power installed · Subsidy delivered · Cities served",
    reason: "Disabled in the legacy code with the note that no verified ops numbers exist. Publish only from an installation register.",
    ref: "P-SG-7 · R-12 · CL-03",
  },
];

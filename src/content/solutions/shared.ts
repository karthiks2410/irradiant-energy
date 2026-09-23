/**
 * Copy shared by the /solutions hub and the three solar audience pages (inventory §3.3, the
 * legacy `SegmentLandingPage` template) plus small helpers that read site.ts, so the pages
 * cannot drift from the navigation.
 *
 * Everything a reader sees is in `solutionsShared`, one `as const` object, because that is what
 * the Kannada overlay is typed against (`src/content/kn/solutions-shared.ts`). The helpers below
 * build hrefs and assemble the per-segment CTA objects; they no longer build SENTENCES.
 *
 * Why that distinction matters: "Which solar system suits your {noun}?" used to be a template
 * literal in TypeScript, so the word order was English and only the noun was data. Kannada needs
 * the noun in the dative — ನಿಮ್ಮ ಮನೆಗೆ / ಅಪಾರ್ಟ್‌ಮೆಂಟ್‌ಗೆ / ವ್ಯಾಪಾರಕ್ಕೆ — and the three nouns do
 * not even share one suffix (-ಗೆ vs -ಕ್ಕೆ), so no glued ending works. Both the frame AND the noun
 * are therefore copy: each locale writes its own frame around a `{noun}` hole and its own bare
 * noun, and `fill()` (src/i18n/format.ts) puts them together at render. The reviewers' note on
 * unit u583 is the source of that shape.
 */

import { primaryCta, solutions, type NavLink } from "@/content/site";
import type { Cta, HeldItem, SectionCopy, SegmentSlug, Sourced, SystemType, TextItem } from "@/content/types";

export const segmentHref = (slug: SegmentSlug) => `/solutions/solar/${slug}`;

/** Nav label and menu description for a segment (inventory G-02), read from site.ts. */
export function navFor(slug: SegmentSlug): NavLink {
  const href = segmentHref(slug);
  const item = solutions.items.find((i) => i.href === href);
  if (!item) throw new Error(`site.ts has no Solutions nav item for ${href}`);
  return item;
}

export const systemTypesAnchor = "system-types";

/** Card copy F-54 and the one-liners P-ST-2 (both VERIFIED-LIVE). No sub-page links: the stubs are gone. */
const systemTypes = [
  {
    id: "on-grid",
    // `label`, not `name`: a name is English-owned by the overlay type (FIXED_KEYS), and these
    // three are translated technical labels, not proper names — the home page's system tags carry
    // the same words in Kannada.
    label: "On-Grid",
    plainName: "Stay connected, sell extra power",
    description: "Connected to utility grid, export excess power",
    plainDescription:
      "Your roof powers the home; the surplus goes to the grid as a bill credit. Most popular for homes with steady electricity.",
    source: "F-54 · P-ST-2 · OLD solutions-data.ts:60-68",
    status: "verified-live",
  },
  {
    id: "off-grid",
    label: "Off-Grid",
    plainName: "Be fully independent with batteries",
    description: "Independent system with battery backup",
    plainDescription:
      "Your roof + a battery pack. Zero dependence on the grid, even during outages. Right for places with bad supply or remote properties.",
    source: "F-54 · P-ST-2 · OLD solutions-data.ts:69-77",
    status: "verified-live",
  },
  {
    id: "hybrid",
    label: "Hybrid",
    plainName: "Best of both — power + backup",
    description: "Best of both - grid + battery storage",
    plainDescription:
      "Run on solar by day, store the extra in batteries, and fall back to the grid only if you need to. The most resilient option.",
    source: "F-54 · P-ST-2 · OLD solutions-data.ts:78-86",
    status: "verified-live",
  },
] as const satisfies readonly SystemType[];

export const solutionsShared = {
  /** The /solutions hub: a junction page, so its own copy is short. */
  hub: {
    // PROPOSED CONTENT — REQUIRES CLIENT APPROVAL (place qualifier). Karnataka is owner-stated
    // (content-inventory F-40); docs/discovery/16-seo-deep-dive.md H3 prescribes it here.
    meta: {
      title: "Solar solutions across Karnataka",
      description:
        "Rooftop solar for homes, housing societies and businesses across Karnataka. Choose your audience to see how the work runs and which system fits.",
      source: "16 §H3 · F-40",
      status: "proposed",
    },
    /** Breadcrumb and JSON-LD name for this page; the nav label, kept in one place. */
    breadcrumb: "Solutions",
    /** `aria-label` on the audience grid. */
    sectionLabel: "Solar solutions by audience",
    /** Link line on an audience card. `{noun}` is `segmentNoun` below. */
    cardCta: "Explore solar for your {noun}",
  },

  /**
   * The segment noun, bare and caseless, for the two frames that take one.
   *
   * Not a label ("Homes" in the nav) and not a heading: it is the word that drops into
   * `hub.cardCta` and `systemTypes.copy.title`, and the reviewers chose each locale's form for
   * exactly those two holes (units u597–u599).
   */
  segmentNoun: {
    home: "home",
    "housing-society": "housing society",
    commercial: "business",
  },

  /** Hero support link on every audience page; it jumps to the system chooser below. */
  heroSecondaryLabel: "See which system fits you",

  /** The system chooser (P-SG-3 · 03 §3.2). */
  systemTypes: {
    copy: {
      eyebrow: "Choose what fits",
      title: "Which solar system suits your {noun}?",
      lead: "Not sure which is right? Our team will help you decide on the call.",
      source: "P-SG-3 · 03 §3.2",
      status: "verified-live",
    },
    items: systemTypes,
  },

  /** Closing band on the hub and every audience page (P-SG-6). "Free" was owner-confirmed 2026-09-21. */
  closingCta: {
    title: "Ready to see your savings?",
    /** The green run, written out: the old rule took the last two words (accent-split.test.ts). */
    accent: "your savings?",
    lead: "Free site visit. Free quote. Zero pressure.",
    source: "P-SG-6 · 03 §3.2",
    status: "verified-live",
  },

  /** Segment WhatsApp prefills W6–W8 (VERIFIED-LIVE). No personal data is ever added to them. */
  whatsappPrompts: {
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
  },
} as const satisfies SolutionsShared;

/**
 * The shape, spelled out so a missing `source`/`status` or a dropped segment is a type error.
 *
 * `as const satisfies` rather than an annotation: the annotation would erase which optional keys
 * are actually set, and `Translation<typeof solutionsShared>` derives the Kannada overlay's shape
 * from exactly those keys (src/i18n/translation.ts).
 */
interface SolutionsShared {
  hub: {
    meta: Sourced & { title: string; description: string };
    breadcrumb: string;
    sectionLabel: string;
    cardCta: string;
  };
  segmentNoun: Readonly<Record<SegmentSlug, string>>;
  heroSecondaryLabel: string;
  systemTypes: { copy: SectionCopy; items: readonly SystemType[] };
  /** The accent is not optional here: every closing band renders a two-tone headline. */
  closingCta: SectionCopy & { accent: string };
  whatsappPrompts: Readonly<Record<SegmentSlug, TextItem>>;
}

/**
 * Hero buttons (inventory P-SG-2), assembled per segment.
 *
 * Only the two hrefs are built here — the `segment` query value preselects the property type in
 * the calculator. Both labels are copy taken from elsewhere in this file or from site.ts, so they
 * travel into the segment's own data and are overlaid with it; nothing is concatenated.
 */
export const heroCtas = (slug: SegmentSlug): { primary: Cta; secondary: Cta } => ({
  primary: {
    label: primaryCta.label,
    href: `${primaryCta.href}?segment=${slug}`,
    source: "site.ts primaryCta · P-SG-2 (pattern)",
    status: "proposed",
  },
  secondary: {
    label: solutionsShared.heroSecondaryLabel,
    href: `#${systemTypesAnchor}`,
    source: "P-SG-2",
    status: "verified-live",
  },
});

/** Buttons on the "Still have questions?" card (inventory P-SG-5). */
export const faqCardLabels = { whatsappLabel: "Chat on WhatsApp", callLabel: "Call us" } as const;

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

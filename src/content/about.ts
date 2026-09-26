/**
 * /about — mission from the legacy site (inventory F-35, F-36), working steps and values
 * from the Brand Identity Guidelines PDF (docs/discovery/09-brand-guidelines-part1.md
 * §2.2–2.6, §3.5–3.7), team as names and roles only (F-30 to F-32; bios held, CL-31).
 */

import { primaryCta } from "@/content/site";
import type { Cta, Feature, HeldItem, LabelValue, SectionCopy, Step, TeamMember, TextItem } from "@/content/types";

const brandText = (text: string, page: string): TextItem => ({ text, source: `brand PDF ${page}`, status: "brand-pdf" });

/**
 * The page's own <title> and meta description, which /about used to spell out in its
 * generateMetadata. They live here so the Kannada overlay can reach them; the brand PDF's
 * 10-word introduction, which this key used to hold and which nothing rendered, is kept as
 * `brand.introduction`.
 */
const meta = {
  title: "About us",
  description:
    "How Irradiant Energy works — understand, design, deliver, support — plus the mission, values and people behind the company.",
  source: "proposed · the four verbs are the How-we-work steps (brand PDF p.6)",
  status: "proposed",
} as const;

/** Breadcrumb and JSON-LD name for this page; the nav label, kept in one place. */
const breadcrumb = "About";

/** Section eyebrow over the positioning line. */
const stands = { eyebrow: "What we stand for" } as const;

const mission = {
  eyebrow: "Our mission",
  title: "Powering a Greener Tomorrow",
  /** The green run, written out: the old rule took the last word (accent-split.test.ts). */
  accent: "Tomorrow",
  lead: "Built in Bengaluru. We make rooftop solar simple, transparent and built to last.",
  source: "F-35 · F-36 · P-AB-2 (the team-authored original F-37 is held for the owner's decision)",
  status: "verified-live",
} as const satisfies SectionCopy;

const story = {
  copy: {
    // PROPOSED CONTENT — REQUIRES CLIENT APPROVAL (heading adapted from the page's meta description).
    title: "How we work",
    accent: "work",
    source: "proposed · /about meta description",
    status: "proposed",
  },
  steps: [
    { number: "01", title: "Understand", description: "Energy needs", source: "brand PDF p.6", status: "brand-pdf" },
    { number: "02", title: "Design", description: "The right system", source: "brand PDF p.6", status: "brand-pdf" },
    { number: "03", title: "Deliver", description: "Professional execution", source: "brand PDF p.6", status: "brand-pdf" },
    { number: "04", title: "Support", description: "Performance over time", source: "brand PDF p.6", status: "brand-pdf" },
  ],
} as const satisfies { copy: SectionCopy; steps: readonly Step[] };

const brand = {
  tagline: brandText("Energy Made Intelligent", "p.5"),
  purposeShort: brandText("Make intelligent energy practical", "p.5"),
  /** The 10-word company introduction. Nothing renders it; it is kept so the claim is not lost. */
  introduction: brandText("Intelligent clean-energy systems for homes, communities and businesses.", "p.25"),
  positioning: brandText("Irradiant is a professional energy-system partner, not a low-cost product seller.", "p.17"),
  /** "Measurable performance" needs monitoring evidence before it carries weight (report §7.1). */
  promise: brandText("Clear advice. Reliable engineering. Measurable performance. Long-term support.", "p.19"),
} as const;

/**
 * The six value names are the brand PDF's (p.9). Its descriptions were written as instructions to
 * staff ("Recommend…", "Explain…", "Adopt…"), so they are rewritten as promises to the customer
 * in the same meaning. PROPOSED CONTENT — REQUIRES CLIENT APPROVAL (2026-09-21).
 */
/**
 * PROPOSED CONTENT — REQUIRES CLIENT APPROVAL (2026-09-21). Replaces the brand-guideline cards
 * "Essence: Energy in Motion", "Personality: Intelligent. Precise. Dependable." and "Who we serve:
 * Homes. Communities. Business." Those described the brand to its designers. These are three
 * things a customer can act on, each owner-confirmed: coverage across Karnataka, the system types
 * sold including batteries and monitoring, and what residential customers get.
 */
export const facts = [
  { label: "Who we work with", value: "Homes, housing societies and businesses across Karnataka." },
  { label: "What we install", value: "On-grid, off-grid and hybrid rooftop systems, with batteries and monitoring." },
  { label: "Included for homes and societies", value: "A free site visit and quote, the paperwork, and 5 years of free maintenance." },
] as const satisfies readonly LabelValue[];

const value = (number: string, title: string, description: string): Feature => ({
  number,
  title,
  description,
  source: "names brand PDF p.9 · descriptions rewritten, proposed",
  status: "proposed",
});

const values = {
  copy: {
    eyebrow: "Values",
    // PROPOSED CONTENT — REQUIRES CLIENT APPROVAL (heading reworded; the values are brand PDF p.9).
    title: "How we keep our promise.",
    accent: "our promise.",
    source: "proposed · values brand PDF p.9",
    status: "proposed",
  },
  items: [
    value("01", "Engineering integrity", "We recommend what is right for your site and its long-term performance."),
    value("02", "Clarity", "We explain pricing, generation, savings, risks and timelines."),
    value("03", "Accountability", "We own the journey, from the first consultation through support."),
    value("04", "Progress", "We recommend new technology only where it serves your site."),
    value("05", "Customer control", "You can see how your system performs, understand the numbers, and reach us when you need to."),
    value("06", "Responsible impact", "We describe results in figures you can check, not green slogans."),
  ],
} as const satisfies { copy: SectionCopy; items: readonly Feature[] };

const member = (name: string, role: string, ref: string): TeamMember => ({
  name,
  role,
  source: `${ref} (name and role as live; roster is an OWNER DECISION)`,
  status: "verified-live",
});

const team = {
  copy: {
    eyebrow: "Team",
    // PROPOSED CONTENT — REQUIRES CLIENT APPROVAL (heading adapted from the page's meta description).
    title: "The people behind Irradiant",
    source: "proposed · /about meta description",
    status: "proposed",
  },
  members: [
    member("Keerthi Raj K C", "Founder", "F-30"),
    member("Maruthi S Pavan", "Co-Founder", "F-31"),
    member("Maruthi S Tejas", "Head of Marketing", "F-32"),
  ],
} as const satisfies { copy: SectionCopy; members: readonly TeamMember[] };

const closingCta = {
  copy: {
    title: "Let's power your space.",
    accent: "your space.",
    // "Free site visit anywhere in India." trimmed (F-41); see held.
    lead: "Transparent quote in rupees, no pressure. We'll design the right system for your roof and your bill.",
    source: "P-AB-4",
    status: "verified-live",
  },
  primary: { label: primaryCta.label, href: primaryCta.href, source: "site.ts primaryCta", status: "proposed" },
  whatsappPrompt: {
    // A template, not a concatenation: Kannada opens with ನಮಸ್ಕಾರ and puts the brand elsewhere
    // in the line. `fill()` substitutes it at render (src/i18n/format.ts).
    text: "Hi {siteName} — I'd like to talk about going solar.",
    source: "W2 (renamed per D-001)",
    status: "verified-live",
  },
} as const satisfies { copy: SectionCopy & { accent: string }; primary: Cta; whatsappPrompt: TextItem };

const held: readonly HeldItem[] = [
  {
    id: "F-37",
    where: "mission body (alternative)",
    text: "We are dedicated to accelerating India's transition to sustainable energy. Our mission is to make high-efficiency solar power accessible and affordable for every home and business.",
    reason: "The only mission the team wrote; replaced by an AI-assisted rewrite on 2026-06-25. The owner chooses which survives.",
    ref: "F-36 · F-37 · CF-26",
  },
  {
    id: "about:credibility-row",
    where: "hero credibility row",
    text: "Bangalore HQ / Karnataka · Tamil Nadu · Telangana · MNRE-empanelled / Vendor-grade installers · Tier-1 panels / Bloomberg-rated modules · 1,000+ rooftops / 5 years on the ground",
    reason: "Code-marked placeholder numbers. Needs the service-area decision, the empanelment ID, the module brand and an installation register.",
    ref: "P-AB-2 · CL-01 · CL-03 · CL-04 · CL-05",
  },
  {
    id: "about:team:bios",
    where: "team cards (front line and bio)",
    text: "Keerthi Raj K C — Driving the transition to renewable energy. / With a Masters in Renewable Systems, Keerthi has spearheaded over 20+ large-scale solar installations across Germany and India. · Maruthi S Pavan — Lead architect of our high-efficiency solar grid systems. / Pavan is a civil engineering veteran with deep expertise designing distributed solar systems for the Indian grid. · Maruthi S Tejas — Ensuring every project leaves a positive footprint on our planet. / Tejas leads brand and growth, translating Irradiant's engineering depth into stories customers and partners trust.",
    reason: "Expanded in an AI-assisted rewrite ('and India' was added without a source). Each person approves their own bio.",
    ref: "F-30 · F-31 · F-32 · CL-31",
  },
  {
    id: "about:team:photos-links",
    where: "team cards",
    text: "Headshots (identical grey avatars) · LinkedIn links (href=\"#\")",
    reason: "No real photos or profile URLs exist; consent to publish is needed.",
    ref: "F-33 · F-34",
  },
  {
    id: "about:cta:anywhere-in-india",
    where: "closing CTA (sentence trimmed)",
    text: "Free site visit anywhere in India.",
    reason: "The service area contradicts itself across the site; the owner defines it.",
    ref: "F-41 · CL-23 · CF-03",
  },
  {
    id: "about:cta:original",
    where: "closing CTA (team-authored original)",
    text: "Ready to switch to solar? — Join happy customers powering their lives with the sun. — Schedule Your Free Consultation",
    reason: "Candidate for restoration; 'happy customers' implies a customer base.",
    ref: "R-10",
  },
  {
    id: "brand:vision-mission",
    where: "brand block",
    text: "VISION: A future where every home, community and organisation can generate, manage and optimise its own energy intelligently. MISSION: Design, deliver and manage reliable solar, storage, charging and energy-management systems through transparent advice, strong engineering, quality execution and long-term support.",
    reason: "Names storage and charging as current capabilities; not sold in v1 (D-009).",
    ref: "brand PDF p.8 · 09 §2.5",
  },
  {
    id: "brand:intros",
    where: "meta and intros",
    text: "25-word and 50-word company introductions; proposition 'Complete energy systems'",
    reason: "Claim storage, EV charging and energy management as live offerings.",
    ref: "brand PDF p.5, p.25 · 09 §5.3",
  },
  {
    id: "about:founding",
    where: "our story",
    text: "Founding year, founding story, service area",
    reason: "Not stated anywhere; the owner supplies the facts.",
    ref: "F-38 · F-41 · report §7.5 #2, #5",
  },
];

export const aboutPage = {
  meta,
  breadcrumb,
  stands,
  mission,
  story,
  brand,
  facts,
  values,
  team,
  closingCta,
  held,
} as const;

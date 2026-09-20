/**
 * Home page copy, in page order, transcribed exactly from the English dictionary of
 * the owner's HTML prototype (D-009: its positioning copy is owner-approved). Sections
 * the prototype filled with demo material (projects, partners, reviews, news) are not
 * transcribed; their headings stay and the demo items are recorded in `held`.
 * Audience paths come from site.ts and the legacy home-hero tiles (inventory P-HM-1).
 */

import { templateImages } from "@/content/images";
import type { TemplateImage } from "@/content/images";
import { primaryCta } from "@/content/site";
import type { AudiencePath, Cta, Feature, HeldItem, HeroCopy, LabelValue, Project, SectionCopy } from "@/content/types";
import { navFor, segmentHref } from "@/content/solutions/shared";

const requestConsultation: Cta = {
  label: "Request a site consultation",
  href: "/contact",
  source: "brand PDF p.29 (approved CTA phrase)",
  status: "brand-pdf",
};

const estimate: Cta = {
  label: primaryCta.label,
  href: primaryCta.href,
  source: "site.ts primaryCta",
  status: "proposed",
};

const audiencePath = (slug: AudiencePath["slug"], tile: string): AudiencePath => {
  const nav = navFor(slug);
  return {
    slug,
    label: nav.label,
    tile,
    description: nav.description ?? "",
    href: segmentHref(slug),
    source: "site.ts solutions (G-02) · P-HM-1 tile",
    status: "verified-live",
  };
};

/**
 * One scene of the rotating home hero. The scenes are transcribed verbatim from the English
 * `hero` array of the owner's HTML prototype (D-009); only the photo pairing is ours.
 */
export interface HeroSlide {
  eyebrow: string;
  title: string;
  lead: string;
  /** Three positioning chips — never numbers, credentials or performance claims. */
  chips: readonly [string, string, string];
  /** Template photography (images.ts). Decoration behind fixed copy, so it renders with alt="". */
  image: TemplateImage;
}

/**
 * Scene → photo pairing. The prototype rotated four scenes; only the two that describe a
 * live offering render (D-009: v1 is rooftop solar for homes, societies and businesses).
 * The city-scale and agriculture scenes advertised services the business does not offer and
 * are held below (`proto:hero:slides`); the agriculture scene also had no photograph of its
 * own and reused the commercial rooftop.
 */
const heroScenes = [
  {
    eyebrow: "Intelligent energy systems",
    title: "Powering smarter futures.",
    // "agriculture" removed from the prototype line: it is not an offering (D-009); see held.
    lead: "Reliable solar systems for homes, businesses and communities—designed to perform with clarity and long-term value.",
    chips: ["Site-based design", "Clear system economics", "Long-term support"],
    image: templateImages.heroHomeFamily,
  },
  {
    eyebrow: "Commercial clean energy",
    title: "Engineered systems for modern business.",
    lead: "Create more efficient and future-ready energy infrastructure for campuses, facilities and commercial sites.",
    chips: ["Scalable deployment", "Visible sustainability", "Performance-focused design"],
    image: templateImages.heroCommercialRooftop,
  },
] as const satisfies readonly HeroSlide[];

const hero: HeroCopy & { slides: readonly HeroSlide[] } = {
  // Scene 1 doubles as the static hero copy: the server renders it, and the h1 keeps it
  // without JavaScript.
  eyebrow: heroScenes[0].eyebrow,
  title: heroScenes[0].title,
  lead: heroScenes[0].lead,
  chips: heroScenes[0].chips,
  slides: heroScenes,
  cta: estimate,
  secondaryCta: requestConsultation,
  source: "prototype hero[0]–hero[1] · brand PDF p.24 (campaign line)",
  status: "owner-approved-template",
};

const audiencePaths: { copy: SectionCopy; items: readonly AudiencePath[] } = {
  copy: {
    eyebrow: "Homes. Communities. Business.",
    // PROPOSED CONTENT — REQUIRES CLIENT APPROVAL (UX heading + place qualifier). Bengaluru
    // is VERIFIED-LIVE (content-inventory F-40); 16-seo-deep-dive H3 prescribes it here.
    title: "Solar for your home, your society or your business in Bengaluru.",
    source: "eyebrow brand PDF p.5 · title proposed",
    status: "proposed",
  },
  items: [
    audiencePath("home", "Rooftop for your house"),
    audiencePath("housing-society", "Common-area & towers"),
    audiencePath("commercial", "Factories & businesses"),
  ],
};

const about: {
  copy: SectionCopy;
  capEyebrow: string;
  caption: string;
  tags: readonly string[];
  points: readonly LabelValue[];
  cta: Cta;
} = {
  copy: {
    eyebrow: "About us",
    title: "An energy partner built around real-world performance.",
    // "agriculture" removed from the prototype line: it is not an offering (D-009); see held.
    lead: "Irradiant Energy designs, installs and supports intelligent solar systems for homes, housing societies and modern business environments.",
    source: "prototype about",
    status: "owner-approved-template",
  },
  capEyebrow: "About Irradiant",
  caption: "Solar that thinks beyond installation.",
  // "Agriculture" removed: not an offering in v1 (D-009); see held.
  tags: ["Homes", "Societies", "Projects", "Business"],
  points: [
    { label: "Approach", value: "Understand · Design · Deliver · Support" },
    { label: "Promise", value: "Clear advice and long-term value" },
    { label: "Focus", value: "Performance, trust and practicality" },
    { label: "Fit", value: "Homes, societies, projects and facilities" },
  ],
  cta: { label: "About Irradiant", href: "/about", source: "prototype about.capEyebrow", status: "owner-approved-template" },
};

/** D-009: Store, Charge and Monitor carry a "Coming next" label and no CTA. The lead is held (designer note). */
const system: { copy: SectionCopy; comingNextLabel: string; cards: readonly Feature[] } = {
  copy: {
    eyebrow: "Complete energy system",
    title: "More than solar. A better energy future.",
    source: "prototype system",
    status: "owner-approved-template",
  },
  comingNextLabel: "Coming next",
  cards: [
    {
      icon: "sun",
      title: "Generate",
      description: "Solar systems designed around your real energy demand.",
      source: "prototype system.cards[0]",
      status: "owner-approved-template",
    },
    {
      icon: "battery",
      title: "Store",
      description: "Battery-ready pathways for resilience and control.",
      comingNext: true,
      source: "prototype system.cards[1] · D-009",
      status: "owner-approved-template",
    },
    {
      icon: "charge",
      title: "Charge",
      description: "Support future EV charging and smart energy use.",
      comingNext: true,
      source: "prototype system.cards[2] · D-009",
      status: "owner-approved-template",
    },
    {
      icon: "monitor",
      title: "Monitor",
      description: "Understand generation and performance with clarity.",
      comingNext: true,
      source: "prototype system.cards[3] · D-009 · CL-18",
      status: "owner-approved-template",
    },
  ],
};

const whyCard = (number: string, icon: Feature["icon"], title: string, description: string): Feature => ({
  number,
  icon,
  title,
  description,
  source: `prototype why.cards[${Number(number) - 1}]`,
  status: "owner-approved-template",
});

const why: { copy: SectionCopy; cards: readonly Feature[] } = {
  copy: {
    eyebrow: "Why Irradiant?",
    title: "Design based on your actual power needs.",
    lead: "We build trust not with extravagant promises—but with a clear process, quality engineering and responsible service.",
    source: "prototype why",
    status: "owner-approved-template",
  },
  cards: [
    whyCard("01", "site", "Site-based design", "The basis for the actual roof area, electricity demand and long-term goals."),
    whyCard("02", "doc", "Transparent proposal", "Clear estimates for production, cost, warranty and timeline."),
    whyCard("03", "shield", "Quality equipment", "Components chosen for safety, compatibility and dependable performance."),
    whyCard("04", "tools", "Professional execution", "A controlled approach to planning, installation, testing and commissioning."),
    whyCard("05", "dash", "Digital monitoring", "Easy visibility into generation and system health over time."),
    whyCard("06", "support", "Long-term support", "Service thinking that continues beyond project handover."),
  ],
};

/**
 * Renders only with verified, consented case studies (D-009). `items` is empty until the
 * owner supplies one; previews show `placeholderSubjects` as labelled placeholders.
 */
const projects: { copy: SectionCopy; items: readonly Project[]; placeholderSubjects: readonly string[] } = {
  copy: {
    eyebrow: "Featured projects",
    // "agriculture" removed: not an offering in v1 (D-009); see held.
    title: "Projects for homes, societies and commercial energy.",
    source: "prototype projects",
    status: "owner-approved-template",
  },
  items: [],
  placeholderSubjects: ["Home rooftop", "Housing society rooftop", "Commercial rooftop"],
};

// PROPOSED CONTENT — REQUIRES CLIENT APPROVAL (CTA phrasing). The band now carries a working
// estimate, so the site-wide "Get a free estimate" would point at what the visitor just used;
// this CTA names what /get-quote adds instead. Destination unchanged (site.ts primaryCta).
const calculatorCta: Cta = {
  label: "Get a proposal for your site",
  href: primaryCta.href,
  source: "site.ts primaryCta (href) · label proposed",
  status: "proposed",
};

/**
 * The calculator band, which runs the real estimate engine (src/lib/solar) inline.
 *
 * Field and result labels are the prototype's, which the owner approved (D-009), with two
 * departures, both because the engine will not support the prototype's version:
 * - the prototype's "System type" and "Daytime energy use" selects fed invented factors
 *   (a 0.35/0.55/0.75 daytime multiplier); the engine models neither, so they are not asked for.
 * - "Lifetime savings" became "Projected savings": the engine projects
 *   PROJECTION_HORIZON_YEARS (15) years and names the horizon beside the figure.
 * Hints are new UX copy; none of them is a claim, and every figure the panel prints carries the
 * engine's own assumptions and sources with it.
 */
const calculator: {
  copy: SectionCopy;
  bullets: readonly string[];
  fields: Readonly<Record<"segment" | "location" | "bill" | "tariff" | "roof" | "houses", { label: string; hint?: string }>>;
  results: { title: string; size: string; generation: string; savings: string; payback: string };
  assumptionsLabel: string;
  disclaimer: string;
  cta: Cta;
} = {
  copy: {
    eyebrow: "Irradiant solar calculator",
    title: "Estimate the right solar system for your site.",
    source: "prototype calc",
    status: "owner-approved-template",
  },
  bullets: [
    "Indicative system size",
    "Estimated annual generation",
    // PROPOSED: the prototype said "Lifetime savings estimate"; the engine projects 15 years.
    "Projected savings estimate",
    "Home scheme guidance when relevant",
  ],
  fields: {
    segment: { label: "Customer type" },
    location: { label: "City / PIN code", hint: "The PIN code decides which tariffs the estimate uses." },
    bill: { label: "Monthly electricity bill (₹)", hint: "A typical month, before any solar." },
    tariff: { label: "Average tariff (₹ / unit)", hint: "Leave it blank to use the tariff listed under the assumptions." },
    roof: { label: "Available roof area (sq. ft.)", hint: "Leave it blank if there is no practical limit." },
    houses: { label: "Homes in the society", hint: "Sets the ceiling the subsidy estimate can use." },
  },
  results: {
    title: "Your estimate",
    size: "Recommended size",
    generation: "Annual generation",
    savings: "Projected savings",
    payback: "Indicative payback",
  },
  assumptionsLabel: "What this estimate assumes",
  disclaimer:
    "Indicative preview only. Final system size, generation, savings and eligibility depend on site assessment, design and current policy checks.",
  cta: calculatorCta,
};

const finalCta: { copy: SectionCopy; primary: Cta; secondary: Cta } = {
  copy: {
    eyebrow: "Next step",
    title: "Ready to see your savings?",
    // PROPOSED CONTENT — REQUIRES CLIENT APPROVAL (lead). The title is the legacy CTA band H2.
    lead: "Start with an estimate for your roof, or talk to our team about a site consultation.",
    source: "title P-SG-6 · lead proposed",
    status: "proposed",
  },
  primary: estimate,
  secondary: requestConsultation,
};

const held: readonly HeldItem[] = [
  {
    id: "proto:hero:cta",
    where: "hero and calculator buttons",
    text: "Explore our projects",
    reason: "The prototype's only CTA points at demo projects. Buttons use the site CTA and the approved consultation phrase.",
    ref: "prototype quote · D-009",
  },
  {
    id: "proto:hero:slides",
    where: "hero (the prototype rotated four slides; v1 rotates only the two that describe a live offering)",
    text: "City-scale clean energy / Cleaner ecosystems. Smarter communities. / Bring clean-energy thinking to urban development, projects and institutions with a premium visual language. · Agriculture energy solutions / Solar power for productive land. / Support irrigation, farm operations and rural resilience with dependable solar systems made for practical conditions. · \"agriculture\" / \"Agriculture\" / \"farms\" in hero[0], the about lead, the about tags and the featured-projects heading.",
    reason: "City-scale and agriculture are not offerings today, and the agriculture scene had no photograph of its own. The commercial slide renders (it is a live offering); the carousel has pause and dot controls and the first scene is in the server HTML. Restore agriculture only with an owner-confirmed offering and its own photography.",
    ref: "prototype hero[2..3] · D-009 · report §5.5, §7.2 K",
  },
  {
    id: "proto:system:lead",
    where: "complete-energy-system section lead",
    text: "A clean, modern section with icon-led messaging for better clarity and stronger visual balance.",
    reason: "Designer note shipped as copy.",
    ref: "report §5.5",
  },
  {
    id: "proto:projects:demo",
    where: "featured projects",
    text: "Use this section to showcase your strongest visuals while keeping the layout clean and premium. · COMMERCIAL / Business & industrial energy systems / For offices, campuses and modern facilities that need reliable clean-energy performance and a strong sustainability story. · COMMERCIAL / Commercial solar campuses · RESIDENTIAL / Cleaner living for future-ready homes",
    reason: "Demo projects with AI-looking images; only verified, consented case studies render.",
    ref: "prototype projects · D-009 · report §5.5",
  },
  {
    id: "proto:calc:lead",
    where: "calculator teaser lead",
    text: "A clean calculator flow with home and business use cases, unlimited roof-area input and bilingual content support.",
    reason: "Designer note shipped as copy.",
    ref: "report §5.5",
  },
  {
    id: "proto:calc:scheme",
    where: "calculator (subsidy note)",
    text: "PM Surya Ghar: Muft Bijli Yojana — This appears only for home users. Final eligibility, subsidy and documentation must be checked against current official guidelines.",
    reason: "Calculator UI copy for /get-quote, not the teaser; subsidy statements need a dated official source.",
    ref: "prototype calc.scheme* · N-01 · N-74",
  },
  {
    id: "proto:partners",
    where: "channel partners rail",
    text: "Adani · Waaree · Goldi · Vikram Solar · Emmvee · Deye · Solis · Sungrow · SMA · Dyness · ABB · Legrand · Polycab · Havells · KEI · JSW · APL Apollo",
    reason: "Third-party marks with no agreement or logo permission; none appears on the live site.",
    ref: "prototype partners · report §5.5 · F-60",
  },
  {
    id: "proto:reviews",
    where: "reviews section",
    text: "Four anonymous five-star 'Verified client' quotes",
    reason: "Fabricated placeholders. Real reviews come from a Google Business Profile or named, consented testimonials.",
    ref: "prototype reviews · report §5.5 · R-01",
  },
  {
    id: "proto:news",
    where: "news & blog section",
    text: "How to estimate the right rooftop solar-system size · What a transparent commercial solar proposal should include · Building cleaner ecosystems through intelligent energy",
    reason: "Placeholder articles with invented read times; topic ideas for the knowledge hub only.",
    ref: "prototype news · report §5.5",
  },
  {
    id: "legacy:home:hero",
    where: "legacy home hero",
    text: "Power Your Future With Solar Energy — India's complete solar ecosystem — from rooftop to revenue. Premium panels, smart energy management, and peer-to-peer trading.",
    reason: "Replaced by the prototype hero; the sub overclaims offerings that are not live.",
    ref: "P-HM-1 · F-04 · CL-28",
  },
  {
    id: "legacy:home:trust-strip",
    where: "legacy home hero trust strip",
    text: "MNRE-empanelled · Tier-1 panels · 25-yr warranty · 5-yr free maintenance · Subsidy handled by us",
    reason: "Every item needs evidence: empanelment ID, module brand and list quarter, OEM warranty, maintenance scope, process wording.",
    ref: "P-HM-1 · CL-01 · CL-05 · N-40 · N-44 · CL-33",
  },
  {
    id: "legacy:home:government",
    where: "legacy 'Maximize Your Savings' section",
    text: "₹78,000 PM Surya Ghar · 40% Tax Depreciation · 100% Net Metering · ₹30,000/kW State Subsidies · Pay over time, not upfront · From ₹3,500/month · No-cost EMI · Instant approval · six lender tiles · reduce your solar investment cost by up to 40%",
    reason: "Stat cards are conflicting or misleading, the EMI strip is a code-marked placeholder, and lender names need written tie-ups.",
    ref: "P-HM-3 · N-01 · N-03 · N-11 · N-12 · N-13 · CL-06 · CL-10",
  },
  {
    id: "legacy:home:contact-benefits",
    where: "legacy 'Ready to Go Solar?' benefits",
    text: "24/7 monitoring · 5-year service warranty",
    reason: "No staffed monitoring exists; 'service warranty' conflicts with the maintenance plan promised elsewhere.",
    ref: "P-HM-4 · N-59 · N-44",
  },
];

export const homePage = {
  hero,
  audiencePaths,
  about,
  system,
  why,
  projects,
  calculator,
  finalCta,
  held,
} as const;

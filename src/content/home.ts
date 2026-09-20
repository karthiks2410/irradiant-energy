/**
 * Home page copy, in page order, transcribed exactly from the English dictionary of
 * the owner's HTML prototype (D-009: its positioning copy is owner-approved). Sections
 * the prototype filled with demo material (projects, partners, reviews, news) are not
 * transcribed; their headings stay and the demo items are recorded in `held`.
 * Audience paths come from site.ts and the legacy home-hero tiles (inventory P-HM-1).
 */

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

const hero: HeroCopy = {
  eyebrow: "Intelligent energy systems",
  title: "Powering smarter futures.",
  lead: "Reliable solar systems for homes, businesses, agriculture and communities—designed to perform with clarity and long-term value.",
  chips: ["Site-based design", "Clear system economics", "Long-term support"],
  cta: estimate,
  secondaryCta: requestConsultation,
  source: "prototype hero[0] · brand PDF p.24 (campaign line)",
  status: "owner-approved-template",
};

const audiencePaths: { copy: SectionCopy; items: readonly AudiencePath[] } = {
  copy: {
    eyebrow: "Homes. Communities. Business.",
    // PROPOSED CONTENT — REQUIRES CLIENT APPROVAL (UX heading).
    title: "Solar for your home, your society or your business.",
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
    lead: "Irradiant Energy designs, installs and supports intelligent solar systems for homes, projects, agriculture and modern business environments.",
    source: "prototype about",
    status: "owner-approved-template",
  },
  capEyebrow: "About Irradiant",
  caption: "Solar that thinks beyond installation.",
  tags: ["Homes", "Projects", "Agriculture", "Business"],
  points: [
    { label: "Approach", value: "Understand · Design · Deliver · Support" },
    { label: "Promise", value: "Clear advice and long-term value" },
    { label: "Focus", value: "Performance, trust and practicality" },
    { label: "Fit", value: "Homes, projects, farms and facilities" },
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
    title: "Projects for homes, agriculture and commercial energy.",
    source: "prototype projects",
    status: "owner-approved-template",
  },
  items: [],
  placeholderSubjects: ["Home rooftop", "Housing society rooftop", "Commercial rooftop"],
};

const calculator: {
  copy: SectionCopy;
  bullets: readonly string[];
  previewInputs: readonly string[];
  previewResults: readonly string[];
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
    "Lifetime savings estimate",
    "Home scheme guidance when relevant",
  ],
  previewInputs: [
    "Customer type",
    "City / PIN code",
    "Monthly electricity bill (₹)",
    "Average tariff (₹ / unit)",
    "Available roof area (sq. ft.) — unlimited",
    "System type",
    "Daytime energy use",
  ],
  previewResults: ["Recommended size", "Annual generation", "Lifetime savings", "Indicative payback"],
  disclaimer:
    "Indicative preview only. Final system size, generation, savings and eligibility depend on site assessment, design and current policy checks.",
  cta: estimate,
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
    where: "hero (the prototype rotated four slides; v1 is a static hero)",
    text: "Commercial clean energy / Engineered systems for modern business. / Create more efficient and future-ready energy infrastructure for campuses, facilities and commercial sites. · City-scale clean energy / Cleaner ecosystems. Smarter communities. / Bring clean-energy thinking to urban development, projects and institutions with a premium visual language. · Agriculture energy solutions / Solar power for productive land. / Support irrigation, farm operations and rural resilience with dependable solar systems made for practical conditions.",
    reason: "City-scale and agriculture are not offerings today; a carousel needs pause controls and hides LCP content. The commercial slide is spare positioning copy if a business hero is wanted.",
    ref: "prototype hero[1..3] · report §5.5, §7.2 K",
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

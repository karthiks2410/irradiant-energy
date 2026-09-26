/**
 * Home page copy, in page order, transcribed from the English dictionary of the owner's
 * HTML prototype (D-009: its positioning copy is owner-approved) and trimmed on owner
 * direction (2026-09-21). Sections the prototype filled with demo material (projects,
 * partners, reviews, news) are not transcribed; their headings stay and the demo items are
 * recorded in `held`.
 * Audience paths come from site.ts and the legacy home-hero tiles (inventory P-HM-1).
 */

import { projectImages } from "@/content/images";
import type { ProjectImage } from "@/content/images";
import { primaryCta } from "@/content/site";
import type { AudiencePath, Cta, Feature, HeldItem, HeroCopy, LabelValue, SectionCopy, Sourced } from "@/content/types";
import { navFor, segmentHref } from "@/content/solutions/shared";

const requestConsultation = {
  label: "Request a site consultation",
  href: "/contact",
  source: "brand PDF p.29 (approved CTA phrase)",
  status: "brand-pdf",
} as const satisfies Cta;

const estimate = {
  label: primaryCta.label,
  href: primaryCta.href,
  source: "site.ts primaryCta",
  status: "proposed",
} as const satisfies Cta;

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
 * One scene of the rotating home hero. The scenes come from the English `hero` array of the
 * owner's HTML prototype (D-009), trimmed (2026-09-21); only the photo pairing is ours.
 */
export interface HeroSlide {
  eyebrow: string;
  title: string;
  lead: string;
  /**
   * PROPOSED CONTENT — REQUIRES CLIENT APPROVAL (2026-09-21). Three facts the owner has confirmed,
   * replacing the prototype's chips, which repeated the Why card titles ("Site-based design",
   * "Long-term support") or were jargon ("Scalable deployment"). Facts only: no virtue words.
   */
  chips: readonly [string, string, string];
  /** Template photography (images.ts). Decoration behind fixed copy, so it renders with alt="". */
  image: ProjectImage;
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
    lead: "Solar systems for homes, businesses and communities.",
    chips: ["Free site visit and quote", "Paperwork handled", "Installing across Karnataka"],
    image: projectImages.duskSkyline,
  },
  {
    eyebrow: "Commercial clean energy",
    title: "Engineered systems for modern business.",
    lead: "Efficient energy infrastructure for campuses, facilities and commercial sites.",
    chips: ["Free site visit and quote", "Batteries and monitoring", "Installing across Karnataka"],
    image: projectImages.industrialRoofArray,
  },
] as const satisfies readonly HeroSlide[];

const hero = {
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
} as const satisfies HeroCopy & { slides: readonly HeroSlide[] };

const audiencePaths = {
  copy: {
    // PROPOSED CONTENT — REQUIRES CLIENT APPROVAL (UX heading + place qualifier). Karnataka is
    // owner-stated (2026-09-20): the business installs across the state, not only in Bengaluru,
    // where it is registered. The old site named only the city, which under-claimed the coverage.
    title: "Solar for your home, society or business in Karnataka.",
    accent: "in Karnataka.",
    source: "title proposed",
    status: "proposed",
  },
  items: [
    audiencePath("home", "Rooftop for your house"),
    audiencePath("housing-society", "Common-area & towers"),
    audiencePath("commercial", "Factories & businesses"),
  ],
} as const satisfies { copy: SectionCopy; items: readonly AudiencePath[] };

const about = {
  copy: {
    eyebrow: "About us",
    title: "An energy partner built around real-world performance.",
    accent: "real-world performance.",
    // "agriculture" removed from the prototype line: it is not an offering (D-009); see held.
    lead: "Irradiant Energy designs, installs and supports solar systems for homes, housing societies and businesses.",
    source: "prototype about",
    status: "owner-approved-template",
  },
  capEyebrow: "About Irradiant",
  caption: "Solar that thinks beyond installation.",
  // PROPOSED CONTENT — REQUIRES CLIENT APPROVAL (2026-09-21). The prototype's pills listed the
  // audiences a fifth time on the page; these name the system types sold instead, which appear
  // nowhere else on the home page.
  tags: ["On-grid", "Off-grid", "Hybrid", "Batteries"],
  // PROPOSED CONTENT — REQUIRES CLIENT APPROVAL (2026-09-21). The prototype's tiles were virtue
  // words ("Performance, trust and practicality") or repeats. These are what a customer gets,
  // each confirmed by the owner: the free site visit and what it checks (Homes step 01), the
  // paperwork, named equipment, and maintenance for residential customers only.
  points: [
    { label: "Site visit", value: "Free, with a roof, shading and load check" },
    { label: "Paperwork", value: "Approvals and the subsidy, handled by us" },
    { label: "Equipment", value: "Panels, inverters and batteries from named brands" },
    { label: "Maintenance", value: "Free for 5 years, for homes and societies" },
  ],
  cta: { label: "About Irradiant", href: "/about", source: "prototype about.capEyebrow", status: "owner-approved-template" },
} as const satisfies {
  copy: SectionCopy;
  capEyebrow: string;
  caption: string;
  tags: readonly string[];
  points: readonly LabelValue[];
  cta: Cta;
};

/**
 * Only Generate links out. Charge (EV) carries a "Coming next" label and no CTA; batteries and
 * monitoring are sold today (owner, 2026-09-21). The lead is held (designer note).
 */
const system = {
  copy: {
    eyebrow: "Complete energy system",
    title: "More than solar. A better energy future.",
    accent: "A better energy future.",
    source: "prototype system",
    status: "owner-approved-template",
  },
  comingNextLabel: "Coming next",
  cards: [
    {
      icon: "sun",
      title: "Generate",
      description: "Solar systems designed around your real energy demand.",
      href: "/solutions",
      source: "prototype system.cards[0]",
      status: "owner-approved-template",
    },
    {
      icon: "battery",
      title: "Store",
      description: "Battery-ready pathways for resilience and control.",
      source: "prototype system.cards[1]",
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
      source: "prototype system.cards[3] · CL-18",
      status: "owner-approved-template",
    },
  ],
} as const satisfies { copy: SectionCopy; comingNextLabel: string; cards: readonly (Feature & { href?: string })[] };

/** `protoIndex` is the card's position in the prototype, which no longer matches its number. */
const whyCard = (
  number: string,
  protoIndex: number,
  icon: Feature["icon"],
  title: string,
  description: string,
): Feature => ({
  number,
  icon,
  title,
  description,
  source: `prototype why.cards[${protoIndex}]`,
  status: "owner-approved-template",
});

/** PROPOSED CONTENT — REQUIRES CLIENT APPROVAL (2026-09-21): a rewritten prototype card. */
const proposedWhyCard = (
  number: string,
  protoIndex: number,
  icon: Feature["icon"],
  title: string,
  description: string,
): Feature => ({
  ...whyCard(number, protoIndex, icon, title, description),
  source: `rewrite of prototype why.cards[${protoIndex}] · proposed`,
  status: "proposed",
});

const why = {
  copy: {
    eyebrow: "Why Irradiant?",
    title: "Design based on your actual power needs.",
    accent: "actual power needs.",
    // Lead removed on owner direction (2026-09-20). It was the prototype's, and it spent a
    // sentence saying we do not over-promise, immediately above the cards that demonstrate it.
    // The original wording is held below as `proto:why:lead`.
    source: "prototype why",
    status: "owner-approved-template",
  },
  cards: [
    // 01, 03 and 04 are rewrites of prototype cards that restated the heading ("Site-based
    // design") or made claims any installer makes ("Quality equipment", "Professional
    // execution"). They now say how: what the site visit checks, which brands, who does the work.
    // These also render on the Business page through proofFallback, so none mentions maintenance.
    proposedWhyCard("01", 0, "site", "Designed for your roof", "We measure the roof, check shading and load, then size the system to your bill."),
    whyCard("02", 1, "doc", "Transparent proposal", "Clear estimates for production, cost, warranty and timeline."),
    proposedWhyCard("03", 2, "shield", "Brands you can check", "Panels, inverters and batteries from makers such as Waaree, SMA and Dyness."),
    proposedWhyCard("04", 3, "tools", "One team, end to end", "Site visit, design, installation, paperwork and support, all by Irradiant."),
    whyCard("05", 4, "dash", "Digital monitoring", "Visibility into generation and system health over time."),
    whyCard("06", 5, "support", "Long-term support", "Service thinking that continues beyond project handover."),
  ],
} as const satisfies { copy: SectionCopy; cards: readonly Feature[] };

/**
 * The band of the owner's own installation photography.
 *
 * It is not a case-study section and must not become one by implication. The photographs carry
 * no capacity, client, society, location, date, saving or count, because none was supplied, and
 * a photograph cannot establish any of them on its own. What the owner did state — recorded in
 * the header of src/content/images.ts — is that these are the company's own photographs of real
 * completed work and may be shown as our installations. That single fact is the whole claim.
 *
 * `photos` names entries in `projectImages`, so the pictures have one home and the alt text
 * cannot drift from the file that owns it.
 */
const projects = {
  // PROPOSED CONTENT — REQUIRES CLIENT APPROVAL (eyebrow, title and lead). The approved
  // "Featured projects · Projects for homes, societies and commercial energy." headed a band of
  // case studies: "featured" implies a curated selection out of a larger set, which is a count,
  // and naming three segments asserts completed work in each. These photographs establish
  // neither, and nothing in them distinguishes a housing society from a home. Both approved
  // lines are held below as `proto:projects:heading` rather than deleted, and come back when
  // the first consented case study does.
  copy: {
    eyebrow: "Our work",
    title: "Rooftop systems we have installed.",
    accent: "have installed.",
    source: "photographs src/content/images.ts (owner-supplied 2026-09-20) · copy proposed",
    status: "proposed",
  },
  // Six of the eight frames the owner supplied (owner direction, 2026-09-20: show more than a
  // pair). The two held back are hero slide 1 and hero slide 2, which a visitor meets at the top
  // of this same page; everything else appears here. Ordered so the frame with a person in it
  // leads and no two adjacent cells are the same kind of roof.
  photos: [
    "installerAtWork",
    "roadsideArray",
    "terraceArray",
    "metalRoofArray",
    "palmRooftop",
    "hillsideArray",
  ],
} as const satisfies { copy: SectionCopy; photos: readonly (keyof typeof projectImages)[] };

/**
 * The equipment rail.
 *
 * Released from `held` on owner direction (2026-09-20). It was withheld because a rail of other
 * companies' marks asserts a relationship, and none was evidenced. The owner has now confirmed
 * these are the brands they build with, so the names render.
 *
 * Two things are deliberately weaker than the prototype's version:
 * - The eyebrow is "Equipment we install", not "Channel partners". A channel partner is a
 *   contracted commercial relationship — a dealership or an authorised-installer agreement — and
 *   we hold no evidence of one. Naming the kit we fit is true whatever the paperwork says.
 *   Restore "Channel partners" only for brands where the agreement actually exists.
 * - No logos yet. See the held item `proto:partners:logos`.
 *
 * `domain` exists only so official logos can be fetched and self-hosted later; every one is a
 * best guess and must be checked against the mark that comes back before it ships.
 *
 * `category` describes what each company makes, which is a fact about them, not a claim about us.
 */
export interface Brand {
  name: string;
  category: string;
  /** For fetching the official mark later. Unverified. */
  domain: string;
  /** Self-hosted logo under /images/brands once permission is settled; lettermark until then. */
  logo?: `/images/brands/${string}`;
}

const brands = {
  copy: {
    // PROPOSED CONTENT — REQUIRES CLIENT APPROVAL (eyebrow). The title is the prototype's own
    // line and is owner-approved; the eyebrow replaces the prototype's "Channel partners",
    // which asserts a commercial agreement we hold no evidence of.
    eyebrow: "Equipment we install",
    title: "Brands we work with.",
    accent: "work with.",
    source: "prototype partners (brand list, owner-directed 2026-09-20) · eyebrow proposed",
    status: "proposed",
  },
  items: [
    { name: "Adani", category: "Modules", domain: "adanisolar.com" , logo: "/images/brands/adani.png" },
    { name: "Waaree", category: "Modules", domain: "waaree.com" , logo: "/images/brands/waaree.png" },
    { name: "Goldi", category: "Modules", domain: "goldisolar.com" , logo: "/images/brands/goldi.png" },
    { name: "Vikram Solar", category: "Modules", domain: "vikramsolar.com" , logo: "/images/brands/vikram-solar.png" },
    { name: "Emmvee", category: "Modules", domain: "emmvee.com" , logo: "/images/brands/emmvee.png" },
    { name: "Deye", category: "Inverters", domain: "deyeinverter.com" , logo: "/images/brands/deye.png" },
    { name: "Solis", category: "Inverters", domain: "solisinverters.com" , logo: "/images/brands/solis.png" },
    // Taken from Sungrow's own site, not the logo service: Brand Search confirmed the domain
    // was right all along and the service simply holds no correct asset for them.
    { name: "Sungrow", category: "Inverters", domain: "sungrowpower.com", logo: "/images/brands/sungrow.png" },
    { name: "SMA", category: "Inverters", domain: "sma.de" , logo: "/images/brands/sma.png" },
    // dyness.com and dyness.us both return a generated monogram; the real mark sits under the
    // manufacturer's Chinese domain, which is what Brand Search surfaced as a second result.
    { name: "Dyness", category: "Batteries", domain: "dyness-tech.com.cn", logo: "/images/brands/dyness.png" },
    { name: "ABB", category: "Switchgear", domain: "abb.com" , logo: "/images/brands/abb.png" },
    { name: "Legrand", category: "Switchgear", domain: "legrand.com" , logo: "/images/brands/legrand.png" },
    // Also taken from Polycab India's own site. The service returned a red ring matching no
    // Polycab mark, and polycab.com.tr is an unrelated Turkish company of the same name.
    { name: "Polycab", category: "Wires", domain: "polycab.com", logo: "/images/brands/polycab.png" },
    { name: "Havells", category: "Wires", domain: "havells.com" , logo: "/images/brands/havells.png" },
    { name: "KEI", category: "Wires", domain: "kei-ind.com" , logo: "/images/brands/kei.png" },
    { name: "JSW", category: "Steel", domain: "jsw.in" , logo: "/images/brands/jsw.png" },
    { name: "APL Apollo", category: "Steel", domain: "aplapollo.com" , logo: "/images/brands/apl-apollo.png" },
  ],
} as const satisfies { copy: SectionCopy; items: readonly Brand[] };

// PROPOSED CONTENT — REQUIRES CLIENT APPROVAL (CTA phrasing). The band now carries a working
// estimate, so the site-wide "Get a free estimate" would point at what the visitor just used;
// this CTA names what /get-quote adds instead. Destination unchanged (site.ts primaryCta).
const calculatorCta = {
  label: "Get a proposal for your site",
  href: primaryCta.href,
  source: "site.ts primaryCta (href) · label proposed",
  status: "proposed",
} as const satisfies Cta;

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
const calculator = {
  copy: {
    eyebrow: "Solar calculator",
    title: "Estimate the right solar system for your site.",
    accent: "your site.",
    source: "prototype calc",
    status: "owner-approved-template",
  },
  // PROPOSED CONTENT — REQUIRES CLIENT APPROVAL (2026-09-21). The prototype's bullets were the
  // labels of the result tiles sitting beside them. These say why to use it instead, each true
  // of the engine: the bill is the only input it needs, it applies Karnataka tariffs and the
  // PM Surya Ghar subsidy where it applies, it recalculates live, and every assumption is listed
  // with its source.
  bullets: [
    "Only your monthly bill is needed",
    "Karnataka tariffs and the PM Surya Ghar subsidy, where it applies",
    "Figures update as you type",
    "Every assumption listed with its source",
  ],
  fields: {
    segment: { label: "Customer type" },
    location: { label: "PIN code", hint: "Confirms which supplier serves you." },
    bill: { label: "Monthly electricity bill (₹)", hint: "A typical month, before any solar." },
    tariff: { label: "Average tariff (₹ / unit)", hint: "Leave it blank to use the tariff listed under the assumptions." },
    load: { label: "Sanctioned load (kW)", hint: "From your electricity bill." },
    houses: { label: "Homes in the society", hint: "Sets the ceiling the subsidy estimate can use." },
  },
  results: {
    title: "Your estimate",
    size: "Recommended system",
    savings: "Monthly savings",
    payback: "Indicative payback",
    subsidy: "PM Surya Ghar subsidy",
    cost: "Indicative cost",
  },
  assumptionsLabel: "What this estimate assumes",
  disclaimer:
    "Indicative only. Final figures and eligibility depend on site assessment, design and current policy checks.",
  cta: calculatorCta,
} as const satisfies {
  copy: SectionCopy;
  bullets: readonly string[];
  fields: Readonly<Record<"segment" | "location" | "bill" | "tariff" | "load" | "houses", { label: string; hint?: string }>>;
  results: { title: string; size: string; savings: string; payback: string; subsidy: string; cost: string };
  assumptionsLabel: string;
  disclaimer: string;
  cta: Cta;
};

const finalCta = {
  copy: {
    // PROPOSED CONTENT — REQUIRES CLIENT APPROVAL (eyebrow). The title is the legacy CTA band H2.
    eyebrow: "Next step",
    title: "Ready to see your savings?",
    accent: "your savings?",
    source: "title P-SG-6 · eyebrow proposed",
    status: "proposed",
  },
  primary: estimate,
  secondary: requestConsultation,
} as const satisfies { copy: SectionCopy; primary: Cta; secondary: Cta };

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
    id: "proto:projects:heading",
    where: "featured projects heading and photo-slot subjects",
    text: "Featured projects · Projects for homes, societies and commercial energy. · Home rooftop / Housing society rooftop / Commercial rooftop",
    reason:
      "The band now shows photographs with no project detail beside them. \"Featured\" implies a curated selection out of a larger set, which is a count we cannot support; the three-segment title asserts completed work in each segment, and nothing in the owner's photographs distinguishes a housing society from a home. Restore both lines, and the three segment subjects, when the first consented case study lands.",
    ref: "prototype projects · D-009 · report §5.5",
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
    id: "proto:partners:logos",
    where: "channel partners rail",
    text: "The seventeen brands' official word marks and logotypes",
    reason:
      "The brand names now render as text (owner direction, 2026-09-20), which is nominative use and needs no permission. The logos are a separate question: reproducing a third party's mark alongside ours reads as an endorsement, so each one needs either the brand's own press-kit terms checked or its permission. Until then the rail uses lettermarks.",
    ref: "prototype partners · report §5.5 · F-60",
  },
  {
    id: "proto:why:lead",
    where: "why section lead",
    text: "We build trust not with extravagant promises—but with a clear process, quality engineering and responsible service.",
    reason: "Owner direction, 2026-09-20: removed. Approved prototype copy, so it is recorded rather than deleted.",
    ref: "prototype why.lead",
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

/**
 * The page's own <title>. It was a literal in the route file; it is copy, it has a character
 * budget (seo.ts: 60 including the " | Irradiant Energy" suffix) and it needs a Kannada version,
 * so it lives here with everything else the page says.
 */
const meta = {
  title: "Rooftop solar across Karnataka",
  /**
   * The home page's own search description. It used to borrow site.description, which is also
   * the footer's visible line; this one names Bengaluru alongside Karnataka for search (owner-
   * approved wording, 2026-09-26) without changing the footer.
   */
  description: "Rooftop solar for homes, apartments and businesses in Bengaluru and across Karnataka — designed, installed and supported, with a free site visit.",
  source: "P-HM-1 · seo.ts budget",
  status: "proposed",
} as const satisfies Sourced & { title: string; description: string };

export const homePage = {
  meta,
  hero,
  audiencePaths,
  about,
  system,
  why,
  brands,
  projects,
  calculator,
  finalCta,
  held,
} as const;

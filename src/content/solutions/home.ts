/**
 * /solutions/solar/home — copy carried over from the legacy Homes landing page
 * (docs/discovery/03-content-solutions.md §4; OLD src/lib/home-segment-content.ts and
 * solutions-data.ts), filtered by docs/content-inventory.md: VERIFIED-LIVE wording
 * renders; everything PLACEHOLDER / UNVERIFIED / OUTDATED / CONFLICTING is in `held`.
 * Where a CONFLICTING number has a value on this page, that value renders and the
 * conflict is recorded in `held` for the owner's decision.
 */

import type { Segment } from "@/content/types";
import { faqCardLabels, heroCtas, navFor, segmentHref, whatsappPrompts } from "./shared";

const slug = "home" as const;
const nav = navFor(slug);
const ctas = heroCtas(slug);

export const homeSegment: Segment = {
  slug,
  href: segmentHref(slug),
  label: nav.label,
  description: nav.description ?? "",

  // PROPOSED CONTENT — REQUIRES CLIENT APPROVAL (place qualifier only). Bengaluru is a
  // VERIFIED-LIVE fact (content-inventory F-40) and 16-seo-deep-dive H3 prescribes it; the
  // rest of the wording is the legacy copy. The shorter title also fits the SERP width.
  meta: {
    title: "Rooftop solar for homes in Bengaluru",
    // "and lifetime after-sales" trimmed (N-44); see held.
    description:
      "Rooftop solar designed for your home in Bengaluru. Free site visit, transparent quote, end-to-end installation. See which on-grid, off-grid, or hybrid system fits you.",
    source: "P-SH-1 · 03 §4.1 · place qualifier proposed (F-40 · 16 §H3)",
    status: "proposed",
  },

  hero: {
    eyebrow: "For homeowners in Bengaluru",
    title: "Solar for your home in Bengaluru — designed end-to-end.",
    lead: "From the first site visit to the last installation screw, we handle it. You see the savings every month on your bill.",
    cta: ctas.primary,
    secondaryCta: ctas.secondary,
    source: "P-SH-2 · OLD solutions-data.ts:98-103 · place qualifier proposed (F-40 · 16 §H3)",
    status: "proposed",
  },

  whoItsFor: {
    copy: {
      eyebrow: "Who it's for",
      title: nav.description ?? "",
      source: "G-02 (site.ts menu description)",
      status: "verified-live",
    },
    items: [
      { text: "Individual homes", source: "G-02", status: "verified-live" },
      { text: "Villas", source: "G-02", status: "verified-live" },
    ],
  },

  journey: {
    copy: {
      eyebrow: "How it works",
      title: "Your solar journey, simplified.",
      lead: "Four clear steps. We handle the moving parts — you handle picking up the savings.",
      source: "P-SH-4 · OLD home-segment-content.ts:59-63",
      status: "verified-live",
    },
    steps: [
      {
        number: "01",
        title: "Free site visit & rooftop design",
        description:
          "Our team comes to your home, measures the roof, checks shadowing and load, and designs a system that gets the most out of your space.",
        source: "P-SH-4 step 01",
        status: "verified-live",
      },
      {
        number: "02",
        // "3D" trimmed from the title (CL-21); see held.
        title: "Personalised plan",
        description:
          "You'll see exactly how the panels will sit on your roof — with savings projections in rupees, before you commit to anything.",
        source: "P-SH-4 step 02",
        status: "verified-live",
      },
      {
        number: "03",
        title: "We install. We handle the subsidy.",
        // "Tier-1 panels, certified installers, and" trimmed (CL-05); see held.
        description: "All the discom + govt. paperwork done by us. You don't chase a single form.",
        source: "P-SH-4 step 03 · F-53",
        status: "verified-live",
      },
      {
        number: "04",
        title: "Switch on. Save. We maintain.",
        description:
          "Your system goes live, your bill drops the same month, and we handle 5 years of maintenance — cleaning, monitoring, and parts.",
        source: "P-SH-4 step 04 (N-44, N-54 conflicts recorded in held)",
        status: "verified-live",
      },
    ],
  },

  included: {
    copy: {
      eyebrow: "What's included",
      // PROPOSED CONTENT — REQUIRES CLIENT APPROVAL (UX heading; the items are legacy facts).
      title: "Everything from the first visit to switch-on.",
      source: "proposed heading · items P-HM-4, P-SH-5",
      status: "proposed",
    },
    items: [
      { text: "Free site assessment", source: "P-HM-4", status: "verified-live" },
      { text: "Custom system design", source: "P-HM-4", status: "verified-live" },
      { text: "Subsidy assistance", source: "P-HM-4", status: "verified-live" },
      { text: "Professional installation", source: "P-HM-4", status: "verified-live" },
      { text: "5-year free maintenance", source: "P-SH-5 (N-44 conflict recorded in held)", status: "verified-live" },
    ],
  },

  trust: {
    copy: {
      eyebrow: "Why us",
      // Title is PROPOSED CONTENT — REQUIRES CLIENT APPROVAL; the legacy title held (CL-26). Lead is P-SH-5.
      title: "Built around your roof and your bill.",
      lead: "Solar is a 25-year decision. Here's what makes us a partner you'll still call in year 10.",
      source: "title proposed · lead P-SH-5",
      status: "proposed",
    },
    cards: [
      {
        title: "Honest savings, in rupees",
        description:
          "We don't quote a percentage. We show you the exact rupee number you'll save every month, based on your bill and tariff slab. No surprises.",
        icon: "doc",
        source: "P-SH-5 card 1",
        status: "verified-live",
      },
      {
        title: "One team, end-to-end",
        description:
          "Site visit, design, install, paperwork, subsidy, and after-sales — all done by Irradiant directly. No middlemen, no finger-pointing.",
        icon: "support",
        source: "P-SH-5 card 2 · F-53",
        status: "verified-live",
      },
      {
        title: "5-year free maintenance",
        description:
          "Cleaning, monitoring, and parts — included for 5 years. Your panels stay clean, your generation stays high, and we come to you.",
        icon: "tools",
        source: "P-SH-5 card 4 (N-44 conflict recorded in held)",
        status: "verified-live",
      },
    ],
  },

  faq: {
    copy: {
      eyebrow: "Questions, answered",
      title: "Frequently asked questions",
      // "A real person — not a bot — will reply." trimmed (CL-24); see held.
      lead: "If your question isn't here, ping us on WhatsApp.",
      source: "P-SH-6 · OLD home-segment-content.ts:182-185",
      status: "verified-live",
    },
    groups: [
      {
        id: "cost",
        label: "Costs & subsidy",
        items: [
          {
            id: "H-2",
            q: "How much subsidy can I get, and how does the process work?",
            // The state top-up sentence is trimmed (N-03, N-04); see held.
            a: "Under the PM Surya Ghar scheme, residential systems get ₹30,000 to ₹78,000 in central subsidy depending on system size. We handle the entire application + tracking — you don't fill a single form.",
            source: "H-2 · N-02 · 03 §4.6",
            status: "verified-live",
          },
        ],
      },
      {
        id: "install",
        label: "Installation",
        items: [
          {
            id: "H-4",
            q: "How long does installation take from quote to switch-on?",
            a: "Typically 30–45 days end-to-end. About a week for design + approval, 2–3 days for the actual installation, and the rest is discom inspection + meter changeover. We keep you updated at every step on WhatsApp.",
            source: "H-4 · N-50 · 03 §4.6",
            status: "verified-live",
          },
          {
            id: "H-5",
            q: "How much roof space do I need?",
            a: "Roughly 100 sq ft per kW of installed solar. So a 3 kW system needs ~300 sq ft of unshaded roof. If you're tight on space, hybrid panel layouts and elevated structures often free up more area than you think — that's what the free site visit is for.",
            source: "H-5 · N-30 (CF-06 recorded in held) · 03 §4.6",
            status: "verified-live",
          },
          {
            id: "H-6",
            q: "Do you handle the discom paperwork, or do I have to?",
            // "No standing in BESCOM/MSEDCL offices." trimmed; see held.
            a: "We handle every form — discom application, net-metering agreement, structural certification, subsidy claim, all of it. You sign two documents, we do the rest.",
            source: "H-6 · F-53 · 03 §4.6",
            status: "verified-live",
          },
        ],
      },
      {
        id: "maintenance",
        label: "Maintenance & lifespan",
        items: [
          {
            id: "H-8",
            q: "Does it work in monsoon and on cloudy days?",
            a: "Yes — modern panels still generate 10–25% of peak output on cloudy days, and rain actually helps by washing dust off the panels. Net-metering means surplus generated on sunny days carries forward to offset cloudy-day usage.",
            source: "H-8 · N-27 · 03 §4.6",
            status: "verified-live",
          },
        ],
      },
      {
        id: "system",
        label: "The system",
        items: [
          {
            id: "H-10",
            q: "What's the difference between on-grid, off-grid, and hybrid?",
            // The closing "scroll up" cross-reference is trimmed; see held.
            a: "On-grid: roof powers the home, extra goes to the grid for credit, no battery. Cheapest, most popular. Off-grid: roof + battery, fully independent, no grid connection. Best for poor-supply areas. Hybrid: roof + battery + grid, runs on solar by day and falls back to grid only when needed. Most resilient, slightly costlier.",
            source: "H-10 · 03 §4.6",
            status: "verified-live",
          },
        ],
      },
    ],
    stillHaveQuestions: {
      title: "Still have questions?",
      body: {
        // PROPOSED CONTENT — REQUIRES CLIENT APPROVAL; the legacy body is held (CL-24).
        text: "Talk to our team on WhatsApp, or call us.",
        source: "proposed",
        status: "proposed",
      },
      whatsappPrompt: whatsappPrompts[slug],
      ...faqCardLabels,
    },
  },

  leadForm: {
    eyebrow: "Free consultation",
    title: "Talk to a real solar expert — no pressure.",
    lead: "Tell us a few details. We'll call you back, do a free site visit, and put a number on your roof. You decide what happens next.",
    submitLabel: "Book my free consultation",
    billLabel: "Monthly electricity bill",
    billRanges: [
      { value: "lt-1500", label: "Less than ₹1,500" },
      { value: "1500-2500", label: "₹1,500 – ₹2,500" },
      { value: "2500-4000", label: "₹2,500 – ₹4,000" },
      { value: "4000-8000", label: "₹4,000 – ₹8,000" },
      { value: "gt-8000", label: "More than ₹8,000" },
    ],
    source: "P-SH-3 · OLD home-segment-content.ts:37-53",
    status: "verified-live",
  },

  held: [
    {
      id: "H-1",
      where: "faq › Costs & subsidy",
      text: "Do I need to pay everything upfront, or is there EMI? — No upfront payment required. We offer 0% EMI for the first 6 months and longer EMI plans through tied-up banks (with instant approval). Many customers use the govt. subsidy as their down payment — meaning ₹0 from their pocket on day one.",
      reason: "Financing offer, bank tie-ups, instant approval and '₹0 on day one' are unverified. Needs written lender tie-ups and current terms.",
      ref: "H-1 · CL-07 · N-07 · N-09",
    },
    {
      id: "H-2:state-top-up",
      where: "faq › H-2 (sentence trimmed)",
      text: "State subsidies stack on top in some states (e.g. UP gives an extra ₹15,000/kW).",
      reason: "Conflicting state-subsidy figures; UP is outside the service area; the removed state table listed Karnataka's top-up as ₹0.",
      ref: "N-03 · N-04 · CF-08",
    },
    {
      id: "H-3",
      where: "faq › Costs & subsidy",
      text: "How much will I actually save on my bill? — Most homes see their bill drop by 80–90% from the first month — sometimes to ₹0, sometimes with a credit balance carried forward. Over 25 years, a 3 kW system typically saves ₹14–18 lakh in cumulative bill savings. We'll model your exact savings before you commit.",
      reason: "Savings percentage and 25-year figure conflict with 'we don't quote a percentage' and the calculator's 15-year horizon; needs the owner's price-disclosure decision and stated assumptions.",
      ref: "H-3 · N-20 · N-21 · CF-11 · CF-14",
    },
    {
      id: "H-5:roof-area-conflict",
      where: "faq › H-5 (conflict recorded; the page value 100 sq ft/kW renders)",
      text: "70 sq ft per kWp (calculator)",
      reason: "The FAQ says ~100 sq ft per kW and the calculator used 70 sq ft per kWp. Owner picks one value, which then lives in one place.",
      ref: "N-30 · N-31 · CF-06",
    },
    {
      id: "H-6:msedcl",
      where: "faq › H-6 (sentence trimmed)",
      text: "No standing in BESCOM/MSEDCL offices.",
      reason: "MSEDCL (Maharashtra) is outside the service area. 'You sign two documents' is kept but needs owner confirmation.",
      ref: "H-6 · F-41 · CF-03",
    },
    {
      id: "H-7",
      where: "faq › Maintenance & lifespan",
      text: "How long do solar panels actually last? — Tier-1 panels carry a 25-year performance warranty (output stays above 80% of original) and typically run 30+ years in real Indian conditions. Inverters last 10–12 years and are replaced under our service plan if they fail.",
      reason: "'Tier-1', the 25-year warranty (module brand unnamed), inverter lifespan and the service-plan scope are unverified. Needs OEM warranty certificates and the maintenance-plan scope.",
      ref: "H-7 · CL-05 · N-40 · N-43",
    },
    {
      id: "H-9",
      where: "faq › Maintenance & lifespan",
      text: "What if a panel breaks or the inverter fails? — Covered. Panels are under 25-year manufacturer warranty for performance and 10–12 years for product. Inverter is under our 5-year free maintenance + extendable AMC. We come to your home, swap the part, and you don't see a bill.",
      reason: "Product warranty conflicts with the society page (12 years); the AMC has no scope or price; 'you don't see a bill' is a warranty promise for counsel.",
      ref: "H-9 · N-42 · N-44 · N-45 · CF-09",
    },
    {
      id: "H-10:cross-reference",
      where: "faq › H-10 (sentence trimmed)",
      text: "We have a plain-English breakdown above this FAQ — scroll up to the 'Which system fits you' section.",
      reason: "UI cross-reference to a section heading that does not exist verbatim; the system chooser carries its own anchor.",
      ref: "H-10",
    },
    {
      id: "H-11",
      where: "faq › The system",
      text: "How do I know how much power my system is generating? — Every install comes with a mobile app showing real-time generation, daily/monthly summaries, and your savings in rupees. You'll see promised generation vs. actual, so there are no surprises about whether the system is performing.",
      reason: "The app or portal is never named (Irradiant's or the inverter maker's) and 'promised generation' implies a guarantee.",
      ref: "H-11 · CL-18",
    },
    {
      id: "home:faq:not-a-bot",
      where: "faq lead and 'Still have questions?' body",
      text: "A real person — not a bot — will reply. / Real questions deserve real answers. Talk to our team on WhatsApp — no chatbots, no hold music.",
      reason: "Staffing promise; keep only if the channel is staffed.",
      ref: "CL-24",
    },
    {
      id: "home:journey:pills",
      where: "journey benefit pills",
      text: "0% EMI for 6 months · 5-year free maintenance · Govt. subsidy handled by us · Instant EMI approval",
      reason: "EMI offers are unverified; 'subsidy handled by us' overstates the process (customers register on the portal themselves). No pills render on any audience page.",
      ref: "P-SH-4 · CL-07 · N-07 · CL-33 · N-44",
    },
    {
      id: "home:journey:step-02:3d",
      where: "journey step 02 title",
      text: "Personalised 3D plan",
      reason: "No 3D tool or sample plan is evidenced; the step renders as 'Personalised plan'.",
      ref: "CL-21",
    },
    {
      id: "home:journey:step-03:equipment",
      where: "journey step 03 (clause trimmed)",
      text: "Tier-1 panels, certified installers, and",
      reason: "'Tier-1' needs the module brand and list quarter; installer certification needs licences.",
      ref: "CL-05 · report §7.4",
    },
    {
      id: "home:maintenance-vs-warranty",
      where: "journey step 04, trust card, included list (conflict recorded; '5-year free maintenance' renders as the page value)",
      text: "5-year free maintenance (this page) vs '5-year service warranty' (legacy home #contact) vs 'lifetime after-sales' (legacy meta)",
      reason: "A warranty and a maintenance plan are legally different promises. Owner confirms what the 5 years cover and for which segments.",
      ref: "N-44 · CF-04",
    },
    {
      id: "home:same-month",
      where: "journey step 04 (conflict recorded; 'the same month' renders as the page value)",
      text: "your bill drops the same month",
      reason: "Depends on DISCOM net-meter timing and sits against the 30–45 day timeline in H-4.",
      ref: "N-54",
    },
    {
      id: "home:trust:heading",
      where: "trust grid H2",
      text: "Why families across India trust Irradiant.",
      reason: "Reach and customer-base claim with no evidence; the service area is itself undecided.",
      ref: "CL-26 · F-41",
    },
    {
      id: "home:trust:weather",
      where: "trust grid card 3",
      text: "Built for Indian weather — Our mounts are tested to hold through monsoon winds and Indian summers. Tier-1 panels with a 25-year performance warranty.",
      reason: "Mount test, 'Tier-1' and the warranty need engineering specs, OEM documents and a named brand.",
      ref: "CL-19 · CL-05 · N-40",
    },
    {
      id: "home:lead-form:pill",
      where: "lead form chip",
      text: "Free site visit · 7 days a week",
      reason: "Operating days and the site-visit area are unverified.",
      ref: "N-55 · CL-23",
    },
    {
      id: "home:meta:after-sales",
      where: "meta description (clause trimmed)",
      text: "and lifetime after-sales",
      reason: "Appears only in the legacy meta; the page promises 5-year maintenance plus an AMC.",
      ref: "P-SH-1 · N-44",
    },
  ],
};

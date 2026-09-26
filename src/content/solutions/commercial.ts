/**
 * /solutions/solar/commercial — copy carried over from the legacy Commercial landing
 * page (docs/discovery/03-content-solutions.md §6; OLD src/lib/commercial-segment-content.ts
 * and solutions-data.ts), filtered by docs/content-inventory.md: VERIFIED-LIVE wording
 * renders; PLACEHOLDER / UNVERIFIED / OUTDATED / CONFLICTING items are in `held`.
 *
 * The filter removes every legacy trust card (PPA ownership, tax lines, "zero downtime",
 * audit certificates), so `trust.cards` is empty: render `proofFallback` from
 * ./index.ts (the owner-approved prototype proof cards) in its place.
 */

import type { Segment } from "@/content/types";
import { faqCardLabels, heroCtas, navFor, segmentHref, solutionsShared } from "./shared";

const slug = "commercial" as const;
const nav = navFor(slug);
const ctas = heroCtas(slug);

export const commercialSegment = {
  slug,
  href: segmentHref(slug),
  label: nav.label,
  description: nav.description ?? "",

  // PROPOSED CONTENT — REQUIRES CLIENT APPROVAL (place qualifier only). Karnataka is owner-stated (2026-09-20): the business installs throughout the state, not
  // only in Bengaluru, where it is registered. The old site said Bengaluru everywhere, which
  // under-claimed the coverage.
  meta: {
    title: "Rooftop solar for businesses in Karnataka",
    // "accelerated depreciation benefits" trimmed (N-12); see held.
    description:
      "Solar for Karnataka businesses of every shape and size — shops, offices, factories and warehouses. Predictable energy costs and a single team handling design, install, and after-sales.",
    source: "P-SC-1 · 03 §6.1 · place qualifier proposed (F-40 · 16 §H3)",
    status: "proposed",
  },

  hero: {
    eyebrow: "For businesses",
    title: "Solar for your business in Karnataka — predictable energy costs, lower bills.",
    lead: "Shops, offices, schools, factories, warehouses. We design for your roof, your load curve, and your tariff.",
    cta: ctas.primary,
    secondaryCta: ctas.secondary,
    source: "P-SC-2 · OLD solutions-data.ts:128-133 (CF-20 recorded in held) · place qualifier proposed (F-40 · 16 §H3)",
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
      { text: "Shops", source: "G-02", status: "verified-live" },
      { text: "Offices", source: "G-02", status: "verified-live" },
      { text: "Factories", source: "G-02", status: "verified-live" },
      { text: "Warehouses", source: "G-02", status: "verified-live" },
      { text: "Schools", source: "P-SC-2 (CF-20 recorded in held)", status: "verified-live" },
    ],
  },

  journey: {
    copy: {
      eyebrow: "How it works",
      // ", with zero business disruption" trimmed (CL-15); see held.
      title: "From load study to switch-on.",
      source: "P-SC-4 · OLD commercial-segment-content.ts:54-58",
      status: "verified-live",
    },
    steps: [
      {
        number: "01",
        title: "Free site visit & load study",
        description:
          "We study your last 12 months of bills, sanctioned load, demand profile, and rooftop / open-area availability. The proposal is sized to your actual consumption.",
        source: "P-SC-4 step 01 · N-39",
        status: "verified-live",
      },
      {
        number: "02",
        title: "CAPEX vs OPEX financial model",
        // "depreciation impact under Section 32, GST + ITC handling," trimmed (N-12, N-14); see held.
        description:
          "We build a side-by-side: payback, IRR, NPV, and balance-sheet treatment.",
        source: "P-SC-4 step 02",
        status: "verified-live",
      },
      {
        number: "03",
        title: "Approval, financing & paperwork",
        // The bank-financing and PPA sentences are trimmed (CL-22); see held.
        description: "Discom approval, structural certifications, and net-metering paperwork — all on us.",
        source: "P-SC-4 step 03 · F-53",
        status: "verified-live",
      },
      {
        number: "04",
        title: "Install around your operations",
        // "Tier-1 panels, certified installers," trimmed (CL-05); see held.
        description:
          "Grid-tie cutover happens in a single 2–4 hour planned window, weekend or off-peak — your choice.",
        source: "P-SC-4 step 04 · N-38",
        status: "verified-live",
      },
      {
        number: "05",
        // "CFO-grade reports." and the report sentences are trimmed (CL-18, CL-20); see held.
        title: "Switch on. Save.",
        description: "System goes live, savings start the same month.",
        source: "P-SC-4 step 05 (N-54 conflict recorded in held)",
        status: "verified-live",
      },
    ],
  },

  included: {
    copy: {
      eyebrow: "What's included",
      // PROPOSED CONTENT — REQUIRES CLIENT APPROVAL (UX heading; the items are legacy step titles and fragments).
      title: "What to expect from us.",
      source: "proposed heading · items P-SC-4",
      status: "proposed",
    },
    items: [
      { text: "Free site visit & load study", source: "P-SC-4 step 01", status: "verified-live" },
      { text: "CAPEX vs OPEX financial model", source: "P-SC-4 step 02", status: "verified-live" },
      {
        text: "Discom approval, structural certifications, and net-metering paperwork",
        source: "P-SC-4 step 03",
        status: "verified-live",
      },
      { text: "Install around your operations", source: "P-SC-4 step 04", status: "verified-live" },
    ],
  },

  trust: {
    copy: {
      eyebrow: "Why us",
      // Title is PROPOSED CONTENT — REQUIRES CLIENT APPROVAL; the legacy title is held.
      title: "What a business gets with Irradiant.",
      source: "title proposed",
      status: "proposed",
    },
    cards: [],
  },

  faq: {
    copy: {
      eyebrow: "Business questions, answered",
      title: "Commercial solar FAQs",
      source: "P-SC-6 · OLD commercial-segment-content.ts:142-145",
      status: "verified-live",
    },
    groups: [
      {
        id: "costs",
        label: "Costs & financing",
        items: [
          {
            id: "C-2",
            q: "Can we finance the system through a bank?",
            // Lender names, loan terms and the MSME scheme line are trimmed; see held.
            a: "Yes. We help compile the financial dossier (system DPR, savings projection, payback model) the bank will need to approve.",
            source: "C-2 · 03 §6.6",
            status: "verified-live",
          },
        ],
      },
      {
        id: "system",
        label: "Operations & system",
        items: [
          {
            id: "C-5",
            q: "Rooftop or ground-mount — what suits our facility?",
            // The customer-base sentence is trimmed (CL-16); see held.
            a: "Rooftop is the default — uses unutilised roof area, no land cost, shorter approval cycle.\n\nGround-mount makes sense when the roof can't carry or fit the system you need, or when you have plenty of unused ground or parking area. Typical for larger industrial campuses (>500 kW) or facilities with adjacent open land.",
            source: "C-5 · N-36 · 03 §6.6",
            status: "verified-live",
          },
          {
            id: "C-6",
            q: "Will installation disrupt our business operations?",
            // "Almost never." and the 7–14 day sentence are trimmed; see held.
            a: "The grid-tie / commissioning step needs a single 2–4 hour planned shutdown, which we schedule on a weekend or off-peak window of your choice.\n\nWe coordinate the timeline with your facility manager, including discom inspection, net-metering changeover and final go-live.",
            source: "C-6 · N-38 (CF-10 recorded in held) · 03 §6.6",
            status: "verified-live",
          },
        ],
      },
    ],
    stillHaveQuestions: {
      title: "Still have questions?",
      body: {
        // The CAPEX-vs-OPEX delivery promise is trimmed; see held.
        text: "Commercial decisions deserve real numbers.",
        source: "P-SC-6 · OLD commercial-segment-content.ts:211-213",
        status: "verified-live",
      },
      whatsappPrompt: solutionsShared.whatsappPrompts[slug],
      ...faqCardLabels,
    },
  },

  leadForm: {
    eyebrow: "CAPEX vs OPEX comparison",
    title: "Get a financial proposal your CFO can actually use.",
    // "depreciation impact, " trimmed (N-12); see held.
    lead: "Tell us about your business. We'll send a side-by-side CAPEX-vs-OPEX comparison with payback, IRR, and balance-sheet treatment for your specific load profile.",
    submitLabel: "Get the financial proposal",
    billLabel: "Average monthly electricity bill",
    organisationField: {
      label: "Company / facility name",
      placeholder: "e.g. Acme Manufacturing Pvt Ltd",
      name: "company",
    },
    billRanges: [
      { value: "lt-50k", label: "Less than ₹50,000" },
      { value: "50k-1L", label: "₹50,000 – ₹1,00,000" },
      { value: "1L-3L", label: "₹1,00,000 – ₹3,00,000" },
      { value: "3L-10L", label: "₹3,00,000 – ₹10,00,000" },
      { value: "gt-10L", label: "More than ₹10,00,000" },
    ],
    source: "P-SC-3 · OLD commercial-segment-content.ts:29-50",
    status: "verified-live",
  },

  held: [
    {
      id: "C-1",
      where: "faq › Costs & financing",
      text: "CAPEX or OPEX (PPA) — which is right for my business? — CAPEX (you own the system) … you claim accelerated depreciation … OPEX / PPA / RESCO (we own, you buy power): A third party invests, owns, and operates the system on your roof. You sign a 15–25 year power purchase agreement at a fixed tariff (typically 30–40% below your discom rate). Zero capex, no maintenance liability, fully off-balance-sheet. Hybrid (deferred CAPEX) …",
      reason: "Whether Irradiant offers PPAs at all is unconfirmed; the tariff discount and the accounting claim need finance and counsel review.",
      ref: "C-1 · CL-22 · N-16",
    },
    {
      id: "C-2:trims",
      where: "faq › C-2 (sentences trimmed)",
      text: "SBI, Canara, IREDA, Tata Capital, and most major banks have specific rooftop solar products for MSMEs and corporates. Typical terms: 70–80% loan-to-value, 8–11% interest, 5–10 year tenure, with the system itself as collateral. / Under PM Surya Ghar and various MNRE schemes, MSMEs get concessional rates.",
      reason: "Lender names and terms need written tie-ups; PM Surya Ghar is a residential scheme, so the MSME line is likely inaccurate.",
      ref: "F-63 · N-15 · CL-13 · CF-13",
    },
    {
      id: "C-3",
      where: "faq › Tax & GST",
      text: "What's accelerated depreciation, and how does it help? — Under Section 32 of the Income Tax Act, solar power generating systems qualify for 40% accelerated depreciation in the first year (down from 80% pre-2017). On a ₹1 crore solar system, that's a ₹40 lakh deduction in year one … a real tax saving of ₹10–12 lakh …",
      reason: "Tax statement for CA and counsel review with an 'as of' date; note 17 reports the Income-tax Act 2025 in force since 1 Apr 2026.",
      ref: "C-3 · N-12 · N-17",
    },
    {
      id: "C-4",
      where: "faq › Tax & GST",
      text: "What GST applies to a commercial solar installation? — Solar PV modules, cells, and inverters are taxed at 12% GST … balance-of-system components are at standard slabs (18%). Installation services are at 18% … net cost is GST-neutral.",
      reason: "Outdated: note 03 reports the rate cut to 5% from 22 Sep 2025. For CA review.",
      ref: "C-4 · N-14 · CL-12",
    },
    {
      id: "C-5:trims",
      where: "faq › C-5 (sentence trimmed; segment list recorded)",
      text: "Many of our larger commercial customers do hybrid: roof + parking-shed solar (which doubles as covered parking) + a ground array. / Segment list varies: shops, offices, factories, warehouses (title) + schools (hero) + hospitals, hotels (C-5)",
      reason: "Customer-base claim with no project list; the served-segment list is an owner decision.",
      ref: "CL-16 · CF-20",
    },
    {
      id: "C-6:trims",
      where: "faq › C-6 (sentences trimmed; downtime conflict recorded)",
      text: "Almost never. / The actual install is done in 7–14 days for systems up to 500 kW, mostly on the roof with no impact on ground-floor operations. / 'Zero operational downtime' and 'We've never disrupted a customer's operations.' elsewhere on the page",
      reason: "The install duration is unverified; the absolutes contradict the 2–4 hour shutdown the page itself describes, which is the value that renders.",
      ref: "N-37 · N-38 · CL-15 · CF-10",
    },
    {
      id: "C-7",
      where: "faq › Operations & system",
      text: "How do we monitor and audit the system once it's running? — Every commercial install ships with a real-time monitoring portal … panel-string-level diagnostics … separate dashboards … exports … in formats your CA / auditor can drop into Tally or SAP. We also provide an annual 3rd-party generation audit certificate …",
      reason: "No named portal, report format or auditor exists in the evidence.",
      ref: "C-7 · CL-18 · CL-20",
    },
    {
      id: "commercial:journey:heading",
      where: "journey H2 (clause trimmed)",
      text: ", with zero business disruption",
      reason: "Absolute claim; the page describes a 2–4 hour shutdown.",
      ref: "CL-15 · CF-10",
    },
    {
      id: "commercial:journey:pills",
      where: "journey benefit pills",
      text: "40% accelerated depreciation · 12% GST with full ITC · CAPEX or OPEX flexibility · Zero operational downtime",
      reason: "Tax lines are outdated or unverified; the OPEX offer is unconfirmed; the absolute is contradicted. No pills render on any audience page.",
      ref: "P-SC-4 · N-12 · N-14 · CL-22 · CL-15",
    },
    {
      id: "commercial:journey:step-02:tax",
      where: "journey step 02 (list items trimmed)",
      text: "depreciation impact under Section 32, GST + ITC handling,",
      reason: "See C-3 and C-4.",
      ref: "N-12 · N-14",
    },
    {
      id: "commercial:journey:step-03:financing",
      where: "journey step 03 (sentences trimmed)",
      text: "Bank financing tied up if going CAPEX with EMI. PPA negotiated if going OPEX.",
      reason: "Financing tie-ups and the PPA offer are unconfirmed.",
      ref: "CL-22 · report §7.4",
    },
    {
      id: "commercial:journey:step-04:equipment",
      where: "journey step 04 (clause trimmed)",
      text: "Tier-1 panels, certified installers,",
      reason: "See CL-05 and installer licences.",
      ref: "CL-05 · report §7.4",
    },
    {
      id: "commercial:journey:step-05:reports",
      where: "journey step 05 (title and sentences trimmed)",
      text: "Switch on. Save. CFO-grade reports. — … and you get monthly generation + savings reports formatted for Tally / SAP / your audit trail. Annual 3rd-party generation audit certificate available for ESG / BRSR.",
      reason: "See C-7. 'Savings start the same month' renders as the page value; the timing conflict is recorded.",
      ref: "CL-18 · CL-20 · N-54",
    },
    {
      id: "commercial:trust:heading",
      where: "trust grid H2",
      text: "Why Indian businesses pick Irradiant.",
      reason: "Implies a customer base with no project list.",
      ref: "P-SC-5 · CL-16 · CF-05",
    },
    {
      id: "commercial:trust:cards",
      where: "trust grid (all four cards)",
      text: "Bankable financial models (payback, IRR, NPV, depreciation impact, and ITC handling …) / CAPEX, OPEX or hybrid (… sign a 15–25 year PPA where we own and operate …) / Zero operational downtime (… We've never disrupted a customer's operations.) / Reports the books need (… Tally or SAP. Annual generation audit certificates for ISO, GRI, BRSR, and ESG reporting.)",
      reason: "The financial-model deliverable, the PPA ownership model, the absolute and the report/audit deliverables are all unconfirmed. Render `proofFallback` instead.",
      ref: "P-SC-5 · CL-15 · CL-22 · CL-18 · CL-20 · report §7.5 #15",
    },
    {
      id: "commercial:faq:lead",
      where: "faq lead (clause trimmed)",
      text: "— financing models, tax treatment, payback, GST, and how it actually changes the books.",
      reason: "Promises the tax, GST and payback answers that are held.",
      ref: "P-SC-6 · R-09",
    },
    {
      id: "commercial:faq:card-body",
      where: "'Still have questions?' body (sentence trimmed)",
      text: "Tell us your average monthly bill and roof area, and we'll send a detailed CAPEX-vs-OPEX comparison your CFO can actually use.",
      reason: "The comparison document must exist before it is promised on submit.",
      ref: "report §7.4 · report §7.5 #15",
    },
    {
      id: "commercial:lead-form:trims",
      where: "lead form chip and lead (clause trimmed)",
      text: "Free site visit + financial model / depreciation impact,",
      reason: "The financial model is an unconfirmed deliverable; depreciation is a held tax line. The proposal heading and submit label are kept as wording pending the owner's confirmation of the deliverable.",
      ref: "P-SC-3 · N-12 · report §7.5 #15",
    },
    {
      id: "commercial:meta:depreciation",
      where: "meta description (clause trimmed)",
      text: "accelerated depreciation benefits,",
      reason: "See C-3.",
      ref: "P-SC-1 · N-12",
    },
    {
      id: "commercial:maintenance",
      where: "whole page",
      text: "5-year free maintenance (promised on the Homes and Society pages; absent here)",
      reason: "Owner-confirmed 2026-09-21: the maintenance plan is for homes and housing societies only.",
      ref: "P-SC-7 · N-44",
    },
  ],
} as const satisfies Segment;

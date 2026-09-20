/**
 * /solutions/solar/housing-society — copy carried over from the legacy Housing Society
 * landing page (docs/discovery/03-content-solutions.md §5; OLD
 * src/lib/housing-society-segment-content.ts and solutions-data.ts), filtered by
 * docs/content-inventory.md: VERIFIED-LIVE wording renders; PLACEHOLDER / UNVERIFIED /
 * OUTDATED / CONFLICTING items are in `held`. Where a CONFLICTING number has a value on
 * this page, that value renders and the conflict is recorded in `held`.
 */

import type { Segment } from "@/content/types";
import { faqCardLabels, heroCtas, navFor, segmentHref, whatsappPrompts } from "./shared";

const slug = "housing-society" as const;
const nav = navFor(slug);
const ctas = heroCtas(slug);

export const housingSocietySegment: Segment = {
  slug,
  href: segmentHref(slug),
  label: nav.label,
  description: nav.description ?? "",

  // PROPOSED CONTENT — REQUIRES CLIENT APPROVAL (place qualifier only). Karnataka is owner-stated (2026-09-20): the business installs throughout the state, not
  // only in Bengaluru, where it is registered. The old site said Bengaluru everywhere, which
  // under-claimed the coverage.
  meta: {
    title: "Rooftop solar for housing societies in Karnataka",
    description:
      "Solar for apartments, gated communities, and RWA-managed buildings across Karnataka. Lower society maintenance, predictable energy costs, and a single point of contact end-to-end.",
    source: "P-SS-1 · 03 §5.1 · place qualifier proposed (F-40 · 16 §H3)",
    status: "proposed",
  },

  hero: {
    eyebrow: "For Karnataka RWAs and society committees",
    title: "Cut your society's common-area electricity bill in Karnataka — together.",
    // "— solar covers it all" trimmed (CL-27); see held.
    lead: "Lifts, pumps, lobby, parking lights. Lower society maintenance for every flat.",
    cta: ctas.primary,
    secondaryCta: ctas.secondary,
    source: "P-SS-2 · OLD solutions-data.ts:113-118 · place qualifier proposed (F-40 · 16 §H3)",
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
      { text: "Apartments", source: "P-SS-1", status: "verified-live" },
      { text: "Gated communities", source: "P-SS-1", status: "verified-live" },
      { text: "RWA-managed buildings", source: "P-SS-1", status: "verified-live" },
    ],
  },

  journey: {
    copy: {
      eyebrow: "How it works",
      title: "From first conversation to switch-on, in five clear steps.",
      // "We've done this with dozens of societies." trimmed (CL-14); see held.
      lead: "The flow is predictable, the paperwork is on us, and the committee always stays in the loop.",
      source: "P-SS-4 · OLD housing-society-segment-content.ts:56-60",
      status: "verified-live",
    },
    steps: [
      {
        number: "01",
        title: "Free site visit & energy audit",
        description:
          "We visit the society, study the rooftop layout, common-area load profile, and last 12 months of electricity bills. You get a sized proposal — not a brochure.",
        source: "P-SS-4 step 01 · N-39",
        status: "verified-live",
      },
      {
        number: "02",
        title: "Proposal & AGM-ready package",
        // "plus a draft resolution … No legalese." trimmed (CL-32); see held.
        description:
          "We share a detailed proposal — savings, payback, financing options — your committee can circulate ahead of the AGM.",
        source: "P-SS-4 step 02 · P-SS-5 card 1",
        status: "verified-live",
      },
      {
        number: "03",
        title: "Approval, financing & subsidy filing",
        // "Bank financing options handled if you're going EMI." trimmed; see held.
        description:
          "Once the AGM passes, we file the discom paperwork, structural NOCs, and PM Surya Ghar subsidy claim in parallel.",
        source: "P-SS-4 step 03 · F-53",
        status: "verified-live",
      },
      {
        number: "04",
        title: "Install with minimal disruption",
        // "Tier-1 panels, certified installers," trimmed (CL-05); see held.
        description:
          "Scheduled to avoid resident inconvenience. Lift access, water tank routing, and parking — coordinated with your facility manager.",
        source: "P-SS-4 step 04",
        status: "verified-live",
      },
      {
        number: "05",
        title: "Switch on. Save. We maintain.",
        // "Society gets transparent monthly generation reports." trimmed (CL-18); see held.
        description:
          "System goes live, common-area bills drop the same month, and we handle 5 years of cleaning + monitoring + parts.",
        source: "P-SS-4 step 05 (N-44, N-54 conflicts recorded in held)",
        status: "verified-live",
      },
    ],
  },

  included: {
    copy: {
      eyebrow: "What's included",
      // PROPOSED CONTENT — REQUIRES CLIENT APPROVAL (UX heading; the items are legacy step and card titles).
      title: "What your committee receives.",
      source: "proposed heading · items P-SS-4, P-SS-5",
      status: "proposed",
    },
    items: [
      { text: "Free site visit & energy audit", source: "P-SS-4 step 01", status: "verified-live" },
      { text: "Committee-ready proposal", source: "P-SS-5 card 1", status: "verified-live" },
      { text: "Subsidy + paperwork on us", source: "P-SS-5 card 3 · F-53", status: "verified-live" },
      { text: "Install with minimal disruption", source: "P-SS-4 step 04", status: "verified-live" },
      { text: "5-year free maintenance", source: "P-SS-4 step 05 (N-44 conflict recorded in held)", status: "verified-live" },
    ],
  },

  trust: {
    copy: {
      eyebrow: "Why us",
      title: "Why society committees pick Irradiant.",
      lead: "Society decisions are committee decisions. Our process is built around transparency, AGM-readiness, and giving every flat owner a clear answer.",
      source: "P-SS-5 · OLD housing-society-segment-content.ts:108-112",
      status: "verified-live",
    },
    cards: [
      {
        title: "Committee-ready proposals",
        // "Includes a draft resolution." trimmed (CL-32); see held.
        description:
          "Detailed savings model, payback timeline, and financing comparison — formatted to circulate to all flat owners ahead of your AGM.",
        icon: "doc",
        source: "P-SS-5 card 1",
        status: "verified-live",
      },
      {
        title: "Fair to every flat",
        description:
          "Common-area solar benefits everyone proportionally — we model the per-flat impact on monthly maintenance so committees can show it transparently.",
        icon: "site",
        source: "P-SS-5 card 2",
        status: "verified-live",
      },
      {
        title: "Subsidy + paperwork on us",
        description:
          "PM Surya Ghar registration, discom approval, structural NOCs, net-metering changeover — every form, every visit, our team handles it.",
        icon: "shield",
        source: "P-SS-5 card 3 · F-53",
        status: "verified-live",
      },
      {
        title: "Built for shared rooftops",
        description:
          "Water tanks, AC condensers, lift machine rooms, cell towers — we design around them with elevated mounts, not despite them.",
        icon: "tools",
        source: "P-SS-5 card 4",
        status: "verified-live",
      },
    ],
  },

  faq: {
    copy: {
      eyebrow: "Society questions, answered",
      title: "Housing society FAQs",
      lead: "Things RWAs and society committees ask us most often — costs, AGM approval, subsidy, maintenance, and how it actually works in a multi-flat building.",
      source: "P-SS-6 · OLD housing-society-segment-content.ts:144-147",
      status: "verified-live",
    },
    groups: [
      {
        id: "costs",
        label: "Costs & subsidy",
        items: [
          {
            id: "S-2",
            q: "Is there a government subsidy for housing societies?",
            // "Some states stack additional subsidies on top." trimmed (N-03); see held.
            a: "Yes — under PM Surya Ghar Muft Bijli Yojana, group housing societies are eligible for subsidy on common-area / shared-use solar installations. The central subsidy is ₹18,000/kW (capped at the relevant slab) for the society's qualifying capacity.\n\nNote: the subsidy structure for societies works slightly differently from individual homes — it's tied to the society's total approved capacity rather than per-flat. We figure out the exact eligibility for your society during the site visit.",
            source: "S-2 · N-05 (CF-07 recorded in held) · 03 §5.6",
            status: "verified-live",
          },
          {
            id: "S-3",
            q: "How do we apply for the subsidy?",
            // The "credited within 30 days" sentence (N-06) and ", vendor empanelment" (CL-02)
            // are trimmed; see held.
            a: "We handle the entire application — society registration on the National Portal (pmsuryaghar.gov.in), document submission, technical feasibility check, and post-installation claim filing. The society only needs to provide standard paperwork (registration certificate, electricity bill, AGM resolution, building approval).\n\nYou don't chase a single form.",
            source: "S-3 · F-53 · F-64 · 03 §5.6",
            status: "verified-live",
          },
        ],
      },
      {
        id: "approval",
        label: "Approval & process",
        items: [
          {
            id: "S-6",
            q: "Does our society need an AGM approval to install solar?",
            // The draft-resolution and "first vote" sentences are trimmed (CL-32, CL-17); see held.
            a: "Yes. As a structural change to the building and a corpus / common-area decision, solar installation requires a formal resolution passed in the Annual General Meeting (or a duly-convened Special General Meeting). The resolution should specify the capacity, financing model, and authorisation for the society committee to sign the contract on behalf of the society.",
            source: "S-6 · 03 §5.6 (governance guidance: for counsel review)",
            status: "verified-live",
          },
          {
            id: "S-7",
            q: "What is the procedure to get permission from society to build solar?",
            a: "Standard steps in order:\n\n1. Initial committee discussion based on our preliminary site survey + savings estimate.\n\n2. We share a detailed proposal: system size, financial model, savings forecast, vendor credentials.\n\n3. Society committee circulates the proposal to all members (typically 2–4 weeks notice).\n\n4. AGM / SGM passes the resolution authorising installation.\n\n5. Society signs the agreement with us.\n\n6. We file for discom approval, structural NOC (where required), and subsidy registration in parallel.\n\nThe whole approval-to-signed-contract phase usually takes 30–60 days depending on how quickly the society can convene the AGM.",
            source: "S-7 · N-51 · N-52 (CF-18 recorded in held) · 03 §5.6",
            status: "verified-live",
          },
          {
            id: "S-8",
            q: "What is the PM Surya Ghar Yojana for a housing society?",
            // The "(we are listed there)" bullet, the concessional-loan bullet and the closing "we handle every step" sentence are trimmed; see held.
            a: "PM Surya Ghar Muft Bijli Yojana is the central government's flagship rooftop solar scheme launched in 2024. For housing societies it provides:\n\n• Capital subsidy of ₹18,000/kW for the society's qualifying common-area capacity (subject to scheme caps and updates).\n\n• A simplified single-window registration on the National Portal.\n\nSocieties have to register the proposed system, get a technical feasibility approval from the local discom, install via an empanelled vendor, and the subsidy is disbursed post-inspection.",
            source: "S-8 · N-05 · N-53 · F-64 · 03 §5.6",
            status: "verified-live",
          },
          {
            id: "S-9",
            q: "How much rooftop space is needed for a solar installation?",
            // The "50 kW ≈ 5,000 sq ft" sentence is trimmed (N-32); see held.
            a: "Rough rule: about 100 sq ft per kW of installed solar.\n\nIf the rooftop is shared between water tanks, pump rooms, AC condensers, and so on, we use elevated mounting structures that recover the area underneath — so the practical 'lost' rooftop is much smaller than people assume. The free site visit gives you an exact map of what fits.",
            source: "S-9 · N-30 (CF-06 recorded in held) · 03 §5.6",
            status: "verified-live",
          },
        ],
      },
    ],
    stillHaveQuestions: {
      title: "Still have questions?",
      body: {
        text: "Society decisions deserve thorough answers. Talk to our team on WhatsApp — we'll send you a detailed proposal you can circulate to your committee.",
        source: "P-SS-6 · OLD housing-society-segment-content.ts:256-258",
        status: "verified-live",
      },
      whatsappPrompt: whatsappPrompts[slug],
      ...faqCardLabels,
    },
  },

  leadForm: {
    eyebrow: "AGM-ready proposal",
    title: "Get a proposal your committee can sign off on.",
    // ", including draft resolution language" trimmed (CL-32); see held.
    lead: "Tell us about your society. We'll send a detailed savings + payback proposal — formatted exactly for your AGM circulation.",
    submitLabel: "Get the AGM proposal",
    billLabel: "Average monthly common-area bill",
    organisationField: {
      label: "Society name",
      // The legacy placeholder named a real society (F-65); this is a neutral hint.
      placeholder: "Your society's registered name",
      name: "society",
    },
    billRanges: [
      { value: "lt-15k", label: "Less than ₹15,000" },
      { value: "15k-30k", label: "₹15,000 – ₹30,000" },
      { value: "30k-60k", label: "₹30,000 – ₹60,000" },
      { value: "60k-1L", label: "₹60,000 – ₹1,00,000" },
      { value: "gt-1L", label: "More than ₹1,00,000" },
    ],
    source: "P-SS-3 · OLD housing-society-segment-content.ts:31-52",
    status: "verified-live",
  },

  held: [
    {
      id: "S-1",
      where: "faq › Costs & subsidy",
      text: "How much can our society save with solar? — With solar covering common-area loads — lifts, pumps, lobby and corridor lights, parking — most societies see their common-area electricity bill drop by 70–90%. The exact savings depend on your society's monthly consumption, sanctioned load, and the rooftop area we can install on. For a typical mid-size society with a ₹40,000–₹60,000/month common-area bill, savings work out to ₹3.5–6 lakh per year, with payback in 3.5–5 years and 20+ years of near-zero bills after that.",
      reason: "Savings, bill and payback figures are unverified and sit against the owner's no-price-anchoring rule (removed FAQs R-09).",
      ref: "S-1 · N-22 · N-23 · N-24 · CF-17",
    },
    {
      id: "S-2:state-stacking",
      where: "faq › S-2 (sentence trimmed)",
      text: "Some states stack additional subsidies on top.",
      reason: "The removed state table listed Karnataka's top-up as ₹0.",
      ref: "N-03 · CF-08",
    },
    {
      id: "S-2:calculator-conflict",
      where: "faq › S-2 and S-8 (conflict recorded; ₹18,000/kW renders as the page value)",
      text: "Household ladder capped at ₹78,000 applied to societies (legacy calculator, result page, email)",
      reason: "Note 04 finds ₹18,000/kW matches the official GHS/RWA rule; the calculator must follow the same value.",
      ref: "N-05 · N-74 · CF-07",
    },
    {
      id: "S-3:30-days",
      where: "faq › S-3 (sentence trimmed)",
      text: "Once installation is complete and inspected by the discom, the subsidy is credited to the society's bank account within 30 days.",
      reason: "Disbursement timing is unverified.",
      ref: "N-06",
    },
    {
      id: "S-4",
      where: "faq › Costs & subsidy",
      text: "What are the different financing options available? — Three main routes: 1. CAPEX (society pays) … 2. EMI / loan: Bank-financed at 8–11% interest, 5–10 year tenure. Many banks (SBI, Canara, HDFC) have dedicated rooftop solar products that pre-approve societies. 3. RESCO / OPEX (PPA model): A third party (us or a financier) owns the system, the society buys the solar power at a fixed lower tariff for 15–25 years …",
      reason: "Lender names, loan terms and the PPA/RESCO offer ('us or a financier') are unverified; three different lender lists exist across the site.",
      ref: "S-4 · N-15 · N-16 · F-63 · CL-22 · CF-13",
    },
    {
      id: "S-5",
      where: "faq › Costs & subsidy",
      text: "What is the typical payback period for a solar system? — For a society going CAPEX with subsidy claimed, payback is typically 3.5–5 years. After that, every kWh the panels generate is essentially free for the next 20+ years. In RESCO / PPA mode there is no payback to calculate …",
      reason: "Payback figure is unverified and against the no-price-anchoring rule.",
      ref: "S-5 · N-24 · CF-17",
    },
    {
      id: "S-6:draft-resolution",
      where: "faq › S-6 (sentences trimmed)",
      text: "We provide a draft resolution template you can circulate to members ahead of the AGM. Most societies pass it on the first vote once they see the savings projection.",
      reason: "The draft resolution is a legal document that needs legal review before it is promised; 'first vote' is a track-record claim. The remaining governance guidance is for counsel review (bye-laws vary).",
      ref: "CL-32 · CL-17",
    },
    {
      id: "S-7:process-model",
      where: "faq › S-7 (conflict recorded; the 6-step procedure renders alongside the 5-step journey)",
      text: "6 steps (S-7) vs 5 journey steps vs the brand PDF's 9-stage journey",
      reason: "Two process models on one page. Owner and design decide whether to merge the procedure into the journey.",
      ref: "N-60 · CF-18",
    },
    {
      id: "S-8:trims",
      where: "faq › S-8 (bullet and sentences trimmed)",
      text: "• Empanelled vendors with verified credentials (we are listed there). / • Concessional bank loans at lower interest rates for societies opting for EMI. / We handle every step of this for our society customers.",
      reason: "Vendor empanelment needs the National Portal registration ID and state; the loan line is financing content; the closing sentence implies empanelment. Every scheme statement still needs a current-source check by counsel.",
      ref: "CL-02 · F-64 · report §7.4",
    },
    {
      id: "S-3:empanelment",
      where: "faq › S-3 (phrase trimmed from the subsidy-application answer)",
      text: "…document submission, technical feasibility check, vendor empanelment, and post-installation claim filing…",
      reason: "Listing vendor empanelment among the steps we handle is an empanelment claim about Irradiant, which is exactly what S-8:trims removed elsewhere on this page. It renders only once the owner supplies the National Portal registration ID and DISCOM and that is recorded in docs/decisions.md. S-8's neutral statement of the scheme requirement (\"install via an empanelled vendor\") is unaffected: it describes the scheme, not us.",
      ref: "CL-02 · D-009 · content-inventory §6",
    },
    {
      id: "S-9:trims",
      where: "faq › S-9 (sentence trimmed; roof-area conflict recorded)",
      text: "So a 50 kW system (a typical mid-size society's common-area requirement) needs ~5,000 sq ft of unshaded roof area. / 70 sq ft per kWp (calculator)",
      reason: "The 'typical mid-size society' size is unverified; the roof rule conflicts with the calculator constant.",
      ref: "N-32 · N-30 · N-31 · CF-06",
    },
    {
      id: "S-10",
      where: "faq › Maintenance & operations",
      text: "What maintenance does a solar system require? — Routine maintenance is minimal but important: • Panel cleaning every 4–6 weeks (dust + bird droppings cut output by 5–15% otherwise). • Quarterly inspection of inverters, cables, junction boxes, and earthing. • Annual generation audit + thermal scan of the array. For our society customers all of this is bundled into a 5-year free maintenance plan. After year 5, an extendable AMC keeps everything running. The society sees the same generation in year 10 as in year 1.",
      reason: "The service cadence, the AMC and 'year 10 = year 1' are unverified or contradicted by panel degradation. Needs the maintenance-plan scope.",
      ref: "S-10 · N-46 · N-45 · N-47 · N-44",
    },
    {
      id: "S-11",
      where: "faq › Maintenance & operations",
      text: "How do we ensure the safety and longevity of the solar installation? — … ≥150 kmph rated mounts … an online monitoring dashboard flags any panel underperformance the same day … a 24×7 incident response line … 25-year linear performance warranty … inverters last 10–12 years …",
      reason: "Mount rating, same-day flagging, the 24×7 line (no such line exists in the contact data), the warranty and inverter life are all unverified.",
      ref: "S-11 · CL-18 · CL-19 · N-35 · N-56 · N-57 · N-40 · N-43",
    },
    {
      id: "S-12",
      where: "faq › Maintenance & operations",
      text: "What happens if solar generation is lower than expected? — Our quote includes a generation guarantee — a kWh number we commit to per year … we make it right at our cost …",
      reason: "A contractual guarantee; needs the contract clause (formula, exclusions, remedy).",
      ref: "S-12 · CL-11",
    },
    {
      id: "S-13",
      where: "faq › The system",
      text: "Which solar panel is best for residential societies? — … tier-1 mono-PERC or TOPCon panels in the 540–580 Wp range … 25-year linear performance warranty + 12-year product warranty as standard. We stick to 5 vetted panel brands …",
      reason: "'Tier-1', the warranties and '5 vetted brands' need OEM documents and named brands; the product warranty conflicts with the Homes page. The 540–580 Wp range is fine on its own.",
      ref: "S-13 · CL-05 · N-34 · N-40 · N-42 · N-33",
    },
    {
      id: "society:hero:covers-it-all",
      where: "hero lead (clause trimmed)",
      text: "— solar covers it all",
      reason: "Absolute claim; S-1 itself says 70–90%.",
      ref: "CL-27 · N-22 · P-SS-2",
    },
    {
      id: "society:journey:dozens",
      where: "journey lead (sentence trimmed)",
      text: "We've done this with dozens of societies.",
      reason: "Track-record claim; the repo says there are no verified ops numbers.",
      ref: "CL-14 · CF-05",
    },
    {
      id: "society:journey:pills",
      where: "journey benefit pills",
      text: "Draft AGM resolution included · Subsidy + paperwork handled · 5-year free maintenance · Single point of contact",
      reason: "The draft resolution needs legal review; service levels and maintenance scope need owner confirmation. No pills render on any audience page.",
      ref: "P-SS-4 · CL-32 · CL-33 · N-44",
    },
    {
      id: "society:journey:step-02:resolution",
      where: "journey step 02 (clause trimmed)",
      text: "plus a draft resolution your committee can circulate ahead of the AGM. No legalese.",
      reason: "See S-6:draft-resolution.",
      ref: "CL-32",
    },
    {
      id: "society:journey:step-03:financing",
      where: "journey step 03 (sentence trimmed)",
      text: "Bank financing options handled if you're going EMI.",
      reason: "Financing content waits for written lender tie-ups.",
      ref: "report §7.4 · F-63",
    },
    {
      id: "society:journey:step-04:equipment",
      where: "journey step 04 (clause trimmed)",
      text: "Tier-1 panels, certified installers,",
      reason: "See CL-05 and installer licences.",
      ref: "CL-05 · report §7.4",
    },
    {
      id: "society:journey:step-05:reports",
      where: "journey step 05 (sentence trimmed)",
      text: "Society gets transparent monthly generation reports.",
      reason: "Monitoring and report deliverables are unverified.",
      ref: "CL-18 · report §7.5 #15",
    },
    {
      id: "society:maintenance-vs-warranty",
      where: "journey step 05 and included list (conflict recorded; '5-year free maintenance' renders as the page value)",
      text: "5-year free maintenance vs '5-year service warranty' vs 'lifetime after-sales'; 'the same month' vs the 30–60 day approval phase",
      reason: "Owner confirms the maintenance scope per segment and the switch-on timing.",
      ref: "N-44 · CF-04 · N-54",
    },
    {
      id: "society:trust:card-01:resolution",
      where: "trust card 1 (sentence trimmed)",
      text: "Includes a draft resolution.",
      reason: "See S-6:draft-resolution.",
      ref: "CL-32",
    },
    {
      id: "society:lead-form:pill",
      where: "lead form chip and lead (clause trimmed)",
      text: "Free site visit + draft AGM resolution / , including draft resolution language",
      reason: "See S-6:draft-resolution. The AGM proposal itself is kept as wording; the owner confirms the pack exists.",
      ref: "P-SS-3 · CL-32 · report §7.5 #15",
    },
    {
      id: "society:lead-form:placeholder",
      where: "society name field placeholder",
      text: "e.g. Brigade Gardenia CHS",
      reason: "Names a real third party.",
      ref: "F-65",
    },
  ],
};

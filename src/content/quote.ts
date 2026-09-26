/**
 * The calculator and /get-quote: every word the estimate flow prints.
 *
 * It exists because the flow's copy was spread across five client islands, a page, the estimate
 * engine, the lead schema and the acknowledgement email as string literals. A literal cannot be
 * overlaid, and a client island may not import a content module at all
 * (scripts/check-client-content.ts), so the strings had to come out into one module that a
 * Server Component reads and hands down as props.
 *
 * Three rules hold it together.
 *
 * 1. **Interpolation is a template, not a concatenation.** Kannada puts the hole somewhere else
 *    in the line — "Over {years} years" becomes "{years} ವರ್ಷಗಳಲ್ಲಿ" — so every figure, rate and
 *    reference travels as a `{name}` that `fill`/`fillParts` (src/i18n/format.ts) substitutes.
 *    `kn-parity.test.ts` checks that both locales use the same set of names.
 * 2. **Markup is a tag, not a split string.** A sentence with a link or an accented run inside it
 *    is ONE row for the reviewers — "…have read the <privacy>privacy notice</privacy>." — because
 *    a translator cannot place a fragment they cannot see the sentence around. `fillTags`
 *    (src/components/quote/template.tsx) turns the tags back into elements.
 * 3. **The engine keeps the keys, this keeps the words.** `assumptions` and `citations` are
 *    indexed by the keys `buildEstimate` returns (src/lib/solar/calc.ts), which is what lets the
 *    same estimate render in either language without the engine knowing a language exists.
 *
 * `as const` is load-bearing: `Translation<typeof quotePage>` derives the Kannada overlay's shape
 * from the literal object, so a key added here is a compile error until `npm run build:kn` has
 * regenerated `src/content/kn/quote.ts`.
 */

import { citationFor } from "@/lib/solar/constants";
import {
  ANNUAL_TARIFF_INFLATION,
  BESCOM_DOMESTIC_SLABS,
  DEFAULT_NON_DOMESTIC_TARIFF,
  INSTALL_COST_PER_KWP,
  OFFSET_CAP,
  PM_SURYA_GHAR_RESIDENTIAL,
  ROOF_SQFT_PER_KWP,
  SPECIFIC_YIELD,
} from "@/lib/solar/constants";

export const quotePage = {
  meta: {
    title: "Solar estimate calculator",
    description:
      "Size a rooftop solar system for your home, housing society or business, see the estimated cost, savings and payback, then ask us for a proposal.",
  },

  /** Visible trail, its landmark name, and the name the JSON-LD crumb carries. */
  breadcrumb: {
    navLabel: "Breadcrumb",
    home: "Home",
    current: "Calculator",
  },

  /** The dark panel at the top: owner-approved prototype copy (D-009), calc.eyebrow and calc.title. */
  hero: {
    eyebrow: "Solar calculator",
    title: "Estimate the right solar system for your site.",
    /**
     * PROPOSED CONTENT — REQUIRES CLIENT APPROVAL. Shortened at owner review: the instruction it
     * used to carry is what the Step 1 column says beside it.
     */
    lead: "The figures update as you go.",
    source: "prototype calc · lead proposed",
    status: "owner-approved-template",
  },

  step1: {
    eyebrow: "Step 1",
    heading: "Your property and usage",
  },

  step2: {
    eyebrow: "Step 2",
    /** `<accent>` marks the run that renders in the accent green; the reviewer moves it. */
    title: "Get your <accent>proposal</accent>.",
    lead: "Your estimate is sent with your details.",
  },

  aside: {
    heading: "Prefer to talk?",
    whatsapp: "WhatsApp us",
  },

  /** Step 1's controls. The PIN code and the roof area are optional; the bill is not. */
  controls: {
    segmentLegend: "What are you putting solar on?",
    billLabel: "Your monthly electricity bill",
    billHint: "Use a typical month, before any solar.",
    pincodeLabel: "PIN code",
    pincodeHint: "Confirms which supplier serves you.",
    /** PROPOSED CONTENT — REQUIRES CLIENT APPROVAL. Validation microcopy; it makes no claim. */
    pincodeError: "Enter a 6-digit PIN code, for example 560001.",
    /** The redesign (#14) sizes from the sanctioned load on the bill, in place of roof area. */
    loadLabel: "Sanctioned load (kW)",
  },

  /** What each property type is, under its own label (which `ui.calculator.segments` carries). */
  segments: {
    home: "A house or villa",
    "housing-society": "Apartments and gated communities",
    commercial: "Shops, offices, factories and warehouses",
  },

  /**
   * The figures panel. Tile labels double as the placeholders shown before an estimate exists.
   *
   * The units (kWp, kWh, years) are not here: `ui.calculator` already carries them for the home
   * page's panel, and one row of reviewers' copy should not have two homes.
   */
  results: {
    heading: "Your estimate",
    /** The redesign (#14) leads with the system size in its own callout, then three tiles. */
    recommendedLabel: "Recommended system",
    roofNeeded: "~{sqft} sq ft of roof",
    monthlySavingsLabel: "Monthly savings",
    paybackLabel: "Payback",
    subsidyLabel: "PM Surya Ghar subsidy",
    /** Shown when the society subsidy was computed without a house count. */
    subsidyNote: "Upper limit",
    indicativeCostLabel: "Indicative cost",
    assumptionsLabel: "Assumptions",
    /**
     * PROPOSED CONTENT — REQUIRES CLIENT APPROVAL.
     * Sits directly under the figures and must stay visible: the page shows modelled numbers,
     * and report §11 forbids presenting them as an offer.
     */
    disclaimer: "This is an estimate based on the assumptions above, not a quote or a guarantee.",
    source: "report §11 (disclaimer) · tile labels prototype calc",
    status: "proposed",
  },

  /** The phone-only bar that keeps the headline figure in view during step 1. */
  summary: {
    /** The empty state, shown until a bill is typed (the bill has been a typed field since #14). */
    waitingHeading: "Your estimate",
    waitingNote: "Set your monthly bill to see it",
    kwp: "{kwp} kWp",
    perYear: "{amount} a year (estimated)",
    cta: "Get proposal",
  },

  /**
   * Compact rupee suffixes. `formatInr(…, { compact })` prints the number and this decides how
   * a lakh or a crore is named — "₹8.2L" in English, "₹8.2 ಲಕ್ಷ" in Kannada, which is a word
   * rather than a letter and so cannot be a suffix appended in code.
   */
  format: {
    compactLakh: "₹{amount}L",
    compactCrore: "₹{amount}Cr",
  },

  /**
   * The assumptions panel, keyed by what `buildEstimate` returns.
   *
   * One entry per `AssumptionKey`, each with the label it files under and the template its
   * `params` fill. The tariff and the subsidy have one entry per branch rather than one entry
   * with a nested choice, so a key always names exactly one sentence.
   */
  assumptions: {
    tariffSlabs: {
      label: "Tariff",
      value: "BESCOM domestic (LT-2(a)) energy charges only (average ₹{rate} per unit at your usage)",
    },
    tariffFlat: { label: "Tariff", value: "₹{rate} per unit (flat average)" },
    /** The average-tariff input was withdrawn at owner review round 2; the engine keeps the branch. */
    tariffEntered: { label: "Tariff", value: "₹{rate} per unit" },
    offset: {
      label: "Solar offset",
      value: "Up to {offsetPct}% of your monthly units; fixed charges and taxes stay payable",
    },
    exportCredit: { label: "Export credit", value: "Not included for surplus units" },
    generation: { label: "Generation", value: "{yield} kWh per kWp per year" },
    installedCost: { label: "Installed cost", value: "₹{costPerKwp} per kWp before subsidy" },
    subsidyHome: {
      label: "PM Surya Ghar subsidy",
      value:
        "₹{firstRate} per kW for the first {firstKw} kW and ₹{secondRate} per kW for the next {secondKw} kW, up to ₹{cap}, for eligible residential connections; decided and paid by the Government after DISCOM inspection; scheme period to {schemeEnd}",
    },
    subsidySociety: {
      label: "PM Surya Ghar subsidy",
      value:
        "₹{ratePerKw} per kW for common facilities, up to {kwPerHouse} kW per house and {maxKw} kW in total; decided and paid by the Government after DISCOM inspection; scheme period to {schemeEnd}",
    },
    subsidyCommercial: { label: "PM Surya Ghar subsidy", value: "Not applicable to commercial connections" },
    roofArea: { label: "Roof area", value: "{sqftPerKwp} sq ft per kWp" },
    projection: {
      label: "Projection",
      value: "{years} years, {tariffPct}% tariff increase and {degradationPct}% panel degradation per year",
    },
  },

  /**
   * The provenance line under each assumption, keyed by `CitationKey`.
   *
   * Read from the constants rather than retyped, so the customer-facing citation has one source
   * (`citation` in src/lib/solar/constants.ts) and cannot drift from the figure it describes.
   * The two that are not a constant's citation are written here, and both say what the estimate
   * does rather than what Irradiant promises.
   */
  citations: {
    bescomSlabs: citationFor(BESCOM_DOMESTIC_SLABS),
    nonDomesticTariff: citationFor(DEFAULT_NON_DOMESTIC_TARIFF),
    enteredTariff: "Average tariff entered by you",
    offsetCap: citationFor(OFFSET_CAP),
    exportCredit: "Any surplus you export is settled by BESCOM under your metering arrangement",
    specificYield: citationFor(SPECIFIC_YIELD),
    installCost: citationFor(INSTALL_COST_PER_KWP),
    subsidy: citationFor(PM_SURYA_GHAR_RESIDENTIAL),
    roofSqft: citationFor(ROOF_SQFT_PER_KWP),
    tariffInflation: citationFor(ANNUAL_TARIFF_INFLATION),
  },

  /**
   * Step 2: the lead form, its states and everything the action can say back.
   *
   * Called `form` and not `leadForm`: `leadForm` is a fact key in kn-parity.test.ts (the three
   * audience modules carry an English-owned `leadForm` section that no page renders), and that
   * walk skips fact keys by NAME at any depth — so the name would have quietly excused this
   * whole section from the guard that says a Kannada page is in Kannada.
   */
  form: {
    labels: {
      /** Not `name`: `name` is a FIXED_KEY (src/i18n/translation.ts) and would be stripped. */
      yourName: "Your name",
      phone: "Mobile number",
      phoneHint: "A 10-digit Indian mobile number.",
      email: "Email address",
      message: "Anything we should know?",
      /**
       * PROPOSED CONTENT — REQUIRES CLIENT APPROVAL: consent wording carries legal weight and the
       * privacy notice it points to is still with counsel (content-inventory CL-25).
       */
      consent: "I agree to be contacted about my enquiry and have read the <privacy>privacy notice</privacy>.",
      whatsappOptIn: "You can also reach me on WhatsApp about this enquiry.",
      source: "content-inventory CL-25 (consent) · field labels proposed",
      status: "proposed",
    },

    submit: "Send my request",
    submitPending: "Sending…",
    /** Announced, not shown: the button's own label already changed. */
    srSending: "Sending your request",
    /**
     * Shown in place of a working submit while the email domain is unverified. It states what
     * the site can and cannot do right now, and makes no promise about when that changes.
     */
    sendingOff:
      "Sending is switched off until our email domain is verified. The figures above are live — use WhatsApp or the phone number below to send them to us.",

    successHeading: "Thanks — we have your request.",
    successReference: "Your reference is <ref>{reference}</ref>. Quote it if you get in touch.",
    errorReference: "Your reference is <ref>{reference}</ref>. Quote it and we can pick up from your details.",
    /** Always offered beside an error and after a success: the form is never the only way through. */
    fallback: "Prefer to talk? <whatsapp>WhatsApp us</whatsapp> or call <tel>{phone}</tel>.",

    /**
     * The name each field goes by in the error summary, which is a list of links to the controls.
     * Step 1's three are here too, because the action can reject a value the form carried over.
     */
    errorSummary: {
      yourName: "Your name",
      phone: "Mobile number",
      email: "Email address",
      message: "Your message",
      consent: "Permission to contact you",
      whatsappOptIn: "WhatsApp updates",
      segment: "What you are putting solar on",
      pincode: "PIN code",
      monthlyBill: "Monthly electricity bill",
    },

    /**
     * What the server says when it refuses.
     *
     * The keys are the codes `parseLeadForm` and `submitLead` return (src/lib/leads/errors.ts) —
     * the action never returns a sentence, so one action serves both locales and the wording
     * lives where a reviewer can read it. Dotted keys so a code is one lookup, and because a key
     * called `name` would be stripped as a fact.
     */
    fieldErrors: {
      "name.required": "Enter your name",
      "name.tooLong": "Keep your name under {max} characters",
      "name.lettersOnly": "Use letters only",
      "phone.required": "Enter your mobile number",
      "phone.invalid": "Enter a 10-digit Indian mobile number",
      "email.required": "Enter your email address",
      "email.tooLong": "Keep your email under {max} characters",
      "email.invalid": "Enter a valid email address",
      "segment.invalid": "Choose the type of property",
      "pincode.invalid": "Enter a 6-digit PIN code",
      "monthlyBill.notNumber": "Enter your monthly bill as a number",
      "monthlyBill.tooLarge": "That bill looks too large",
      "message.tooLong": "Keep your message under {max} characters",
      "consent.required": "Please agree so we can contact you about this enquiry",
      /** Quick-quote popup only. */
      "billBucket.required": "Choose your monthly bill",
    },

    formErrors: {
      send: "We couldn't send your request right now — please WhatsApp or call us instead.",
      rateLimited: "We've received several requests from your connection — please WhatsApp or call us instead.",
      tooFast: "That was quick. Please check your details and submit again.",
      invalid: "Please check the highlighted fields.",
    },
  },

  /**
   * The one-time acknowledgement to the customer, in the language they filled the form in.
   *
   * The internal sales alert is NOT here: it stays English for the team and says which language
   * the enquiry came in (docs/kannada/research/architecture.md §6.12).
   */
  email: {
    /** Not `subject`: `subject` is a FIXED_KEY and would be stripped from the overlay. */
    subjectLine: "We have your solar enquiry ({reference})",
    /** With an estimate the email is a quotation (PR #15): its subject carries the headline figures. */
    subjectEstimate: "Your solar estimate: {kwp} kWp at {netCost} ({reference})",
    heading: "Thanks, {firstName}. We have your enquiry.",
    headingEstimate: "Thanks, {firstName}. Here’s your solar estimate.",
    intro:
      "You asked about rooftop solar for your {segment}. We will review the details and get in touch to arrange a site visit so the final system size and figures can be confirmed.",
    introEstimate:
      "You asked about rooftop solar for your {segment}. Below are the indicative figures based on what you told us. We will review the details and get in touch to arrange a site visit so the final system size and figures can be confirmed.",
    estimateTitle: "Your solar estimate",
    rowSystemSize: "System size",
    rowCostBeforeSubsidy: "Cost before subsidy",
    rowSubsidy: "PM Surya Ghar subsidy",
    rowNetCost: "Net cost (after subsidy)",
    rowMonthlySavings: "Monthly savings",
    savingsShare: "{amount} ({share}% of your bill)",
    rowPayback: "Simple payback",
    paybackYears: "~{years} years",
    /** Popup leads give a bill range; this says which bill their figures were worked out at. */
    rangeNoteMiddle: "Worked out at {bill} a month, the middle of the {range} range. A site visit confirms the real figures.",
    rangeNoteFloor:
      "Worked out at {bill} a month, the lower edge of the “{range}” range, so treat these figures as a minimum. A site visit confirms the real figures.",
    submittedTitle: "What you submitted",
    rowReference: "Reference",
    rowProperty: "Property",
    rowPincode: "PIN code",
    rowMonthlyBill: "Monthly bill",
    rowWhatsapp: "WhatsApp updates",
    notGiven: "not given",
    yes: "Yes",
    no: "No",
    talkNow: "Prefer to talk now? Message us on WhatsApp and quote your reference.",
    talkNowText: "Prefer to talk now? Message us on WhatsApp and quote your reference: {whatsappUrl}",
    whatsappButton: "Message us on WhatsApp",
    /** The sender is do-not-reply@ (owner, 2026-09-26): say so, and point to the inboxes that are read. */
    contactLine: "Replies to this email do not reach us. Call {phone} or email {email}.",
    disclaimer:
      "Any figures shown by the calculator on our website are estimates, not a quote or a guarantee. Subsidies are decided and paid by the Government after DISCOM inspection.",
    footer:
      "You are receiving this because you submitted the estimate form on {site} on {datetime} and agreed to be contacted about this enquiry. It is not a marketing email.",
    /** The popup's email is one the visitor asked for after seeing their figures. */
    footerPopup:
      "You are receiving this because you asked us to email your estimate on {site} on {datetime} and agreed to be contacted about this enquiry. It is not a marketing email.",
    /** Timestamps are en-IN in both locales (§6.7); only the zone suffix is copy. */
    datetime: "{datetime} IST",
    source: "brand PDF p.70 · 17 §6.3 (consent record) · report §11 (disclaimer)",
    status: "proposed",
  },

  /** Customer-to-company WhatsApp prefill; it carries only the reference, never personal data. */
  whatsappPrefill: "Hi, I sent a solar enquiry on the Irradiant Energy website (ref {reference}).",
} as const;

export type QuotePage = typeof quotePage;

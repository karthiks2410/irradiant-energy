/**
 * The UI dictionary: strings that were written inline in components.
 *
 * Page copy lives in the other modules in this folder, each one owned by the section it belongs
 * to. This module owns the rest — the chrome (skip link, header, menu, footer), the accessible
 * names nobody sees, and the few labels that belong to a component rather than to a section of
 * copy. They were literals inside JSX, which is fine until a second language needs them: a
 * literal cannot be overlaid.
 *
 * Two rules hold this file together.
 *
 * 1. **Nothing here is a claim.** Every string is a label, a control name or an accessible name.
 *    Anything that asserts something about the business, the equipment or a government scheme
 *    belongs in a content module with a `source` and a `status`.
 * 2. **Interpolation is a template, not a concatenation.** "Call {phone}" and
 *    "{groupLabel} · Rooftop solar" keep their holes, because Kannada puts the hole somewhere
 *    else in the line. `fill`/`fillParts` (src/i18n/format.ts) do the substitution, and
 *    `ui.test.ts` checks that both locales use the same set of names.
 *
 * `as const` is load-bearing: `Translation<typeof ui>` derives the Kannada overlay's shape from
 * the literal object, so a key added here is a compile error until `src/content/kn/ui.ts` is
 * regenerated (`npm run build:kn`).
 */

import { flagNotes } from "@/lib/solar/flag-notes";
import { SEGMENT_LABELS } from "@/lib/solar/constants";

export const ui = {
  layout: {
    skipLink: "Skip to content",
  },

  meta: {
    /**
     * The root layout's `title.default`, used by any route that sets no title of its own.
     * `{siteName}` is a template hole rather than a concatenation because Kannada does not put
     * the brand where English does.
     */
    defaultTitle: "{siteName} | Rooftop solar for homes, housing societies and businesses",
    /**
     * Alt text for the Open Graph and Twitter cards. The card artwork itself stays Latin — it is
     * the wordmark and the brand line (brand PDF p.30/p.40) — but the text that describes it is
     * read out in the reader's language.
     */
    socialImageAlt: "{siteName} — {tagline}",
  },

  breadcrumbs: {
    /** `aria-label` on the trail. */
    ariaLabel: "Breadcrumb",
    /** The first crumb, added by <Breadcrumbs> and by <BreadcrumbJsonLd> so the two agree. */
    home: "Home",
  },

  header: {
    /** `aria-label` on the desktop nav. */
    navLabel: "Main",
    /** The phone link's accessible name; the visible text is the number itself. */
    callSrLabel: "Call Irradiant Energy",
  },

  mobileMenu: {
    open: "Open menu",
    dialogLabel: "Menu",
    close: "Close menu",
    /** `aria-label` on the nav inside the sheet, so it is distinct from the desktop one. */
    navLabel: "Mobile",
    groupLabel: "{groupLabel} · Rooftop solar",
    call: "Call us",
    whatsappPrefill: "Hi {siteName}, I'd like to know more about rooftop solar.",
  },

  solutionsMenu: {
    panelLabel: "Rooftop solar",
    notSure: "Not sure which fits?",
    compareAll: "Compare all three",
  },

  footer: {
    companyTitle: "Company",
    legalTitle: "Legal",
    connectTitle: "Connect",
    about: "About",
    contact: "Contact",
    privacy: "Privacy notice",
    terms: "Terms of use",
    cookies: "Cookie notice",
    /** The persistent way to change the consent answer; it opens the preferences dialog. */
    cookieSettings: "Cookie settings",
    whatsapp: "WhatsApp us",
    /** Base-band registration line. Rendered only once the GSTIN is known (site.legal.gstin). */
    gstin: "GSTIN {gstin}",
  },

  social: {
    listLabel: "{siteName} on social media",
    /** Says where the link goes, not just which logo it is (WCAG 2.4.4). */
    profileLink: "{siteName} on {platform}",
    pendingLabel: "{platform} — {note}",
  },

  whatsappBubble: {
    srLabel: "Message {siteName} on WhatsApp",
  },

  fields: {
    optionalMarker: "(optional)",
  },

  /**
   * The two system pages.
   *
   * `notFound` is `src/app/[lang]/not-found.tsx`, which answers a `notFound()` call inside the
   * locale tree. The 404 for a URL that matches no route at all is `src/app/global-not-found.tsx`,
   * which Next renders without a layout and therefore without a locale: it stays bilingual and
   * static (docs/kannada/research/architecture.md §6.14) and does not read this module.
   *
   * `error` is the route error boundary, which Next requires to be a Client Component. It reads
   * these through <UiProvider> rather than importing them, because a client module that imported
   * this file would ship both locales' copy (scripts/check-client-content.ts).
   */
  notFound: {
    metaTitle: "Page not found",
    eyebrow: "Error 404",
    heading: "We can’t find that page.",
    body: "The link may be out of date, or the page may have moved while the site was being rebuilt. These are good places to start again.",
    homeCta: "Go to the home page",
    solutionsCta: "See our solutions",
    contactCta: "Contact us",
  },

  error: {
    eyebrow: "Something went wrong",
    heading: "This page didn’t load properly.",
    body: "Please try again. If it keeps happening, the home page and the contact page still work.",
    retryCta: "Try again",
    homeCta: "Go to the home page",
  },

  /**
   * The consent banner and the preferences dialog (architecture §6.13).
   *
   * DPDP §6(3) requires the consent request itself to be available in the language the reader
   * chose, so on /kn every one of these renders in Kannada — the question, both answers and the
   * per-category detail, not just the surrounding page.
   *
   * Three of them carry inline markup as named slots rather than as HTML: `<lead>` is the opening
   * emphasis, `<cookieLink>` and `<privacyLink>` are the two notices, and `<code>` is the cookie's
   * own name. <RichText> (src/components/i18n/RichText.tsx) substitutes the element, so a
   * translator moves the link inside the sentence without touching a className or an href.
   */
  consent: {
    banner: {
      /** Visually hidden: the dialog still needs a name. */
      title: "We value your privacy",
      body: "<lead>This site loads no analytics and sets no tracking cookies.</lead> Accept and we may count page visits — no name, no profile, no tracking across other sites. Refuse and nothing loads. <cookieLink>Cookie notice</cookieLink>.",
      accept: "Accept",
      /** The whole accessible name, not a suffix: Kannada does not append to a verb. */
      acceptAria: "Accept analytics",
      reject: "Reject",
      rejectAria: "Reject analytics",
      manage: "Manage preferences",
    },
    settings: {
      title: "Cookie and analytics preferences",
      closeAria: "Close preferences without saving",
      necessary: {
        heading: "Strictly necessary",
        badge: "Always on",
        body: "Your answer to this question, kept in a first-party cookie named <code>{cookieName}</code> that is written only once you choose. It holds your answer, the date and a version number — no name, no identifier. It lasts {days} days and is read only by this site. Without it we would have to ask you again on every page.",
        security: "Our hosting provider may also set a short-lived cookie to check that a request comes from a person rather than an automated tool. That protects the site; it is not used to follow you.",
      },
      analytics: {
        heading: "Analytics",
        label: "Allow analytics",
        hint: "Not loaded today: no measurement script runs on this site. If we switch one on, it would count page visits — which page, the broad region the visit came from, the kind of device — with no name, no profile and no tracking across other websites. It will not load while this is off, and turning it off later stops it again.",
      },
      save: "Save preferences",
      rejectAll: "Reject all",
      moreDetail: "More detail in our <cookieLink>cookie notice</cookieLink> and <privacyLink>privacy notice</privacyLink>.",
    },
    /**
     * Announced by the manager's polite status region after a choice is saved.
     *
     * Named `saved` and not `status`: `status` is a FIXED_KEY (src/i18n/translation.ts), because
     * everywhere else in the content it marks a claim's approval state — so an overlay may never
     * carry it, and a section called `status` would be silently dropped from the Kannada file.
     */
    saved: {
      accepted: "Saved. Analytics is allowed. You can change this any time from Cookie settings in the footer.",
      refused: "Saved. Analytics is refused, so nothing is measured. You can change this any time from Cookie settings in the footer.",
    },
    /** The stored answer, shown on /cookies before the control that changes it. */
    panel: {
      loading: "Reading your saved choice…",
      unanswered: "You have not answered yet, so nothing optional is loaded.",
      allowed: "Analytics: allowed. Nothing is measured today; if measurement is switched on, this answer lets it run.",
      refused: "Analytics: refused. Nothing is loaded, and nothing will load while this answer stands.",
      answeredAt: "Answered {date}",
      open: "Open cookie settings",
    },
  },

  home: {
    /** `aria-roledescription` on the hero section. */
    heroCarousel: "carousel",
    heroDot: "Show slide {n} of {total}: {eyebrow}",
    heroPause: "Pause the hero slideshow",
    heroPlay: "Play the hero slideshow",
    heroBillLabel: "Your monthly electricity bill",
    heroSubmit: "See my estimate",
    heroNoSignup: "No phone number, no sign-up.",
    /** Link line on an audience card; `{segment}` is the card's own title, lower-cased. */
    audienceCardCta: "See solar for {segment}",
    /** Link line on the one system card that links out (Generate). */
    systemGenerateCta: "Explore rooftop solar",
    finalCtaCall: "Call {phone}",
  },

  calculator: {
    pincodePlaceholder: "e.g. 560001",
    /**
     * PROPOSED CONTENT — REQUIRES CLIENT APPROVAL. Validation microcopy: it describes what the
     * calculator needs, and makes no claim about solar, tariffs or the business.
     */
    pincodeError: "Enter a 6-digit PIN code, for example 560001.",
    /** Under the payback tile when a subsidy is counted in it. */
    subsidyNote: "After the estimated subsidy",
    /** Under the recommended system size (redesign #14). */
    roofNeeded: "~{sqft} sq ft of roof",
    yearsUnit: "years",
    kwpUnit: "kWp",
    kwhUnit: "kWh",
    /**
     * Property-type labels and the engine's own flag wording, copied out of the modules that
     * define them so they can be overlaid and handed to the client island as props. The engine
     * keeps the keys; this keeps the words.
     */
    segments: { ...SEGMENT_LABELS },
    flags: { ...flagNotes },
  },

  /**
   * The quick-quote popup (header button on every page) and the buttons that open it.
   * PROPOSED CONTENT — REQUIRES CLIENT APPROVAL.
   *
   * "Quote" for this journey, which ends in a written quotation after a site visit; "estimate" for
   * anything the calculator computes. Sentence case, never "FREE".
   */
  quickQuote: {
    cta: "Get a free quote",
    siteVisitCta: "Book a free site visit",
    quote: {
      title: "Get a free quote",
      lead: "See your estimate now. We follow up with a free site visit.",
      submit: "See my estimate",
    },
    siteVisit: {
      title: "Book a free site visit",
      lead: "We check your roof and send a written quotation. Your estimate shows straight away.",
      submit: "Book my visit",
    },
    close: "Close",
    name: "Name",
    phone: "WhatsApp number",
    pincode: "PIN code",
    segment: "Property",
    /** Short enough for three chips beside the PIN field. */
    segmentShort: { home: "Home", "housing-society": "Society", commercial: "Business" },
    bill: "Monthly electricity bill",
    consent: "Irradiant Energy may call or WhatsApp me about this enquiry. I have read the {privacy}.",
    privacy: "privacy notice",
    sending: "Sending…",
    resultTitle: "Your estimate",
    resultFor: "For a {segment} with a bill of {bill} a month",
    systemSize: "System size",
    monthlySavings: "Monthly savings",
    subsidy: "Subsidy",
    note: "Estimates from your bill range, not a quote — a site visit confirms the final price. Reference {reference}; we will call you on the number you gave.",
    fullBreakdown: "See the full breakdown",
    whatsapp: "Talk to us on WhatsApp",
    emailLabel: "Email me the full breakdown",
    emailHint: "Optional. One email, no newsletters.",
    emailPlaceholder: "you@example.com",
    emailSubmit: "Send",
    emailSent: "Sent to {email}, with the cost and payback too.",
    failedWhatsapp: "Send it on WhatsApp instead",
    /** The words around a range; `{value}` is the figure (src/lib/leads/quick.ts RangeWords). */
    ranges: {
      under: "Under {value}",
      over: "Over {value}",
      from: "From {value}",
      upTo: "Up to {value}",
      noSubsidy: "Not available for businesses",
    },
  },
} as const;

export type Ui = typeof ui;

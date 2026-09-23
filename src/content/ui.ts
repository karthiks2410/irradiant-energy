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
    /** Note under the savings tile; `{years}` is the engine's projection horizon. */
    savingsNote: "Over {years} years",
    subsidyNote: "After the estimated subsidy",
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
} as const;

export type Ui = typeof ui;

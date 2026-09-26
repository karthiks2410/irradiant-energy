/**
 * /contact — the ways in (phone, WhatsApp, email, the office) and the DPDP grievance route.
 *
 * The page used to carry these strings inline in its JSX, which is fine until a second language
 * needs them: a literal cannot be overlaid. The FACTS stay in site.ts and are read from there —
 * the two numbers, the email address, the postal address and the grievance officer — so nothing
 * here can move a phone number or an address.
 *
 * Sentences that carry a fact are TEMPLATES with named holes ("Email {email} or call {phone} …"),
 * never English fragments concatenated around a value: Kannada puts the hole somewhere else in
 * the line, and the verb last. `fill()` and the page's own `around()` do the substitution
 * (src/i18n/format.ts, architecture.md §6.5).
 */

import type { SectionCopy, Sourced } from "@/content/types";

const meta = {
  title: "Contact us",
  description:
    "Call, WhatsApp or email Irradiant Energy in Anekal, Bengaluru about rooftop solar anywhere in Karnataka, or ask us to call you back.",
  source: "proposed · the channels are site.ts facts",
  status: "proposed",
} as const satisfies Sourced & { title: string; description: string };

export const contactPage = {
  meta,

  /** Breadcrumb and JSON-LD name for this page; the nav label, kept in one place. */
  breadcrumb: "Contact",

  // PROPOSED CONTENT — REQUIRES CLIENT APPROVAL: positioning copy, no promise of a response time.
  hero: {
    title: "Talk to us about your roof.",
    /** The green run, written out: the old rule took the last two words (accent-split.test.ts). */
    accent: "your roof.",
    lead: "Tell us where you are and what you would like to power.",
    source: "proposed",
    status: "proposed",
  },

  /** The ways in, one row each on a shared hairline rhythm. */
  ways: {
    heading: "Ways to reach us",
    callEyebrow: "Call us",
    whatsapp: {
      /** The network's own name; it is not translated (WCAG 2.2 SC 3.1.2 exempts proper names). */
      eyebrow: "WhatsApp",
      body: "Send photos of your roof or your last electricity bill.",
      button: "Message us on WhatsApp",
      /** Legacy global prefill (report §11.2) with the rename applied (D-001). Carries no personal data. */
      prefill: "Hi! I'm interested in learning more about {siteName} solar solutions.",
    },
    emailEyebrow: "Email",
    office: {
      eyebrow: "Our office",
      mapsLink: "Open in Google Maps",
    },
  },

  /**
   * DPDP grievance route. `fallback` renders only while site.ts has no named grievance officer;
   * it is translated all the same, because which branch renders is a fact about the business and
   * can change without anyone revisiting this file.
   */
  grievance: {
    heading: "Grievance and privacy contact",
    body: "Write here to find out what personal information we hold about you, have it corrected or deleted, withdraw consent, or complain about how we handled your details.",
    fallback: "Email {email} or call {phone} and say that it is a privacy request.",
    privacyNotice: "Our {privacyNoticeLink} sets out what we collect through this site and why.",
    /** The link text inside the sentence above. */
    privacyNoticeLink: "privacy notice",
  },

  // PROPOSED CONTENT — REQUIRES CLIENT APPROVAL: positioning copy, no promise of a response time.
  /** The closing band. The phone numbers are this page's subject, so the band drops its call link. */
  callBack: {
    title: "Prefer a call back?",
    accent: "call back?",
    lead: "Send us your PIN code and a rough idea of your monthly electricity bill, and we will come back to you about your roof.",
    source: "proposed",
    status: "proposed",
  },
} as const satisfies {
  meta: Sourced & { title: string; description: string };
  breadcrumb: string;
  hero: SectionCopy & { accent: string; lead: string };
  ways: {
    heading: string;
    callEyebrow: string;
    whatsapp: { eyebrow: string; body: string; button: string; prefill: string };
    emailEyebrow: string;
    office: { eyebrow: string; mapsLink: string };
  };
  grievance: { heading: string; body: string; fallback: string; privacyNotice: string; privacyNoticeLink: string };
  callBack: SectionCopy & { accent: string; lead: string };
};

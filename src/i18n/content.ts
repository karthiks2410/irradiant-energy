/**
 * `getContent(locale)` — the one door page code uses to read copy.
 *
 * It returns the English modules for `en` and the English modules with the Kannada overlay
 * merged in for `kn`, and both have the SAME TypeScript type. That is the whole point: a band
 * reads `content.home.about.copy.title` and never asks which language it is in, so there is no
 * `if (locale === "kn")` anywhere in a component and no way for one locale to drift a section
 * ahead of the other.
 *
 * Server-only by convention and by construction: it pulls in both locales' copy, so a client
 * component importing it would ship Kannada into an English bundle and English into a Kannada
 * one. `scripts/check-client-content.ts` fails the build if any `"use client"` module reaches a
 * content module, and strings travel to the islands as props instead.
 *
 * Hrefs are NOT rewritten here. Every route carries its locale prefix and `<Link>`
 * (components/i18n/LocaleLink.tsx) adds it from the path the reader is on, so doing it twice
 * would be two places to keep right instead of one.
 */

import { homeFaq as enHomeFaq } from "@/content/faq-home";
import { homePage as enHomePage } from "@/content/home";
import { projectImages as enProjectImages } from "@/content/images";
import { nav as enNav, primaryCta as enPrimaryCta, site as enSite, socialPending as enSocialPending } from "@/content/site";
import { faqCardLabels as enFaqCardLabels } from "@/content/solutions/shared";
import { quotePage as enQuotePage } from "@/content/quote";
import { ui as enUi } from "@/content/ui";
import * as kn from "@/content/kn";
import type { Locale } from "./config";
import { localize } from "./translation";

export interface Content {
  /** Business facts and the two strings on them that are copy (tagline, description). */
  readonly site: typeof enSite;
  /** Header, footer and mobile-sheet navigation, in reading order. */
  readonly nav: typeof enNav;
  /**
   * The Solutions group, which is `nav`'s one group — not a second copy of it.
   *
   * Typed off `nav` rather than as `NavGroup`, so the header and the footer see the same readonly
   * literal the overlay was checked against.
   */
  readonly solutions: SolutionsGroup;
  readonly primaryCta: typeof enPrimaryCta;
  /** Profiles shown but not linked yet, with the reason each one is inert. */
  readonly socialPending: typeof enSocialPending;
  readonly home: typeof enHomePage;
  readonly faq: typeof enHomeFaq;
  readonly images: typeof enProjectImages;
  /** The two buttons on the "Still have questions?" card. */
  readonly faqCardLabels: typeof enFaqCardLabels;
  /** The calculator and /get-quote, including the customer acknowledgement email. */
  readonly quote: typeof enQuotePage;
  readonly ui: typeof enUi;
}

/** The one entry in `nav` that has children. */
type SolutionsGroup = Extract<(typeof enNav)[number], { items: unknown }>;

const isSolutionsGroup = (item: (typeof enNav)[number]): item is SolutionsGroup => "items" in item;

function build(locale: Locale): Content {
  const overlay = locale === "kn";
  const nav = overlay ? localize(enNav, kn.nav, "nav") : enNav;
  const solutions = nav.find(isSolutionsGroup);
  if (!solutions) throw new Error("content: nav has no Solutions group");

  return {
    site: overlay ? localize(enSite, kn.site, "site") : enSite,
    nav,
    solutions,
    primaryCta: overlay ? localize(enPrimaryCta, kn.primaryCta, "primaryCta") : enPrimaryCta,
    socialPending: overlay ? localize(enSocialPending, kn.socialPending, "socialPending") : enSocialPending,
    home: overlay ? localize(enHomePage, kn.homePage, "home") : enHomePage,
    faq: overlay ? localize(enHomeFaq, kn.homeFaq, "faq") : enHomeFaq,
    images: overlay ? localize(enProjectImages, kn.projectImages, "images") : enProjectImages,
    faqCardLabels: overlay ? localize(enFaqCardLabels, kn.faqCardLabels, "faqCardLabels") : enFaqCardLabels,
    quote: overlay ? localize(enQuotePage, kn.quotePage, "quotePage") : enQuotePage,
    ui: overlay ? localize(enUi, kn.ui, "ui") : enUi,
  };
}

/**
 * Built once per locale.
 *
 * Content is immutable and there are two locales, so the merge runs twice for the life of the
 * process rather than once per page. A plain Map rather than React's `cache` because the value
 * does not depend on the request, and because the generator and the tests call this outside any
 * request at all.
 */
const cache = new Map<Locale, Content>();

export function getContent(locale: Locale): Content {
  let content = cache.get(locale);
  if (!content) {
    content = build(locale);
    cache.set(locale, content);
  }
  return content;
}

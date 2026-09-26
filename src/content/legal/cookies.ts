// DRAFT — FOR COUNSEL REVIEW (docs/discovery/17, 18)
//
// This notice describes what the site does: no advertising tags, no third-party embeds, and Google
// Analytics 4 only for a visitor who allows analytics — and only in a build that has a
// measurement ID (src/lib/analytics.ts). The one list item that differs between those two builds
// is an AnalyticsVariant (src/content/types.ts): <LegalBody> picks the side that matches
// `analyticsEnabled`. Everything else is true in both. Fonts are self-hosted by the framework and
// maps are plain links, so no third-party request is made before an answer.
//
// Every word here has to match what src/components/consent/* and src/lib/gtag.ts actually do —
// the old site's banner described GA4 and Google Ads that were never loaded while Vercel Analytics
// ran regardless of the answer (docs/discovery/17 §2.6, 18 §9.6), and that is the failure this
// notice exists to avoid repeating. The Google Analytics section restates the configuration in
// src/lib/gtag.ts (cookie names and lifetime, signals and ad personalisation off, query strings
// stripped, cookies deleted on withdrawal) plus the retention the owner sets in the GA4 admin.
//
// IF ANYTHING CHANGES — Vercel Web Analytics, a tag manager, a pixel, an embedded map or video —
// update this notice, the Analytics card in ConsentSettings and the privacy notice FIRST, put the
// tracker behind the consent answer, and bump CONSENT_VERSION so every earlier answer is asked
// again. Do not switch on a tracker and describe it later.
//
// PROPOSED CONTENT — REQUIRES CLIENT APPROVAL (2026-09-26): the description, the summary, the
// Analytics bullet, the whole "Google Analytics, if you allow it" section and the rewritten banner
// section are new wording.
//
// The page is noindex until counsel approves it (./index.ts).
//
// Every sentence is one row in docs/kannada/translations/units.json, matched by its exact text:
// reword one here and the Kannada build stops until the row is updated.

import type { LegalNotice } from "@/content/types";

export const cookieNotice = {
  title: "Cookies and analytics",
  // PROPOSED CONTENT — REQUIRES CLIENT APPROVAL
  description:
    "What this site stores in your browser, what the privacy banner asks, and how Google Analytics is used only if you allow it. No advertising cookies.",
  // PROPOSED CONTENT — REQUIRES CLIENT APPROVAL
  summary:
    "Nothing that measures your visit runs unless you allow it. This page explains what the privacy banner asks and what each answer does.",

  sections: [
    {
      heading: "What cookies are",
      body: [
        "A cookie is a small file a website asks your browser to keep. This page also covers other browser storage, such as local storage.",
      ],
    },
    {
      heading: "What this site uses",
      body: [
        {
          items: [
            // PROPOSED CONTENT — REQUIRES CLIENT APPROVAL. The second sentence follows the build, so
            // the item is true before and after the measurement ID is set.
            {
              withAnalytics:
                "<strong>Analytics, only if you allow it.</strong> We use Google Analytics 4 to count visits, for visitors who allow analytics. While analytics is off or unanswered, no Google script loads and nothing is sent to Google. The details are <gaLink>below</gaLink>.",
              withoutAnalytics:
                "<strong>Analytics, only if you allow it.</strong> Visit measurement is not switched on at the moment. If we switch it on, it will be Google Analytics 4, and only for visitors who allow analytics. While analytics is off or unanswered, no Google script loads and nothing is sent to Google. The details are <gaLink>below</gaLink>.",
            },
            "<strong>No advertising or social pixels.</strong> Nothing here builds an advertising audience.",
            // {cookieName} and {days} are CONSENT_COOKIE_NAME and CONSENT_COOKIE_DAYS (src/lib/consent.ts).
            "<strong>Your privacy answer.</strong> If you answer the banner, we keep one first-party cookie named <strong>{cookieName}</strong> for {days} days. It records your answer, the date and a version number — no name, no identifier, nothing that describes you. Delete it and we simply ask again.",
            "<strong>No third-party fonts or icons loaded from other companies.</strong> The typefaces are served from this site, so your browser does not have to ask anyone else for them.",
            "<strong>Security checks.</strong> Our hosting provider may set a short-lived cookie if it needs to confirm that a request comes from a person rather than an automated tool. It is used only to protect the site.",
          ],
        },
        "Separately from cookies, our hosting provider keeps a technical record of each request, described in our <privacyLink>privacy notice</privacyLink>.",
      ],
    },
    {
      // PROPOSED CONTENT — REQUIRES CLIENT APPROVAL: this whole section. Each statement is a setting
      // in src/lib/gtag.ts, except the two-month retention, which the owner keeps (it is the GA4
      // default) under Admin → Data collection and modification → Data retention. The Analytics
      // item above links here ("below").
      id: "google-analytics",
      heading: "Google Analytics, if you allow it",
      body: [
        "When you allow analytics, your browser loads Google’s measurement script from googletagmanager.com and sends records of your visit to Google Analytics 4. They tell us:",
        {
          items: [
            "which pages are viewed, in what order and for how long;",
            "how the visit arrived — for example from a search engine, a shared link or a campaign link;",
            "the approximate city or region, which Google works out from your internet address;",
            "the kind of device, the browser, the screen size and the language setting.",
          ],
        },
        // {gaCookie} is `_ga_` plus the measurement ID without its "G-" (`_ga_…` in a build without
        // one), and {days} is CONSENT_COOKIE_DAYS, which src/lib/gtag.ts also sets as the lifetime
        // of the _ga cookies.
        "<strong>Cookies.</strong> Google Analytics keeps a random identifier in two first-party cookies on this site, <strong>_ga</strong> and <strong>{gaCookie}</strong>, so it can tell a returning browser from a new one. They expire {days} days after your last visit.",
        "<strong>What we switch off.</strong> Google signals and ad personalisation are turned off, so these records are not linked to a Google account and are not used for advertising. We do not send your name, phone number, email address or anything you type into a form, and page addresses are sent without any extra details they may carry, apart from campaign tags such as <strong>utm_source</strong>. According to Google, Google Analytics 4 does not log or store IP addresses.",
        "<strong>Who handles it, and for how long.</strong> Google processes these records for us under its Google Analytics terms, and may do so outside India, including in the United States. Individual visit records are kept for two months — the shortest period Google Analytics offers — and then deleted; totals, such as how many visits a page had, stay in our reports.",
        "<strong>Turning it off.</strong> Refuse, or withdraw later in cookie settings, and the script stops recording anything new and we delete the <strong>_ga</strong> cookies from your browser.",
      ],
    },
    {
      // PROPOSED CONTENT — REQUIRES CLIENT APPROVAL: the first two paragraphs, rewritten for a named
      // provider.
      heading: "What the privacy banner asks, and why",
      body: [
        "The banner asks one question, once and in advance: may we count your visits with Google Analytics? Nothing that needs permission loads before you answer.",
        "Whichever answer you give, every page, the solar calculator and the enquiry forms work exactly the same. While the banner is unanswered, nothing optional loads, which is the same thing that happens if you refuse.",
        "Accept and Reject are the same button in two colours, the same size, side by side. Refusing has to be exactly as easy as accepting, so there is no pre-ticked box, no “are you sure?”, and no close button that quietly counts as a yes.",
      ],
    },
    {
      // The footer's Cookie settings link lands here when JavaScript has not run; the page renders
      // the settings panel ("the button below") straight after this section's text.
      id: "cookie-settings",
      heading: "Your choice, and changing it",
      body: [
        "You can change your answer whenever you like: use <strong>Cookie settings</strong> in the footer of any page, or the button below. Withdrawing is one action, and it takes effect immediately.",
      ],
    },
    {
      heading: "Maps, videos and other embedded content",
      body: [
        "We do not embed maps, videos or social feeds. Where a map or another website is useful, we link to it instead, so nothing loads until you follow the link.",
      ],
    },
    {
      heading: "Controlling cookies yourself",
      body: [
        "Every browser lets you see, block and delete cookies and site data, usually under privacy or site settings. On this site, blocking them will not stop you reading a page or sending us an enquiry. The only effect here is that we cannot remember your answer, so the banner asks again on every page.",
      ],
    },
    {
      heading: "Changes to this page",
      body: [
        "If what we use changes, we will update this page before the change goes live. The version and effective date appear at the top.",
      ],
    },
  ],
} as const satisfies LegalNotice;

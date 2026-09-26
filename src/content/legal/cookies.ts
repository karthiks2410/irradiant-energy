// DRAFT — FOR COUNSEL REVIEW (docs/discovery/17, 18)
//
// This notice describes what the site does TODAY: no analytics, no advertising tags, no
// third-party embeds. Fonts are self-hosted by the framework and maps are plain links, so no
// third-party request is made on page load.
//
// A consent banner IS shown (owner instruction, review round 2), and it asks the one question the
// site could honestly ask: permission in advance, before any measurement exists. Every word here
// has to match what src/components/consent/* actually does — the old site's banner described GA4
// and Google Ads that were never loaded while Vercel Analytics ran regardless of the answer
// (docs/discovery/17 §2.6, 18 §9.6), and that is the failure this notice exists to avoid repeating.
//
// IF ANYTHING CHANGES — Vercel Web Analytics, a tag manager, a pixel, an embedded map or video —
// update this notice, the Analytics card in ConsentSettings and the privacy notice FIRST, put the
// tracker behind <ConsentGate>, and bump CONSENT_VERSION so every earlier answer is asked again.
// Do not switch on a tracker and describe it later.
//
// The page is noindex until counsel approves it (./index.ts).
//
// Every sentence is one row in docs/kannada/translations/units.json, matched by its exact text:
// reword one here and the Kannada build stops until the row is updated.

import type { LegalNotice } from "@/content/types";

export const cookieNotice = {
  title: "Cookies and analytics",
  description:
    "This site loads no analytics and no advertising cookies. What we ask you in the privacy banner, what your answer stores, and what would change if we ever add measurement.",
  summary: "We do not track you here. This page explains what that means and what the privacy banner asks.",

  sections: [
    {
      heading: "What cookies are",
      body: [
        "A cookie is a small file a website asks your browser to keep. This page also covers other browser storage, such as local storage.",
      ],
    },
    {
      heading: "What this site uses today",
      body: [
        {
          items: [
            "<strong>No analytics.</strong> We do not measure visits with Google Analytics or any similar service, and no measurement script runs on these pages. The Analytics switch in your preferences is there for the day that changes; while it is off, nothing loads.",
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
      heading: "What the privacy banner asks, and why",
      body: [
        "Nothing that needs permission loads here today, so the banner asks one question, once and in advance: may we count visits if we ever switch measurement on?",
        "Whichever answer you give, the site behaves exactly the same. While the banner is unanswered, nothing optional loads, which is the same thing that happens if you refuse.",
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

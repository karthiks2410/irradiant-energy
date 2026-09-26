// DRAFT — FOR COUNSEL REVIEW (docs/discovery/17, 18)
//
// Website-use terms only: this site sells nothing and takes no payment, so there is no order,
// cancellation or refund flow to cover. The points that matter for this build are that the
// calculator produces an estimate rather than an offer, and that nothing here may cut away a
// visitor's statutory rights. Counsel to confirm the governing-law and jurisdiction wording and
// the liability limits. The page is noindex until counsel approves it (./index.ts).
//
// Every sentence is one row in docs/kannada/translations/units.json, matched by its exact text:
// reword one here and the Kannada build stops until the row is updated.

import type { LegalNotice } from "@/content/types";

export const termsOfUse = {
  title: "Terms of use",
  description:
    "The terms for using the Irradiant Energy website, including why the savings calculator gives an estimate rather than a quotation or a guarantee.",
  summary: "The rules for using this website, and what our published figures do and do not promise.",

  sections: [
    {
      heading: "About these terms",
      body: [
        "These terms apply when you use this website. If you do not agree with them, please do not use the site. They cover the website only — any work we do for you is covered by a separate written agreement.",
        {
          withEntity: "The site is operated by {siteName}, a brand of {entityName}.",
          withoutEntity: "The site is operated by {siteName}.",
          pending: "Legal entity name to be confirmed",
        },
      ],
    },
    {
      heading: "What this site is for",
      body: [
        "This site describes our rooftop solar services and lets you work out a rough idea of what a system might do for you. It is information, not financial, tax, legal, engineering or other professional advice, and you should not treat it as the basis for a decision on its own.",
      ],
    },
    {
      heading: "Estimates are not offers",
      body: [
        "The savings calculator produces an <strong>estimate</strong>. It is worked out from the figures you enter and from the assumptions we publish next to the result. It is not a quotation, an offer, a contract or a guarantee of any outcome.",
        "What you actually get depends on things the calculator cannot see, including:",
        {
          items: [
            "what a site survey finds — the roof area, its condition, structure, orientation and shading;",
            "your electricity distribution company’s approval and the metering arrangement it allows;",
            "the equipment finally chosen and its price at the time;",
            "your tariff and how much electricity you actually use;",
            "the government schemes and rules in force when the system is installed.",
          ],
        },
        "Government subsidies are decided, approved and paid by the government and your distribution company, not by us. We can help you with the paperwork, but we cannot promise that a subsidy will be granted or when it will arrive.",
        "We only make a firm commitment on price, equipment, timing or performance in a written proposal or contract signed for {siteName}.",
      ],
    },
    {
      heading: "Sending us an enquiry",
      body: [
        "Sending an enquiry or asking for an estimate does not create a contract between us. Please give us accurate details — our estimate and advice depend on them. How we handle your details is set out in our <privacyLink>privacy notice</privacyLink>.",
        "Please do not use this site or its forms to send unlawful, abusive or misleading content, to attempt to interfere with the site, or to collect data from it automatically.",
      ],
    },
    {
      heading: "Our content",
      body: [
        "The text, images, diagrams, layout, logo and name on this site belong to us or to the people we licensed them from. You may read the pages, print them and share links for your own use. Copying, republishing or reusing them for anything else needs our written permission first.",
      ],
    },
    {
      heading: "Links to other websites",
      body: [
        "We link to other websites: government scheme pages, distribution-company pages and map services. We do not control them and we are not responsible for their content or their practices.",
      ],
    },
    {
      heading: "Availability and accuracy",
      body: [
        "We cannot promise this site will always be available, complete or free of errors. Prices, scheme details and tariffs change, and pages may be out of date between updates. We may change, move or remove any part of the site at any time.",
      ],
    },
    {
      heading: "Our responsibility to you",
      body: [
        "As far as the law allows, we are not responsible for any loss that comes from relying on the information on this site, from the site being unavailable, or from anything on a website we link to.",
        "Nothing in these terms removes or limits anything that cannot be removed or limited by law, and nothing here takes away your rights as a consumer or your right to complain to an authority.",
      ],
    },
    {
      heading: "Governing law",
      body: [
        // Counsel to confirm the forum clause; "courts at Bengaluru" follows docs/discovery/18 §10.1.
        // This one stays Bengaluru deliberately even though the business now describes itself as
        // serving Karnataka: a forum clause names the court with jurisdiction over the registered
        // office, not the area the company sells into.
        "These terms are governed by the law of India, and the courts at Bengaluru, Karnataka deal with any dispute about them.",
      ],
    },
    {
      heading: "Changes to these terms",
      body: [
        "We may update these terms. The version and effective date appear at the top of this page, and the version on the site when you use it is the one that applies.",
      ],
    },
  ],
} as const satisfies LegalNotice;

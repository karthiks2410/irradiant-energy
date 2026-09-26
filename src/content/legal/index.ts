/**
 * Legal pages: slugs, publishing status and the section outline counsel drafts against.
 *
 * The notices' own copy — title, summary, every heading and paragraph — lives beside this file
 * in privacy.ts, terms.ts and cookies.ts, with the frame every notice shares in shell.ts, and
 * reaches the pages through getContent() so the Kannada overlay applies (D-007;
 * docs/discovery/17-privacy-legal-compliance.md §3.4, §6.1). What stays here is not copy: it is
 * the same in every language and nobody reads it on the page. Facts the notices need (legal
 * entity, GSTIN, grievance officer) come from site.ts once the owner supplies them.
 */

import type { LegalPage } from "@/content/types";

/**
 * To publish a notice: change its `status` to "approved" and add the `version` and
 * `effectiveFrom` counsel signed off on. That one edit prints the version and date at the top
 * of the page (LegalPageShell), drops the draft banner and puts the page into the index and
 * the sitemap (`isLegalPageIndexable`). The type refuses "approved" without both fields.
 */
export const legalPages: readonly LegalPage[] = [
  {
    slug: "privacy",
    href: "/privacy",
    status: "draft-for-counsel",
    basis: "SPDI Rules 2011 r.4 (now); DPDP Act 2023 and Rules (17 §3.4). Linked from every form and the footer.",
    outline: [
      "Who we are: legal name, registered address, contact",
      "What we collect, by form (enquiry, estimate, contact) and passively (server logs, consent preference, analytics if enabled)",
      "Why we use it, each purpose tied to the data",
      "Lawful basis: consent, or a legitimate use",
      "Who receives it: processors by category and where data is stored",
      "How long we keep it",
      "How we protect it",
      "Your rights and how to exercise them",
      "Withdrawing consent",
      "Grievance officer and privacy contact",
      "Complaints to the Data Protection Board",
      "Children (18+)",
      "Offline data: site-survey documents and subsidy paperwork",
      "Version and effective date",
    ],
  },
  {
    slug: "terms",
    href: "/terms",
    status: "draft-for-counsel",
    basis: "Contract hygiene (17 §6.1): website use, estimates are indicative and not offers, IP, liability limits, governing law.",
    outline: [
      "Use of the website",
      "Estimates and calculator results are indicative, not offers",
      "Intellectual property",
      "Third-party links",
      "Limitation of liability",
      "Governing law and jurisdiction",
      "Changes to these terms",
      "Contact",
    ],
  },
  {
    slug: "cookies",
    href: "/cookies",
    status: "draft-for-counsel",
    basis:
      "Required if any non-essential tracker is used (17 §2.6, §6.5); sized to the trackers actually deployed. A banner is shown by owner instruction (review 2), and since 2026-09-20 it holds the page until answered — a cookie wall, also by owner instruction, which counsel should review against 17 §2.6; even though nothing non-essential loads today, so the copy has to describe the question we ask — permission in advance — and never imply measurement is running (18 §9.5.7).",
    outline: [
      "What cookies and similar technologies we use",
      "Strictly necessary items (the consent preference cookie: name, contents, lifetime)",
      "Analytics, only if enabled, with the provider named",
      "What the consent banner asks, that it holds the page until answered, and that refusing costs nothing",
      "How to change your choice: the footer 'Cookie settings' link and /cookies#cookie-settings",
      "Contact",
    ],
  },
];

export const getLegalPage = (slug: string): LegalPage | undefined => legalPages.find((page) => page.slug === slug);

/**
 * A legal page is kept out of the index and out of the sitemap until counsel approves the
 * draft. Both the page's `noindex` and sitemap.ts read this, so approving a notice is one
 * change of `status` above rather than two places that can drift into "Submitted URL marked
 * noindex" in Search Console.
 */
export const isLegalPageIndexable = (slug: LegalPage["slug"]): boolean =>
  getLegalPage(slug)?.status !== "draft-for-counsel";

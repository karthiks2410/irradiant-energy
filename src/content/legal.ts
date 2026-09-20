/**
 * Legal pages: slugs, titles and the section outline counsel drafts against. No legal
 * copy lives here (D-007; docs/discovery/17-privacy-legal-compliance.md §3.4, §6.1).
 * Facts the notices need (legal entity, GSTIN, grievance officer) come from site.ts once
 * the owner supplies them.
 */

import type { LegalPage } from "@/content/types";

export const legalPages: readonly LegalPage[] = [
  {
    slug: "privacy",
    href: "/privacy",
    title: "Privacy notice",
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
    title: "Terms of use",
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
    title: "Cookies and analytics",
    status: "draft-for-counsel",
    basis: "Required if any non-essential tracker is used (17 §2.6, §6.5); sized to the trackers actually deployed, no cookie wall.",
    outline: [
      "What cookies and similar technologies we use",
      "Strictly necessary items (consent preference)",
      "Analytics, only if enabled, with the provider named",
      "How to change your choice",
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

/**
 * Five FAQs for the home page, picked from the verified Homes FAQs so the wording has
 * one source (src/content/solutions/home.ts) and cannot drift.
 */

import { homeSegment } from "@/content/solutions/home";
import type { Cta, Faq, FaqSection, SectionCopy } from "@/content/types";

const picked = ["H-4", "H-5", "H-2", "H-10", "H-8"] as const;

const allHomeFaqs = homeSegment.faq.groups.flatMap((group) => group.items);

const items: readonly Faq[] = picked.map((id) => {
  const faq = allHomeFaqs.find((item) => item.id === id);
  if (!faq) throw new Error(`faq-home: ${id} is not in solutions/home.ts`);
  return faq;
});

const copy = {
  title: "Frequently asked questions",
  lead: homeSegment.faq.copy.lead,
  source: "P-SH-6",
  status: "verified-live",
  // `as const satisfies`: the overlay's shape comes from this literal, so the keys that are
  // actually set (no eyebrow, no accent) are the keys Kannada has to supply.
} as const satisfies SectionCopy;

const moreLink = {
  // PROPOSED CONTENT — REQUIRES CLIENT APPROVAL (UX link label).
  label: "All home solar questions",
  href: `${homeSegment.href}#faq`,
  source: "proposed",
  status: "proposed",
} as const satisfies Cta;

export const homeFaq = {
  copy,
  items,
  moreLink,
  stillHaveQuestions: homeSegment.faq.stillHaveQuestions,
} satisfies Pick<FaqSection, "copy" | "stillHaveQuestions"> & { items: readonly Faq[]; moreLink: Cta };

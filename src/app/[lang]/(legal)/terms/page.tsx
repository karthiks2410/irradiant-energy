// DRAFT — FOR COUNSEL REVIEW. The terms, and the note for counsel on their scope, are in
// src/content/legal/terms.ts; <LegalPageShell> renders them in the page's language.

import { LegalPageShell } from "@/components/pages/LegalPageShell";
import { isLegalPageIndexable } from "@/content/legal";
import { getContent } from "@/i18n/content";
import { langParams } from "@/i18n/registry";
import { getLocale } from "@/i18n/server";
import { pageMetadata } from "@/lib/seo";

export const generateStaticParams = () => langParams("terms");

export async function generateMetadata() {
  const locale = await getLocale();
  const { title, description } = getContent(locale).legal.terms;
  return pageMetadata({
    title,
    description,
    path: "/terms",
    locale,
    // Draft until counsel approves it (src/content/legal/index.ts); the sitemap reads the same flag.
    noindex: !isLegalPageIndexable("terms"),
  });
}

export default function TermsPage() {
  return <LegalPageShell slug="terms" />;
}

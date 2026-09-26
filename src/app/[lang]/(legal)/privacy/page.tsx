// DRAFT — FOR COUNSEL REVIEW. The notice's text, and the note for counsel on what it covers, is in
// src/content/legal/privacy.ts; <LegalPageShell> renders it in the page's language.

import { LegalPageShell } from "@/components/pages/LegalPageShell";
import { isLegalPageIndexable } from "@/content/legal";
import { getContent } from "@/i18n/content";
import { langParams } from "@/i18n/registry";
import { getLocale } from "@/i18n/server";
import { pageMetadata } from "@/lib/seo";

export const generateStaticParams = () => langParams("privacy");

export async function generateMetadata() {
  const locale = await getLocale();
  const { title, description } = getContent(locale).legal.privacy;
  return pageMetadata({
    title,
    description,
    path: "/privacy",
    locale,
    // Draft until counsel approves it (src/content/legal/index.ts); the sitemap reads the same flag.
    noindex: !isLegalPageIndexable("privacy"),
  });
}

export default function PrivacyPage() {
  return <LegalPageShell slug="privacy" />;
}

import type { Metadata } from "next";
import { ButtonLink } from "@/components/ui/Button";
import { getContent } from "@/i18n/content";
import { getLocale } from "@/i18n/server";

/**
 * The answer to a `notFound()` call inside the locale tree.
 *
 * It renders inside the `[lang]` layout, so it has the locale and the chrome. The 404 for a URL
 * that matches no route at all is `src/app/global-not-found.tsx`, which Next serves without
 * rendering a layout and therefore without a locale to read.
 *
 * No canonical here: a 404 must not point anywhere (report §13.1 M3).
 */
export async function generateMetadata(): Promise<Metadata> {
  const { ui } = getContent(await getLocale());
  return {
    title: ui.notFound.metaTitle,
    robots: { index: false, follow: false },
  };
}

export default async function NotFound() {
  const { ui } = getContent(await getLocale());
  const { notFound } = ui;

  return (
    <section className="container-page section-y">
      <div className="max-w-2xl">
        <p className="flex items-center gap-3 font-label text-eyebrow font-medium text-green-700 uppercase">
          <span aria-hidden="true" className="h-px w-8 bg-green-700" />
          {notFound.eyebrow}
        </p>
        <h1 className="mt-4 font-display text-h2 font-extrabold text-carbon">{notFound.heading}</h1>
        <p className="mt-4 text-lead text-ink-2">{notFound.body}</p>
        <div className="mt-8 flex flex-wrap gap-3">
          <ButtonLink href="/">{notFound.homeCta}</ButtonLink>
          <ButtonLink href="/solutions" variant="outline">
            {notFound.solutionsCta}
          </ButtonLink>
          <ButtonLink href="/contact" variant="outline">
            {notFound.contactCta}
          </ButtonLink>
        </div>
      </div>
    </section>
  );
}

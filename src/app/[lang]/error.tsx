"use client";

import { useChromeUi } from "@/components/i18n/UiProvider";
import { Button, ButtonLink } from "@/components/ui/Button";

/**
 * Route error boundary; Next requires a Client Component. The copy stays generic on purpose: the
 * error object can carry internals, and production replaces its message with a digest anyway.
 *
 * Next gives this file `error` and `retry` and nothing else, so its strings cannot arrive as
 * props. They come from <UiProvider>, mounted in the layout — which this boundary renders inside,
 * because `error.js` does not wrap the layout above it. Importing them instead would put both
 * locales' copy in one client chunk.
 */
export default function RouteError({ retry }: { error: Error & { digest?: string }; retry: () => void }) {
  const { error } = useChromeUi();

  return (
    <section className="container-page section-y">
      <div className="max-w-2xl">
        <p className="flex items-center gap-3 font-label text-eyebrow font-medium text-green-700 uppercase">
          <span aria-hidden="true" className="h-px w-8 bg-green-700" />
          {error.eyebrow}
        </p>
        <h1 className="mt-4 font-display text-h2 font-extrabold text-carbon">{error.heading}</h1>
        <p className="mt-4 text-lead text-ink-2">{error.body}</p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Button onClick={retry} arrow>
            {error.retryCta}
          </Button>
          <ButtonLink href="/" variant="outline">
            {error.homeCta}
          </ButtonLink>
        </div>
      </div>
    </section>
  );
}

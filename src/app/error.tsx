"use client";

import { Button, ButtonLink } from "@/components/ui/Button";

// Route error boundary; Next requires a Client Component. The copy stays generic on purpose: the
// error object can carry internals, and production replaces its message with a digest anyway.
export default function RouteError({ retry }: { error: Error & { digest?: string }; retry: () => void }) {
  return (
    <section className="container-page section-y">
      <div className="max-w-2xl">
        <p className="flex items-center gap-3 font-mono text-eyebrow font-medium text-green-700 uppercase">
          <span aria-hidden="true" className="h-px w-8 bg-green-700" />
          Something went wrong
        </p>
        <h1 className="mt-4 font-display text-h2 font-extrabold text-carbon">This page didn&rsquo;t load properly.</h1>
        <p className="mt-4 text-lead text-ink-2">
          Please try again. If it keeps happening, the home page and the contact page still work.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Button onClick={retry} arrow>
            Try again
          </Button>
          <ButtonLink href="/" variant="outline">
            Go to the home page
          </ButtonLink>
        </div>
      </div>
    </section>
  );
}

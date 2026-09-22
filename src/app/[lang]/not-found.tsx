import type { Metadata } from "next";
import { ButtonLink } from "@/components/ui/Button";

// No canonical here: a 404 must not point anywhere (report §13.1 M3).
export const metadata: Metadata = {
  title: "Page not found",
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <section className="container-page section-y">
      <div className="max-w-2xl">
        <p className="flex items-center gap-3 font-mono text-eyebrow font-medium text-green-700 uppercase">
          <span aria-hidden="true" className="h-px w-8 bg-green-700" />
          Error 404
        </p>
        <h1 className="mt-4 font-display text-h2 font-extrabold text-carbon">We can&rsquo;t find that page.</h1>
        <p className="mt-4 text-lead text-ink-2">
          The link may be out of date, or the page may have moved while the site was being rebuilt. These are
          good places to start again.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <ButtonLink href="/">Go to the home page</ButtonLink>
          <ButtonLink href="/solutions" variant="outline">
            See our solutions
          </ButtonLink>
          <ButtonLink href="/contact" variant="outline">
            Contact us
          </ButtonLink>
        </div>
      </div>
    </section>
  );
}

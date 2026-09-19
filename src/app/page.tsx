import { ButtonLink } from "@/components/ui/Button";
import { primaryCta } from "@/content/site";

// Temporary shell page; replaced by the home build.
export default function Home() {
  return (
    <section data-surface="dark" className="-mt-(--header-h) bg-teal-900 pt-(--header-h) text-white">
      <div className="container-page section-y">
        <p className="font-mono text-eyebrow font-medium uppercase">Intelligent energy systems</p>
        <h1 className="mt-4 max-w-4xl font-display text-display font-extrabold">Powering smarter futures.</h1>
        <p className="mt-6 max-w-2xl text-lead text-white/85">
          Reliable solar systems for homes, businesses, agriculture and communities—designed to perform with clarity
          and long-term value.
        </p>
        <div className="mt-8">
          <ButtonLink href={primaryCta.href} variant="light">
            {primaryCta.label}
          </ButtonLink>
        </div>
      </div>
    </section>
  );
}

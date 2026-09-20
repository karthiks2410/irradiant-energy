import { ButtonLink, SectionHeading } from "@/components/ui";
import { heroSlides } from "@/content/images";
import { homePage } from "@/content/home";
import { HeroBackdrop } from "./HeroBackdrop";

const { hero } = homePage;

/**
 * Full-bleed photo hero. The section pulls itself under the transparent header
 * (layout.tsx already pads <main> by the header height) and every word is server
 * rendered: only the photo layer behind the scrim hydrates.
 *
 * The scrim is two Deep Teal photo layers, which report §6.10 allows where it rules out
 * decorative gradients. The prototype used a single overlay that thins to 18% opacity
 * halfway across, leaving its white copy well under 4.5:1; these layers instead hold a
 * combined 0.82–0.88 across the copy column, so the lead measures above 8:1 against the
 * brightest sky in the three photographs, and stay light over the subject on the right.
 */
export function HomeHero() {
  return (
    <section
      aria-labelledby="hero-title"
      data-surface="dark"
      className="relative isolate -mt-(--header-h) flex flex-col justify-center overflow-hidden bg-teal-900 pt-(--header-h) text-white md:min-h-[92svh]"
    >
      <HeroBackdrop slides={heroSlides} />

      {/* Vertical wash: keeps the transparent header's white nav legible over sky and
          grounds the foot of the photo. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-10 bg-linear-to-b from-teal-975/70 via-22% via-teal-900/8 to-teal-900/20"
      />
      {/* Copy scrim: bottom-weighted on phones, left-weighted from md, holding roughly
          0.78 opacity across the copy column and falling away over the photo's subject. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-10 bg-linear-to-t from-teal-900/92 via-teal-900/70 to-transparent md:bg-linear-to-r md:via-62% md:via-teal-900/78 md:to-teal-900/5"
      />

      <div className="relative z-20 container-page py-20 md:py-28">
        {/* Held to the width the scrim is darkest across, and so the buttons and chips
            keep aligning with the copy when Kannada makes the lines longer. */}
        <div className="max-w-3xl">
          <SectionHeading
            id="hero-title"
            headingLevel={1}
            align="stacked"
            eyebrow={hero.eyebrow}
            eyebrowTone="signal"
            title={hero.title}
            lead={hero.lead}
          />

          <div className="mt-9 flex flex-wrap gap-3">
            <ButtonLink href={hero.cta.href} variant="light">
              {hero.cta.label}
            </ButtonLink>
            {hero.secondaryCta && (
              <ButtonLink href={hero.secondaryCta.href} variant="outline-light">
                {hero.secondaryCta.label}
              </ButtonLink>
            )}
          </div>

          {hero.chips && (
            <ul className="mt-9 flex flex-wrap gap-x-7 gap-y-2.5">
              {hero.chips.map((chip) => (
                <li key={chip} className="flex items-center gap-2.5 text-small text-white/90">
                  <span aria-hidden="true" className="size-1.5 shrink-0 rounded-full bg-green-500" />
                  {chip}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}

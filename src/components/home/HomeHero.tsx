import { ButtonLink } from "@/components/ui";
import { homePage } from "@/content/home";
import { HeroBackdrop } from "./HeroBackdrop";

const { hero } = homePage;

/**
 * Full-bleed photo hero, rebuilt to the prototype's proportions (owner override, 2026-09-20:
 * on shape, depth, motion and type the prototype wins).
 *
 * Height: the prototype is `min-height:100svh; height:min(960px,100svh)`. Its min-height always
 * wins, so the stage is exactly one viewport tall and no band of the next section shows; the
 * 960px cap is carried over on md and up, where it only bounds the definite height. Below md
 * the height stays content-driven, so a short phone grows the stage instead of clipping copy.
 *
 * The section pulls itself up under the transparent header (layout.tsx pads <main> by the
 * header height) and the copy block pays the header clearance back as top padding, which is
 * what drops the copy just below centre the way the prototype's 170px does.
 *
 * Everything that does not change with the scene is server-rendered here and handed to the
 * island: the scrims and the CTAs. The rotating eyebrow, h1, lead and chips live in
 * <HeroBackdrop> because they share its slide index; scene 1 is still in the server HTML.
 *
 * The scrim is two Deep Teal photo layers, which report §6.10 allows where it rules out
 * decorative gradients. The prototype used a single overlay that thins to 18% opacity
 * halfway across, leaving its white copy well under 4.5:1.
 *
 * From md the copy scrim runs left-to-right and holds a combined 0.82–0.88 across the copy
 * column, staying light over the subject on the right. Below md it runs bottom-to-top, and a
 * bottom-weighted ramp had faded to about 0.44 by the time it reached the copy block, which
 * starts high on a phone: the Solar Yellow eyebrow measured 2.2–2.7:1 there against the
 * brightest sky in the template photographs, on every slide and at both Ken Burns scales.
 * (Lighthouse scores 100 because axe marks text over a background image "incomplete", not a
 * failure.) The phone ramp is therefore nearly flat — roughly 0.92 → 0.85 → 0.72 — which
 * holds the whole copy column above 0.80 once the top wash is composited in, and puts the
 * eyebrow above 4.5:1. Re-measure all slides when the TODO(photography) placeholders are
 * replaced.
 */
export function HomeHero() {
  return (
    <section
      aria-labelledby="hero-title"
      aria-roledescription="carousel"
      data-surface="dark"
      className="relative isolate -mt-(--header-h) flex min-h-svh flex-col justify-center overflow-hidden bg-teal-900 text-white md:h-[min(960px,100svh)]"
    >
      <HeroBackdrop
        slides={hero.slides}
        overlay={
          <>
            {/* Vertical wash: keeps the transparent header's white nav legible over sky and
                grounds the foot of the photo. */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 z-10 bg-linear-to-b from-teal-975/70 via-22% via-teal-900/8 to-teal-900/20"
            />
            {/* Copy scrim: near-flat on phones (the copy block sits high, so a bottom-weighted
                ramp left the eyebrow under 4.5:1), left-weighted from md, holding roughly 0.78
                opacity across the copy column and falling away over the photo's subject. */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 z-10 bg-linear-to-t from-teal-900/92 via-teal-900/85 to-teal-900/72 md:bg-linear-to-r md:via-62% md:via-teal-900/78 md:to-teal-900/5"
            />
          </>
        }
        actions={
          /* Prototype pills: 54px tall and fully rounded. The height sits on a stretch wrapper
             rather than on ButtonLink, whose own min-h-11 would race it in the stylesheet. */
          <div className="mt-7 flex flex-wrap gap-3">
            <span className="flex min-h-[3.375rem]">
              <ButtonLink href={hero.cta.href} variant="light">
                {hero.cta.label}
              </ButtonLink>
            </span>
            {hero.secondaryCta && (
              <span className="flex min-h-[3.375rem]">
                <ButtonLink href={hero.secondaryCta.href} variant="outline-light">
                  {hero.secondaryCta.label}
                </ButtonLink>
              </span>
            )}
          </div>
        }
      />
    </section>
  );
}

import { ArrowRightIcon } from "@/components/ui";
import { HeroEstimate } from "./HeroEstimate";
import type { Content } from "@/i18n/content";
import { localizePath } from "@/i18n/paths";
import { getLocale } from "@/i18n/server";
import { HeroBackdrop } from "./HeroBackdrop";

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
 * failure.) The phone ramp is therefore nearly flat — 0.90 → 0.81 → 0.67 — which holds the
 * whole copy column high enough once the top wash is composited in.
 *
 * Those numbers were 0.92 → 0.85 → 0.72 against the template placeholders. Re-measured against
 * the owner's real photographs (2026-09-20) they had more room than they needed: the array was
 * reading as a flat teal wash on a phone, on a page selling solar. Lightening the ramp by two to
 * five points costs almost nothing — the worst sample moved from 5.13:1 to 5.01:1 against a
 * 4.5:1 floor — and lets the panels read as panels. Going a further four points reached 4.61:1,
 * which clears the floor but leaves no margin for a brighter photograph, so it was backed off.
 *
 * Re-measure all slides at both Ken Burns scales whenever the photography changes:
 * `node .qa/hero-contrast.mjs` against a production build does it.
 */
export async function HomeHero({ content }: { content: Content }) {
  const { hero } = content.home;
  const ui = content.ui.home;
  // A plain <a>, not <Link>, so Lenis applies the header offset — which means the locale prefix
  // has to be added here rather than by the <Link> wrapper.
  const locale = await getLocale();
  return (
    <section
      aria-labelledby="hero-title"
      aria-roledescription={ui.heroCarousel}
      data-surface="dark"
      // No definite height (layout-risks.md B2). `min-h-svh` already won every comparison against
      // `h-[min(960px,100svh)]` — min-height beats height — so the rendered height is unchanged at
      // every viewport, but the stage can now grow instead of clipping: at 1280x800 the tallest
      // Kannada scene measured 692px against 644px of usable height and `overflow-hidden` cut 24px
      // off the eyebrow row and 24px off the proof chips.
      className="relative isolate -mt-(--header-h) flex min-h-svh flex-col justify-center overflow-hidden bg-teal-900 text-white"
    >
      <HeroBackdrop
        slides={hero.slides}
        labels={{ dot: ui.heroDot, pause: ui.heroPause, play: ui.heroPlay }}
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
              className="pointer-events-none absolute inset-0 z-10 bg-linear-to-t from-teal-900/90 via-teal-900/81 to-teal-900/67 md:bg-linear-to-r md:via-62% md:via-teal-900/76 md:to-teal-900/5"
            />
          </>
        }
        actions={
          /*
           * The estimate itself, rather than two pills pointing at it. The old pair sent both
           * "Get a free estimate" and "Request a site consultation" to the same destination, and
           * the header repeats the first one in the same viewport — three controls, one place.
           * The form does the job the buttons were only advertising; the consultation link stays
           * as the quieter second path for someone not ready to type numbers.
           */
          <>
            <HeroEstimate
              billLabel={ui.heroBillLabel}
              submitLabel={ui.heroSubmit}
              note={ui.heroNoSignup}
            />
            {hero.secondaryCta && (
              <a
                href={localizePath(hero.secondaryCta.href, locale)}
                className="group mt-5 inline-flex min-h-11 items-center gap-2 text-ui font-semibold text-white underline-offset-4 transition-colors duration-200 hover:underline"
              >
                {hero.secondaryCta.label}
                <ArrowRightIcon className="size-4 transition-transform duration-200 ease-controlled group-hover:translate-x-0.5" />
              </a>
            )}
          </>
        }
      />
    </section>
  );
}

"use client";

import Image from "next/image";
import { useInView, useReducedMotion } from "motion/react";
import { useCallback, useEffect, useRef, useState, useSyncExternalStore, type ReactNode } from "react";
import { Eyebrow } from "@/components/ui";
import type { HeroSlide } from "@/content/home";
import { PauseIcon, PlayIcon } from "./Icons";

/** Dwell per scene. Longer than the prototype's 5.2s because the copy now rotates too. */
const INTERVAL_MS = 6000;
/** The copy dissolves out, swaps at zero opacity, then rises back in. */
const COPY_FADE_OUT_MS = 240;

/** Prototype easing (CSS `ease`), used for the crossfade and the Ken Burns drift. */
const PROTO_EASE = "ease-[cubic-bezier(0.25,0.1,0.25,1)]";

/* Shared between the live scene and the hidden sizer behind it, so the two measure the same. */
/*
 * The size, leading and tracking are the `text-hero` / `text-hero-md` tokens rather than
 * arbitrary values: the token values in globals.css are byte-for-byte the ones that used to be
 * inline here, so English renders identically, but Kannada can retune them from one place. With
 * arbitrary utilities it could not — `leading-[0.96]` would survive every :lang(kn) rule and
 * Kannada lines overlap by 0.37em at that leading (typography.md §5.1, §6.4 item 1).
 */
const HEADLINE = "font-display text-hero font-bold text-white md:text-hero-md";
const LEAD = "mt-5 max-w-[590px] text-[0.9375rem] leading-[1.7] text-white/90 md:text-[1.1875rem]";
const CHIPS = "mt-[22px] flex flex-wrap gap-x-[18px] gap-y-2.5";
const CHIP = "flex items-center gap-2 text-small text-white/90";

/** Never fires: the snapshot only has to differ between the server and the client. */
const neverChanges = () => () => {};

function useHydrated() {
  return useSyncExternalStore(
    neverChanges,
    () => true,
    () => false,
  );
}

function subscribeToVisibility(onChange: () => void) {
  document.addEventListener("visibilitychange", onChange);
  return () => document.removeEventListener("visibilitychange", onChange);
}

function useTabVisible() {
  return useSyncExternalStore(
    subscribeToVisibility,
    () => document.visibilityState === "visible",
    () => true,
  );
}

type HeroBackdropProps = {
  slides: readonly HeroSlide[];
  /** Server-rendered scrims (HomeHero.tsx). They sit at z-10, between photo and copy. */
  overlay: ReactNode;
  /** Server-rendered CTAs. They do not change with the scene, so they stay out of this bundle. */
  actions: ReactNode;
};

/**
 * The hero stage: photo layer, rotating copy and transport controls. They share one slide
 * index, so they are one island; everything that does not change with the scene (section
 * shell, scrims, CTAs) is server-rendered by <HomeHero> and passed in.
 *
 * Shape and motion follow the prototype (owner override, 2026-09-20): full-viewport stage,
 * 1.05s photo crossfade, a slow Ken Burns drift from scale 1.02 to 1.08, and a 34px active dot.
 *
 * Rules this island keeps (report §5.8 S1, §6 motion):
 * - Nothing above the fold is hidden. Scene 1's eyebrow, h1, lead and chips are in the server
 *   HTML, as is its photo with loading="eager" + fetchPriority="high" (Next 16 deprecated
 *   `priority` in favour of `preload`; the docs recommend these two for an LCP image).
 * - Exactly one h1. Its text changes with the scene, but no heading is added or removed, and
 *   the rotation is not announced: it is decoration, not a live update.
 * - Auto-advance runs only when the visitor has not asked for reduced motion, the tab is in
 *   the foreground and the hero is still on screen, and it stops on a visible Pause control.
 * - Reduced motion: no drift, no crossfade timing games — the copy swaps outright.
 * - The controls render after mount only. Without JS there is no slideshow, so shipping dead
 *   dots and a dead Pause button in the server HTML would be a lie.
 * - The photos are decoration behind the copy, so the layer is hidden from assistive technology
 *   and each scene is named on its own dot instead.
 * - Only transform and opacity animate.
 */
export function HeroBackdrop({ slides, overlay, actions }: HeroBackdropProps) {
  const reducedMotion = useReducedMotion();
  const hydrated = useHydrated();
  const tabVisible = useTabVisible();
  const photoLayer = useRef<HTMLDivElement>(null);
  const copyTimer = useRef<number | undefined>(undefined);
  // Nothing auto-moving may keep running off-screen (report §6 motion). The photo layer fills
  // the hero, so "any part of it intersects the viewport" is the right test.
  const heroOnScreen = useInView(photoLayer);
  const [index, setIndex] = useState(0);
  const [shown, setShown] = useState(0);
  const [copyIn, setCopyIn] = useState(true);
  const [drifting, setDrifting] = useState(false);
  const [playing, setPlaying] = useState(true);

  const canAutoplay = reducedMotion === false && slides.length > 1;
  const running = canAutoplay && playing && tabVisible && heroOnScreen;

  // Changing scene: the photo crossfades at once, and the copy leaves first so the h1 never
  // swaps a word in view. Both the timer and the dots come through here.
  const goToSlide = useCallback(
    (next: number) => {
      if (next === index) return;
      window.clearTimeout(copyTimer.current);
      setIndex(next);
      if (reducedMotion) {
        setShown(next);
        return;
      }
      setCopyIn(false);
      copyTimer.current = window.setTimeout(() => {
        setShown(next);
        setCopyIn(true);
      }, COPY_FADE_OUT_MS);
    },
    [index, reducedMotion],
  );

  useEffect(() => () => window.clearTimeout(copyTimer.current), []);

  useEffect(() => {
    if (!running) return;
    // `index` is a dependency so choosing a scene by hand restarts the dwell time.
    const timer = window.setTimeout(() => goToSlide((index + 1) % slides.length), INTERVAL_MS);
    return () => window.clearTimeout(timer);
  }, [running, index, slides.length, goToSlide]);

  // The drift is a transition, not a keyframe animation, so the first photo has to change
  // scale once after paint to start moving. Flipping it here also keeps it out of the server
  // HTML, so hydration matches.
  useEffect(() => {
    if (reducedMotion !== false) return;
    const frame = requestAnimationFrame(() => setDrifting(true));
    return () => cancelAnimationFrame(frame);
  }, [reducedMotion]);

  const rendered = hydrated ? slides : slides.slice(0, 1);
  const scene = slides[shown];

  return (
    <>
      <div ref={photoLayer} aria-hidden="true" className="absolute inset-0 z-0 overflow-hidden bg-teal-950">
        {rendered.map((slide, position) => (
          /* TODO(photography): replace with approved photos */
          <div
            key={slide.title}
            className={`absolute inset-0 transition-opacity duration-[1050ms] ${PROTO_EASE} ${
              position === index ? "opacity-100" : "opacity-0"
            }`}
          >
            <Image
              src={slide.image.src}
              alt=""
              fill
              sizes="100vw"
              loading={position === 0 ? "eager" : "lazy"}
              fetchPriority={position === 0 ? "high" : "auto"}
              // Each photo carries its own focal point (src/content/images.ts): these are portrait
              // frames in a landscape stage, and a blind centre crop lands on bare panel texture.
              // This stage is the shallow one, so it takes the wide value where there is one.
              style={{ objectPosition: slide.image.focalWide ?? slide.image.focal }}
              className={`object-cover transition-transform duration-[7500ms] ${PROTO_EASE} ${
                position === index && drifting ? "scale-[1.08]" : "scale-[1.02]"
              }`}
            />
          </div>
        ))}
      </div>

      {overlay}

      <div className="relative z-20 container-page">
        {/* 690px is the prototype's copy measure; the top padding clears the fixed header and
            drops the block just below centre, as the prototype's 170px does.

            The scenes are stacked in one grid cell rather than swapped in place. The block is
            vertically centred, so a scene with a taller headline used to move its own top edge
            when the slideshow advanced — a layout shift with no user interaction behind it,
            which is exactly what CLS counts. Every scene is laid out in the cell and all but
            the live one is hidden, so the cell is always as tall as the tallest scene and the
            rotation changes nothing but pixels. */}
        {/* B2 again: Kannada takes back some of the 5.25rem top clearance and reserves a row at
            the foot, because the carousel dots are absolutely positioned at `bottom-2` and the
            taller Kannada chip row ran underneath them (chips bottom 750 vs dots top 748 at 1280).
            English keeps its exact padding. */}
        <div className="grid max-w-[690px] pt-[calc(var(--header-h)+4.5rem)] md:pt-[calc(var(--header-h)+5.25rem)] kn:md:pt-[calc(var(--header-h)+3.5rem)] kn:pb-14 [@media(max-height:720px)]:pt-[calc(var(--header-h)+2rem)] [@media(max-height:720px)]:pb-16">
          {/* The sizer: every scene, laid out and measured, shown to nobody. It carries no
              heading and no landmark, so it adds nothing for assistive technology to find, and
              it is `inert` because `actions` now contains a real form — `visibility: hidden`
              already takes those inputs out of the tab order, but inert says so outright and
              covers pointer events too. */}
          <div aria-hidden="true" inert className="invisible col-start-1 row-start-1 grid">
            {slides.map((slide) => (
              <div key={slide.title} className="col-start-1 row-start-1">
                <Eyebrow tone="signal" className="mb-4">
                  {slide.eyebrow}
                </Eyebrow>
                <p className={HEADLINE}>{slide.title}</p>
                <p className={LEAD}>{slide.lead}</p>
                {actions}
                <ul className={CHIPS}>
                  {slide.chips.map((chip) => (
                    <li key={chip} className={CHIP}>
                      <span className="size-2 shrink-0 rounded-full bg-green-500" />
                      {chip}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div
            className={`col-start-1 row-start-1 transition-[opacity,translate] ease-controlled ${
              copyIn ? "translate-y-0 opacity-100 duration-500" : "translate-y-2 opacity-0 duration-200"
            }`}
          >
            <Eyebrow tone="signal" className="mb-4">
              {scene.eyebrow}
            </Eyebrow>

            {/* Prototype display type: clamp(58px, 6vw, 96px) — 48px under 768 — on 0.96 leading
                and -0.045em tracking. One h1 per page; its text follows the scene. */}
            <h1 id="hero-title" className={HEADLINE}>
              {scene.title}
            </h1>

            <p className={LEAD}>{scene.lead}</p>

            {actions}

            <ul className={CHIPS}>
              {scene.chips.map((chip) => (
                <li key={chip} className={CHIP}>
                  <span aria-hidden="true" className="size-2 shrink-0 rounded-full bg-green-500" />
                  {chip}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {hydrated && slides.length > 1 && (
        <div className="absolute inset-x-0 bottom-2 z-30 flex items-center justify-center">
          <ul className="flex items-center">
            {slides.map((slide, position) => (
              <li key={slide.title}>
                <button
                  type="button"
                  onClick={() => goToSlide(position)}
                  aria-current={position === index ? "true" : undefined}
                  className="grid size-11 place-items-center rounded-full"
                >
                  <span
                    aria-hidden="true"
                    className={`block h-2.5 rounded-full transition-colors duration-200 ease-controlled ${
                      position === index ? "w-[34px] bg-white" : "w-2.5 bg-white/40"
                    }`}
                  />
                  <span className="sr-only">
                    Show slide {position + 1} of {slides.length}: {slide.eyebrow}
                  </span>
                </button>
              </li>
            ))}
          </ul>

          {canAutoplay && (
            <button
              type="button"
              onClick={() => setPlaying((current) => !current)}
              className="grid size-11 place-items-center rounded-full text-white transition-colors duration-200 hover:bg-white/15"
            >
              {playing ? <PauseIcon className="size-4" /> : <PlayIcon className="size-4" />}
              {/* The icon swaps, so this is an action button: the name states the action, and
                  aria-pressed is omitted (it would read "Play … pressed" once paused). */}
              <span className="sr-only">
                {playing ? "Pause the hero slideshow" : "Play the hero slideshow"}
              </span>
            </button>
          )}
        </div>
      )}
    </>
  );
}

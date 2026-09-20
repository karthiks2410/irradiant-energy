"use client";

import Image from "next/image";
import { useInView, useReducedMotion } from "motion/react";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import type { TemplateImage } from "@/content/images";
import { PauseIcon, PlayIcon } from "./Icons";

const INTERVAL_MS = 6000;

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

/**
 * Hero background layer: one photo server-rendered for LCP, the rest added after
 * hydration and crossfaded on opacity only.
 *
 * Rules this island keeps (report §5.8 S1, §6 motion):
 * - Nothing above the fold is hidden. The copy is server-rendered by <HomeHero> and the
 *   first photo is in the server HTML with loading="eager" + fetchPriority="high"
 *   (Next 16 deprecated `priority` in favour of `preload`; the docs recommend these two).
 * - Auto-advance runs only when the visitor has not asked for reduced motion, the tab is in
 *   the foreground and the hero is still on screen, and it stops on a visible Pause control.
 * - The controls render after mount only. Without JS there is no slideshow, so shipping
 *   dead dots and a dead Pause button in the server HTML would be a lie.
 * - The photos are decoration behind fixed copy, so the layer is hidden from assistive
 *   technology and each scene is instead named on its own dot.
 */
export function HeroBackdrop({ slides }: { slides: readonly TemplateImage[] }) {
  const reducedMotion = useReducedMotion();
  const hydrated = useHydrated();
  const tabVisible = useTabVisible();
  const photoLayer = useRef<HTMLDivElement>(null);
  // Nothing auto-moving may keep running off-screen (report §6 motion). The photo layer fills
  // the hero, so "any part of it intersects the viewport" is the right test.
  const heroOnScreen = useInView(photoLayer);
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(true);

  const canAutoplay = reducedMotion === false && slides.length > 1;
  const running = canAutoplay && playing && tabVisible && heroOnScreen;

  useEffect(() => {
    if (!running) return;
    // `index` is a dependency so choosing a photo by hand restarts the dwell time.
    const timer = window.setTimeout(() => setIndex((current) => (current + 1) % slides.length), INTERVAL_MS);
    return () => window.clearTimeout(timer);
  }, [running, index, slides.length]);

  const rendered = hydrated ? slides : slides.slice(0, 1);

  return (
    <>
      <div ref={photoLayer} aria-hidden="true" className="absolute inset-0 z-0 bg-teal-950">
        {rendered.map((slide, position) => (
          /* TODO(photography): replace with approved photo */
          <Image
            key={slide.src}
            src={slide.src}
            alt=""
            fill
            sizes="100vw"
            loading={position === 0 ? "eager" : "lazy"}
            fetchPriority={position === 0 ? "high" : "auto"}
            className={`object-cover object-[65%_50%] transition-opacity duration-700 ease-controlled md:object-center ${
              position === index ? "opacity-100" : "opacity-0"
            }`}
          />
        ))}
      </div>

      {hydrated && slides.length > 1 && (
        <div className="absolute inset-x-0 bottom-2 z-30 flex items-center justify-center md:bottom-4">
          <ul className="flex items-center">
            {slides.map((slide, position) => (
              <li key={slide.src}>
                <button
                  type="button"
                  onClick={() => setIndex(position)}
                  aria-current={position === index ? "true" : undefined}
                  className="grid size-11 place-items-center rounded-full"
                >
                  <span
                    aria-hidden="true"
                    className={`block h-2.5 rounded-full transition-colors duration-200 ease-controlled ${
                      position === index ? "w-8 bg-white" : "w-2.5 bg-white/55"
                    }`}
                  />
                  <span className="sr-only">
                    Show background photo {position + 1} of {slides.length}: {slide.subject}
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
                {playing ? "Pause the background slideshow" : "Play the background slideshow"}
              </span>
            </button>
          )}
        </div>
      )}
    </>
  );
}

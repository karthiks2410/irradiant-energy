"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

/**
 * Site-wide scroll reveal: every block inside a `[data-reveal-children]` container eases up the
 * first time it scrolls into view (owner, 2026-09-25: "components just smoothly appear on the
 * screen", after sweat-and-fit.vercel.app, which wraps 86 blocks across its pages this way).
 *
 * One observer and one CSS rule instead of a motion wrapper around every block, so server
 * components stay server components and nothing ships per block.
 *
 * - `<Section>` and `<CardGrid>` mark their children; nothing else needs to know about this.
 * - A block already on screen when the page appears is left alone — hiding it to animate it back
 *   would flicker. Heroes get their load-time entrance from the `.emerge` CSS instead.
 * - A block that is, or contains, a motion `<Reveal>` is skipped, so nothing animates twice.
 * - The classes come off once the block has arrived, so its own transitions (a card's hover lift)
 *   work exactly as before.
 * - Reduced motion, or no JavaScript: nothing is hidden, everything simply shows.
 */
export function ScrollReveal() {
  const pathname = usePathname();

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (!("IntersectionObserver" in window)) return;

    const root = document.documentElement;
    root.classList.add("rv-on");

    const reveal = (el: HTMLElement) => {
      observer.unobserve(el);
      el.classList.add("rv-in");
      // Hand the element back to its own styles once it has arrived.
      window.setTimeout(() => {
        el.classList.remove("rv", "rv-in");
        el.style.removeProperty("--rv-i");
      }, 900);
    };

    // The watched area runs from far above the screen down to just short of its bottom edge. A
    // block counts as seen once its top passes that line and stays seen after it scrolls away, so
    // a fast scroll that carries a block from below the screen to above it between two frames
    // still reveals it. With the usual viewport-only area, the brand rail on the home page was
    // skipped that way and stayed invisible for good (found in testing, 2026-09-25).
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) if (entry.isIntersecting) reveal(entry.target as HTMLElement);
      },
      { rootMargin: "100000px 0px -6% 0px", threshold: 0 },
    );

    // Last line of defence: at the foot of the page, show whatever is still waiting.
    const atBottom = () => {
      if (window.scrollY + window.innerHeight < document.documentElement.scrollHeight - 4) return;
      for (const el of document.querySelectorAll<HTMLElement>(".rv:not(.rv-in)")) reveal(el);
    };
    window.addEventListener("scroll", atBottom, { passive: true });

    const viewportBottom = window.innerHeight;
    for (const container of document.querySelectorAll<HTMLElement>("[data-reveal-children]")) {
      // Inside a motion <Reveal>, the block is already animated as a whole.
      if (container.closest("[data-motion-reveal]")) continue;
      // Cards side by side arrive together, so they stagger; stacked blocks arrive one per scroll.
      const stagger = container.dataset.revealChildren === "stagger";
      let index = 0;
      for (const child of Array.from(container.children) as HTMLElement[]) {
        if (child.hasAttribute("data-motion-reveal") || child.querySelector("[data-motion-reveal]")) continue;
        // A nested container (a card grid) reveals its own children instead of rising as one block.
        if (child.hasAttribute("data-reveal-children")) continue;
        if (child.classList.contains("rv") || child.getBoundingClientRect().top < viewportBottom) continue;
        child.classList.add("rv");
        if (stagger) child.style.setProperty("--rv-i", String(Math.min(index++, 5)));
        observer.observe(child);
      }
    }

    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", atBottom);
    };
  }, [pathname]);

  return null;
}

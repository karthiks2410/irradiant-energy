"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { stripLocale } from "@/i18n/paths";

/**
 * Fixed header chrome. Over the home hero it starts transparent and turns solid
 * Deep Teal after the first scroll; everywhere else it is solid from the start.
 */
export function HeaderShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  // stripLocale, not a bare comparison: the home page is now "/en" or "/kn", and the transparent
  // overlay treatment belongs to the home hero in both.
  const overlay = stripLocale(pathname).path === "/";
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const solid = !overlay || scrolled;

  return (
    <header
      data-surface="dark"
      // min-h, not h (layout-risks.md B1): at 1024–1279 the Kannada right-hand cluster measured
      // 26px above and 26px below a fixed 72px band, i.e. the CTA was clipped by the header
      // itself. --header-h still drives scroll-padding-top and <main>'s top padding, so the bar
      // can grow without anything else moving.
      className={`fixed inset-x-0 top-0 z-50 min-h-(--header-h) text-white transition-[background-color,box-shadow] duration-500 ease-controlled ${
        solid ? "bg-teal-900 shadow-[0_1px_0_rgb(255_255_255/0.08)]" : "bg-linear-to-b from-teal-975/70 to-transparent"
      }`}
    >
      {children}
    </header>
  );
}

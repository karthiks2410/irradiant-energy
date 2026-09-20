"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";

/**
 * Fixed header chrome. Over the home hero it starts transparent and turns solid
 * Deep Teal after the first scroll; everywhere else it is solid from the start.
 */
export function HeaderShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const overlay = pathname === "/";
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
      className={`fixed inset-x-0 top-0 z-50 h-(--header-h) text-white transition-[background-color,box-shadow] duration-500 ease-controlled ${
        solid ? "bg-teal-900 shadow-[0_1px_0_rgb(255_255_255/0.08)]" : "bg-linear-to-b from-teal-975/70 to-transparent"
      }`}
    >
      {children}
    </header>
  );
}

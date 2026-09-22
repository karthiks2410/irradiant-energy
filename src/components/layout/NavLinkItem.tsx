"use client";

import { Link } from "@/components/i18n/LocaleLink";
import { usePathname } from "next/navigation";
import { stripLocale } from "@/i18n/paths";

export function NavLinkItem({ href, label }: { href: string; label: string }) {
  // Compare the path without its locale prefix, so "/kn/about" marks About current exactly as
  // "/en/about" does.
  const path = stripLocale(usePathname()).path;
  const active = href === "/" ? path === "/" : path.startsWith(href);

  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      // whitespace-nowrap + tighter Kannada padding: a nav item that wraps to two lines inside a
      // fixed-height bar is what broke the header at 1024 and 1280 (layout-risks.md B1). The
      // Kannada size step is 15px -> 14px, which is still the design system's `small`.
      className={`inline-flex min-h-11 items-center px-3 text-[0.9375rem] font-medium whitespace-nowrap transition-colors hover:text-yellow-400 kn:px-2.5 kn:text-[0.875rem] ${
        active ? "text-yellow-400" : ""
      }`}
    >
      {label}
    </Link>
  );
}

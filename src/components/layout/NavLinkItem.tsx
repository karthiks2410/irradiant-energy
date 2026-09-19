"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function NavLinkItem({ href, label }: { href: string; label: string }) {
  const pathname = usePathname();
  const active = href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={`inline-flex min-h-11 items-center px-3 text-[0.9375rem] font-medium transition-colors hover:text-yellow-400 ${
        active ? "text-yellow-400" : ""
      }`}
    >
      {label}
    </Link>
  );
}

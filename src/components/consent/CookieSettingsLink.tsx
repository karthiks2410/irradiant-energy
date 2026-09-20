"use client";

import Link from "next/link";
import type { MouseEvent, ReactNode } from "react";
import { openConsentSettings } from "@/lib/consent";

/**
 * The persistent way to change the answer, for the footer's Legal column.
 *
 * It is a real link to /cookies#cookie-settings that opens the preferences dialog instead, when it
 * can. That ordering matters: withdrawal must not be the one control on the page that quietly does
 * nothing if a script fails, and modified clicks (new tab, new window) keep working because they
 * are left alone. Without JavaScript it still lands on the notice, next to the same controls.
 *
 * Usage in SiteFooter's `legal` column (it is a client component, so the footer itself stays a
 * Server Component — only this link hydrates):
 *
 *     <CookieSettingsLink className="inline-flex min-h-11 items-center text-white/85 hover:text-white" />
 */
export function CookieSettingsLink({
  className = "",
  children = "Cookie settings",
}: {
  className?: string;
  children?: ReactNode;
}) {
  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    if (event.defaultPrevented) return;
    // Let the browser handle "open in a new tab/window" and anything but a plain primary click.
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    openConsentSettings();
  };

  return (
    <Link href="/cookies#cookie-settings" className={className} onClick={handleClick}>
      {children}
    </Link>
  );
}

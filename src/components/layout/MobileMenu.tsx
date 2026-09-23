"use client";

import { Link } from "@/components/i18n/LocaleLink";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { LanguageSwitch } from "@/components/i18n/LanguageSwitch";
import { LogoLockup } from "@/components/brand/Logo";
import { Template } from "@/components/i18n/Template";

/**
 * Everything the sheet says, plus the two links it builds.
 *
 * The sheet hydrates, so it may not import a content module: that would ship both languages'
 * copy to the browser. <SiteHeader> reads the merged content and passes this down.
 */
type MenuLink = { readonly label: string; readonly href: string };
type MenuGroup = { readonly label: string; readonly items: readonly MenuLink[] };

/** Same test as `isNavGroup`, over the narrower shape this sheet is handed. */
const isGroup = (item: MenuLink | MenuGroup): item is MenuGroup => "items" in item;

export type MobileMenuCopy = {
  nav: readonly (MenuLink | MenuGroup)[];
  primaryCta: MenuLink;
  labels: {
    open: string;
    dialogLabel: string;
    close: string;
    navLabel: string;
    /** "{groupLabel} · Rooftop solar" */
    groupLabel: string;
    call: string;
  };
  phone: { display: string; tel: string };
  /** Already built with the localised prefill, so no content module is needed here. */
  whatsappHref: string;
};

/**
 * Full-screen Deep Teal sheet (prototype S11) built on the native <dialog>:
 * showModal() gives focus containment, Esc to close and an inert page behind it.
 */
export function MobileMenu({ copy }: { copy: MobileMenuCopy }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const pathname = usePathname();

  useEffect(() => {
    dialogRef.current?.close();
  }, [pathname]);

  const { nav, primaryCta, labels, phone } = copy;

  return (
    <>
      <button
        type="button"
        onClick={() => dialogRef.current?.showModal()}
        aria-haspopup="dialog"
        // xl, matching SiteHeader's nav breakpoint: the sheet owns 1024–1279 now.
        className="inline-grid size-11 shrink-0 place-items-center rounded-full border border-white/30 xl:hidden"
      >
        <span className="sr-only">{labels.open}</span>
        <svg viewBox="0 0 24 24" aria-hidden="true" className="size-5" fill="none" stroke="currentColor" strokeWidth="1.75">
          <path d="M4 7h16M4 12h16M4 17h16" strokeLinecap="round" />
        </svg>
      </button>

      <dialog
        ref={dialogRef}
        aria-label={labels.dialogLabel}
        data-surface="dark"
        data-lenis-prevent
        className="m-0 h-dvh max-h-none w-full max-w-none overflow-y-auto bg-teal-900 text-white backdrop:bg-teal-975/60"
      >
        <div className="container-page flex min-h-(--header-h) items-center justify-between gap-3 py-1.5">
          <LogoLockup className="h-10 w-auto" />
          {/* The switch is the first thing in the sheet, not an afterthought at the bottom: below
              lg this is the ONLY place a visitor can change language (layout-risks.md B1 budgets
              ~24px of slack in the bar itself at 390px). */}
          <LanguageSwitch className="ml-auto" />
          <button
            type="button"
            onClick={() => dialogRef.current?.close()}
            className="inline-grid size-11 place-items-center rounded-full border border-white/30"
          >
            <span className="sr-only">{labels.close}</span>
            <svg viewBox="0 0 24 24" aria-hidden="true" className="size-5" fill="none" stroke="currentColor" strokeWidth="1.75">
              <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <nav aria-label={labels.navLabel} className="container-page pt-6 pb-10">
          <ul className="divide-y divide-white/10 border-y border-white/10">
            {nav.map((item) =>
              isGroup(item) ? (
                <li key={item.label} className="py-4">
                  <p className="font-label text-label text-green-300 uppercase">
                    <Template text={labels.groupLabel} values={{ groupLabel: item.label }} />
                  </p>
                  <ul className="mt-2">
                    {item.items.map((sub) => (
                      <li key={sub.href}>
                        <Link href={sub.href} className="block py-2 font-display text-h3 font-semibold">
                          {sub.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </li>
              ) : (
                <li key={item.href}>
                  <Link href={item.href} className="block py-4 font-display text-h3 font-semibold">
                    {item.label}
                  </Link>
                </li>
              ),
            )}
          </ul>

          <div className="mt-8 grid gap-3">
            <Link
              href={primaryCta.href}
              className="inline-flex min-h-12 items-center justify-center rounded-full bg-white px-6 font-semibold text-teal-900"
            >
              {primaryCta.label}
            </Link>
            <div className="grid grid-cols-2 gap-3">
              <a
                href={`tel:${phone.tel}`}
                className="inline-flex min-h-12 items-center justify-center rounded-full border border-white/40 px-4 font-semibold"
              >
                {labels.call}
              </a>
              <a
                href={copy.whatsappHref}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-12 items-center justify-center rounded-full border border-white/40 px-4 font-semibold"
              >
                WhatsApp
              </a>
            </div>
          </div>
        </nav>
      </dialog>
    </>
  );
}

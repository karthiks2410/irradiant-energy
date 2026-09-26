"use client";

import { Link } from "@/components/i18n/LocaleLink";
import { usePathname } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import { LanguageSwitch } from "@/components/i18n/LanguageSwitch";
import { openQuickQuote } from "@/components/quote/QuickQuote";
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
  /** Label of the button that opens the quick-quote popup. */
  quoteLabel: string;
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
 * Three lines that turn into an ✕ and back (owner, 2026-09-25: a 21st.dev component they wanted
 * "for mobile screen hamburger"). Rebuilt here rather than installed, so no shadcn, no `cn` and
 * no icon package; the motion is plain CSS keyed on `data-open` (globals.css, "Menu button").
 *
 * The first path is one stroke that runs top line → S-curve → stem → S-curve → bottom line. Two
 * dashes of it are the top and bottom lines; opening slides the first dash onto the stem and runs
 * the second off the end, which with the middle line makes a +, and the -45° turn makes the ✕.
 *
 * viewBox starts at x=1, not 0: the drawing is centred on x=17, so this centres both the lines
 * and the ✕ in the round button instead of leaving them ~0.7px right. 22px at 2.125 units keeps
 * the old icon's proportions: 13.75px lines (was 13.3), 1.46px stroke (unchanged).
 */
function MenuIcon({ open }: { open: boolean }) {
  return (
    <svg
      viewBox="1 0 32 32"
      aria-hidden="true"
      data-open={open}
      className="menu-icon size-5.5"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.125"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M27 10 13 10C10.8 10 9 8.2 9 6 9 3.5 10.8 2 13 2 15.2 2 17 3.8 17 6L17 26C17 28.2 18.8 30 21 30 23.2 30 25 28.2 25 26 25 23.8 23.2 22 21 22L7 22" />
      <path d="M7 16 27 16" />
    </svg>
  );
}

/**
 * Full-screen Deep Teal sheet (prototype S11) built on the native <dialog>:
 * showModal() gives focus containment, Esc to close and an inert page behind it.
 *
 * That inert page includes the header, so the header button cannot also be the one that closes
 * the sheet. Instead the sheet's own close button sits exactly where the header button is, and
 * both draw <MenuIcon> from the same `open` state: on every frame the two are in the same pose in
 * the same place, so while the sheet fades over the header the visitor sees one button turn into
 * an ✕, and back. `open` follows the dialog's own `close` event, so Esc, the ✕, a link and the
 * quote button all reset it.
 */
export function MobileMenu({ copy }: { copy: MobileMenuCopy }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);
  const sheetId = useId();
  const pathname = usePathname();

  useEffect(() => {
    dialogRef.current?.close();
  }, [pathname]);

  const { nav, labels, phone, quoteLabel } = copy;

  return (
    <>
      <button
        type="button"
        onClick={() => {
          dialogRef.current?.showModal();
          setOpen(true);
          // Start on the ✕, which is where the button just pressed appears to be: a keyboard
          // user's focus ring stays put instead of jumping to the language switch, the sheet's
          // first control. Focus still returns to this button on close (native <dialog>).
          closeRef.current?.focus();
        }}
        aria-haspopup="dialog"
        // It can only open the sheet (the open sheet makes it inert), so its name stays "Open
        // menu"; the control named "Close menu" is the ✕ that takes its place.
        aria-expanded={open}
        aria-controls={sheetId}
        // A hook for the e2e suite, which runs against both locales: the accessible name is
        // "Open menu" on /en and "ಮೆನು ತೆರೆಯಿರಿ" on /kn, so a test cannot find it by name the way
        // it used to. Same convention as [data-language-switch].
        data-menu-toggle
        // xl, matching SiteHeader's nav breakpoint: the sheet owns 1024–1279 now.
        className="inline-grid size-11 shrink-0 place-items-center rounded-full border border-white/30 xl:hidden"
      >
        <span className="sr-only">{labels.open}</span>
        <MenuIcon open={open} />
      </button>

      <dialog
        ref={dialogRef}
        id={sheetId}
        onClose={() => setOpen(false)}
        aria-label={labels.dialogLabel}
        data-surface="dark"
        data-lenis-prevent
        className="m-0 h-dvh max-h-none w-full max-w-none overflow-y-auto bg-teal-900 text-white sheet-down"
      >
        <div className="container-page flex min-h-(--header-h) items-center justify-between gap-3 py-1.5">
          {/* The logo is what gives when the row is tight. Logo + language switch + ✕ need ~352px
              and a 390px phone has 341, so the row overflowed: the ✕ was squeezed to ~33px wide
              (24px at 360), and held at 44px it would sit 10.5px right of the header button it
              has to cover. min-w-0 lets the logo's box shrink; object-contain scales the drawing
              with it. From ~402px up nothing changes. */}
          <LogoLockup className="h-10 w-auto min-w-0 object-contain object-left" />
          {/* The switch is the first thing in the sheet, not an afterthought at the bottom: below
              lg this is the ONLY place a visitor can change language (layout-risks.md B1 budgets
              ~24px of slack in the bar itself at 390px). */}
          <LanguageSwitch className="ml-auto" />
          {/* Same size and right edge as the header button in the same row geometry, so it lands
              exactly on top of it; `menu-close` holds it still while the sheet drops in. */}
          <button
            ref={closeRef}
            type="button"
            onClick={() => dialogRef.current?.close()}
            className="menu-close inline-grid size-11 shrink-0 place-items-center rounded-full border border-white/30"
          >
            <span className="sr-only">{labels.close}</span>
            <MenuIcon open={open} />
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
            <button
              type="button"
              aria-haspopup="dialog"
              onClick={() => {
                // One modal at a time: close the sheet, then open the quote popup.
                dialogRef.current?.close();
                openQuickQuote();
              }}
              className="inline-flex min-h-12 items-center justify-center rounded-full bg-white px-6 font-semibold text-teal-900"
            >
              {quoteLabel}
            </button>
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

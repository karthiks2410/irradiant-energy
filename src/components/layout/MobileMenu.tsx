"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { isNavGroup, nav, primaryCta, site, whatsappLink } from "@/content/site";
import { LogoLockup } from "@/components/brand/Logo";

/**
 * Full-screen Deep Teal sheet (prototype S11) built on the native <dialog>:
 * showModal() gives focus containment, Esc to close and an inert page behind it.
 */
export function MobileMenu() {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const pathname = usePathname();

  useEffect(() => {
    dialogRef.current?.close();
  }, [pathname]);

  const phone = site.contact.phonePrimary.value;

  return (
    <>
      <button
        type="button"
        onClick={() => dialogRef.current?.showModal()}
        aria-haspopup="dialog"
        className="inline-grid size-11 shrink-0 place-items-center rounded-full border border-white/30 lg:hidden"
      >
        <span className="sr-only">Open menu</span>
        <svg viewBox="0 0 24 24" aria-hidden="true" className="size-5" fill="none" stroke="currentColor" strokeWidth="1.75">
          <path d="M4 7h16M4 12h16M4 17h16" strokeLinecap="round" />
        </svg>
      </button>

      <dialog
        ref={dialogRef}
        aria-label="Menu"
        data-surface="dark"
        data-lenis-prevent
        className="m-0 h-dvh max-h-none w-full max-w-none overflow-y-auto bg-teal-900 text-white backdrop:bg-teal-975/60"
      >
        <div className="container-page flex h-(--header-h) items-center justify-between">
          <LogoLockup className="h-10 w-auto" />
          <button
            type="button"
            onClick={() => dialogRef.current?.close()}
            className="inline-grid size-11 place-items-center rounded-full border border-white/30"
          >
            <span className="sr-only">Close menu</span>
            <svg viewBox="0 0 24 24" aria-hidden="true" className="size-5" fill="none" stroke="currentColor" strokeWidth="1.75">
              <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <nav aria-label="Mobile" className="container-page pt-6 pb-10">
          <ul className="divide-y divide-white/10 border-y border-white/10">
            {nav.map((item) =>
              isNavGroup(item) ? (
                <li key={item.label} className="py-4">
                  <p className="font-mono text-label text-green-300 uppercase">{item.label} · Rooftop solar</p>
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
                Call us
              </a>
              <a
                href={whatsappLink(`Hi ${site.name}, I'd like to know more about rooftop solar.`)}
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

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useRef, useState, type ComponentType, type PointerEvent } from "react";
import { ArrowRightIcon, BusinessAudienceIcon, HomeAudienceIcon, SocietyAudienceIcon } from "@/components/ui";
import type { NavGroup } from "@/content/site";

/** One mark per audience, keyed by the page it links to. */
const icons: Record<string, ComponentType<{ className?: string }>> = {
  "/solutions/solar/home": HomeAudienceIcon,
  "/solutions/solar/housing-society": SocietyAudienceIcon,
  "/solutions/solar/commercial": BusinessAudienceIcon,
};

/**
 * Hover intent. A short wait before opening, so a pointer sweeping across the header on its way
 * somewhere else does not flash the panel open; and a grace period before closing, because the
 * path from the button down to a card is rarely straight and a menu that shuts the instant the
 * pointer strays feels broken. Both are the standard pattern for hover-opened navigation.
 */
const OPEN_DELAY_MS = 70;
const CLOSE_DELAY_MS = 140;

/** The site's expressive curve (motion/tokens.ts EASE_OUT_EXPO): leaves fast, settles long. */
const EASE = "ease-[cubic-bezier(0.16,1,0.3,1)]";

/**
 * The desktop Solutions menu: three audience cards that unfold under the pointer.
 *
 * Rebuilt from the owner's previous site (owner request, 2026-09-21), which opened on hover and
 * unfolded — a fade, a short drop and a slight scale from the top, with the cards arriving one
 * after another. The old version is improved in four ways:
 *
 * - Hover intent, both ways. It waits a moment before opening, so sweeping across the header does
 *   not flash it, and a moment before closing, with a padded "bridge" between button and panel,
 *   so a slightly curved path from one to the other does not shut it.
 * - Hover is a mouse affair only. A tap on a touch screen opens it through the click, not through
 *   an emulated hover that would then fight the click and close it again.
 * - It stays a disclosure for keyboard users: Enter or Space opens it, Tab walks the cards, Escape
 *   closes it and returns focus to the button, and tabbing out of it closes it.
 * - Its "Also available" row is gone. It listed Roof Rental, Utility Scale and Industrial, which
 *   this business does not offer; showing them would be the invented claim the content rules
 *   forbid. A link to compare all three audiences takes its place.
 *
 * The motion is CSS rather than a JS animation library, so the links are always in the server
 * HTML for crawlers, and the panel is `invisible` when closed, which takes them out of the tab
 * order and the accessibility tree without unmounting them. Under a reduced-motion preference the
 * global rule in globals.css collapses the transitions, so it simply appears and disappears.
 */
export function SolutionsMenu({ group }: { group: NavGroup }) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const openTimer = useRef<number | undefined>(undefined);
  const closeTimer = useRef<number | undefined>(undefined);
  /** Opened by hovering rather than by a click, so the next click keeps it open. */
  const openedByHover = useRef(false);
  const panelId = useId();
  const pathname = usePathname();
  const active = group.items.some((item) => pathname.startsWith(item.href));

  // Close on navigation. Adjusting during render rather than in an effect avoids the cascading
  // re-render React warns about, and closes before the new route paints.
  const [renderedPath, setRenderedPath] = useState(pathname);
  if (renderedPath !== pathname) {
    setRenderedPath(pathname);
    setOpen(false);
  }

  useEffect(
    () => () => {
      window.clearTimeout(openTimer.current);
      window.clearTimeout(closeTimer.current);
    },
    [],
  );

  useEffect(() => {
    if (!open) return;
    const onPointer = (event: globalThis.PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setOpen(false);
      buttonRef.current?.focus();
    };
    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const onPointerEnter = (event: PointerEvent) => {
    if (event.pointerType !== "mouse") return;
    window.clearTimeout(closeTimer.current);
    if (open) return;
    window.clearTimeout(openTimer.current);
    openTimer.current = window.setTimeout(() => {
      openedByHover.current = true;
      setOpen(true);
    }, OPEN_DELAY_MS);
  };

  const onPointerLeave = (event: PointerEvent) => {
    if (event.pointerType !== "mouse") return;
    window.clearTimeout(openTimer.current);
    window.clearTimeout(closeTimer.current);
    closeTimer.current = window.setTimeout(() => setOpen(false), CLOSE_DELAY_MS);
  };

  // A click on a menu the pointer already opened should not shut it in the visitor's face.
  const onClick = () => {
    window.clearTimeout(openTimer.current);
    if (open && openedByHover.current) {
      openedByHover.current = false;
      return;
    }
    openedByHover.current = false;
    setOpen((value) => !value);
  };

  return (
    <div
      ref={rootRef}
      className="relative"
      onPointerEnter={onPointerEnter}
      onPointerLeave={onPointerLeave}
      onBlur={(event) => {
        if (!rootRef.current?.contains(event.relatedTarget as Node)) setOpen(false);
      }}
    >
      <button
        ref={buttonRef}
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={onClick}
        className={`inline-flex min-h-11 items-center gap-1.5 px-3 text-[0.9375rem] font-medium transition-colors hover:text-yellow-400 ${
          active || open ? "text-yellow-400" : ""
        }`}
      >
        {group.label}
        <svg
          viewBox="0 0 16 16"
          aria-hidden="true"
          className={`size-3.5 transition-transform duration-300 ${EASE} ${open ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          strokeWidth="1.75"
        >
          <path d="M4 6l4 4 4-4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {/* The top padding is the bridge: the pointer crosses it on its way down without ever
          leaving this element, so the panel does not start closing mid-journey.

          It only takes pointer events while open. This wrapper is always in the page, sized to
          the panel, hanging over the hero below the header; if it caught the pointer while
          closed, hovering the hero would open the menu and clicks there would land on nothing. */}
      <div className={`absolute top-full left-1/2 -translate-x-1/2 pt-3 ${open ? "" : "pointer-events-none"}`}>
        <div
          id={panelId}
          className={`w-[680px] max-w-[calc(100vw-2rem)] origin-top rounded-lg border border-mist bg-white p-6 text-carbon shadow-overlay transition-[opacity,translate,scale,visibility] ${EASE} ${
            open
              ? "visible translate-y-0 scale-100 opacity-100 duration-[260ms]"
              : "invisible -translate-y-2 scale-[0.97] opacity-0 duration-150"
          }`}
        >
          <p className="font-mono text-label text-grey-600 uppercase">Rooftop solar</p>

          <ul className="mt-4 grid grid-cols-3 gap-3">
            {group.items.map((item, index) => {
              const Icon = icons[item.href];
              return (
                <li
                  key={item.href}
                  // The cards arrive one after another once the panel has started to open, and
                  // leave together, so closing is never slower than it has to be.
                  style={{ transitionDelay: open ? `${70 + index * 45}ms` : "0ms" }}
                  className={`transition-[opacity,translate] duration-300 ${EASE} ${
                    open ? "translate-y-0 opacity-100" : "translate-y-1.5 opacity-0"
                  }`}
                >
                  <Link
                    href={item.href}
                    className="group flex h-full flex-col rounded-md border border-mist p-5 transition-colors duration-200 hover:border-green-500/40 hover:bg-green-500/[0.04] focus-visible:border-green-500/40 focus-visible:bg-green-500/[0.04]"
                  >
                    {Icon && (
                      <span className="grid size-11 place-items-center rounded-md bg-canvas text-teal-900 transition-colors duration-200 group-hover:bg-green-500/10 group-hover:text-green-700">
                        <Icon className="size-5" />
                      </span>
                    )}
                    <span className="mt-4 block font-display text-h4 font-semibold">{item.label}</span>
                    {item.description && (
                      <span className="mt-1.5 block text-small text-ink-2">{item.description}</span>
                    )}
                    <span className="mt-auto inline-flex items-center gap-1 pt-3 text-small font-medium text-green-700 opacity-0 transition-[opacity,translate] duration-200 group-hover:translate-x-0.5 group-hover:opacity-100 group-focus-visible:opacity-100">
                      Explore
                      <ArrowRightIcon className="size-3.5" />
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>

          <div className="mt-5 flex items-center justify-between border-t border-mist pt-4">
            <p className="text-small text-grey-600">Not sure which fits you?</p>
            <Link
              href="/solutions"
              className="group inline-flex items-center gap-1.5 text-small font-semibold text-green-700 hover:underline"
            >
              Compare all three
              <ArrowRightIcon className="size-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

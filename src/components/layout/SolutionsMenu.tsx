"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import type { NavGroup } from "@/content/site";

/** Desktop disclosure menu. Links stay in the DOM when closed so crawlers can follow them. */
export function SolutionsMenu({ group }: { group: NavGroup }) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const panelId = useId();
  const pathname = usePathname();
  const active = group.items.some((item) => pathname.startsWith(item.href));

  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    if (!open) return;
    const onPointer = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((v) => !v)}
        className={`inline-flex min-h-11 items-center gap-1.5 px-3 text-[0.9375rem] font-medium transition-colors hover:text-yellow-400 ${
          active ? "text-yellow-400" : ""
        }`}
      >
        {group.label}
        <svg
          viewBox="0 0 16 16"
          aria-hidden="true"
          className={`size-3.5 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          strokeWidth="1.75"
        >
          <path d="M4 6l4 4 4-4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      <div
        id={panelId}
        hidden={!open}
        className="absolute top-full left-1/2 mt-3 w-80 -translate-x-1/2 rounded-md bg-white p-2 text-carbon shadow-overlay"
      >
        <p className="px-3 pt-2 pb-1 font-mono text-label text-grey-600 uppercase">Rooftop solar</p>
        <ul>
          {group.items.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className="block rounded-sm px-3 py-2.5 transition-colors hover:bg-canvas focus-visible:bg-canvas"
              >
                <span className="block font-display text-h4 font-semibold">{item.label}</span>
                {item.description && <span className="block text-small text-ink-2">{item.description}</span>}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

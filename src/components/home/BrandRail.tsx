"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { Section, SectionHeading } from "@/components/ui";
import { Reveal } from "@/components/motion/Reveal";
import { homePage } from "@/content/home";
import type { Brand } from "@/content/home";
import { AccentTitle } from "./AccentTitle";

const { brands } = homePage;

/**
 * The equipment brands, as the owner's prototype has them: two rails travelling in opposite
 * directions, pausing under the pointer.
 *
 * The rails use the prototype's own `.partner-rail` / `.partner-track` rules, which live in
 * globals.css because they need real `@keyframes`. Each track holds its half of the list twice
 * and travels exactly -50%, so the loop closes on the copy and there is no visible seam.
 *
 * Pausing has three triggers, not one. Hover is the prototype's. Focus-within is added, so a
 * keyboard visitor is never reading a card that is moving. And the rail stops when it leaves the
 * viewport, because nothing that moves on its own may keep running off-screen — the rule the hero
 * carousel already follows. That last trigger is the only reason this is a client component.
 *
 * The duplicate half is `aria-hidden` and `inert`, so assistive technology hears seventeen brands
 * rather than thirty-four and nothing in the copy can be tabbed into.
 */
function BrandCard({ brand }: { brand: Brand }) {
  return (
    <div className="flex h-[92px] min-w-[280px] items-center gap-3.5 rounded-lg border border-mist bg-white px-4 py-3.5">
      {/* A landscape slot, because most of these marks are wordmarks at roughly 4:1 and a square
          box shrinks them to fit their width. The lettermark keeps the tinted panel, which is
          what makes the two read as the same kind of object at the same size. */}
      {brand.logo ? (
        <Image
          src={brand.logo}
          alt=""
          // Source dimensions are the slot at 2x, so a retina screen gets a sharp mark.
          width={136}
          height={104}
          className="h-[52px] w-[68px] shrink-0 object-contain object-left"
        />
      ) : (
        <span
          aria-hidden="true"
          className="grid h-[52px] w-[68px] shrink-0 place-items-center rounded-md bg-green-500/10 font-display text-ui font-bold text-green-700"
        >
          {/* Initials of the words in the name, so "APL Apollo" reads AA rather than A. */}
          {brand.name
            .split(" ")
            .map((word) => word[0])
            .join("")
            .slice(0, 3)}
        </span>
      )}
      <span className="min-w-0">
        <span className="block font-label text-label text-green-700 uppercase">{brand.category}</span>
        <span className="mt-1.5 block truncate font-display text-h4 font-bold text-teal-900">{brand.name}</span>
      </span>
    </div>
  );
}

function Rail({ items, direction }: { items: readonly Brand[]; direction: "left" | "right" }) {
  const rail = useRef<HTMLDivElement>(null);
  // Assume it is running, so the server HTML and the first client paint agree.
  const [onScreen, setOnScreen] = useState(true);

  useEffect(() => {
    const node = rail.current;
    if (!node) return;
    const observer = new IntersectionObserver(([entry]) => setOnScreen(entry.isIntersecting));
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={rail} className="brand-rail" data-direction={direction} data-running={onScreen}>
      <div className="brand-track">
        <div className="brand-group">
          {items.map((brand) => (
            <BrandCard key={brand.name} brand={brand} />
          ))}
        </div>
        {/* The second group exists only so the loop closes on itself. It is the same width as
            the first, which is what makes travelling -50% land exactly on it. */}
        <div aria-hidden="true" inert className="brand-group" data-marquee-copy>
          {items.map((brand) => (
            <BrandCard key={`copy-${brand.name}`} brand={brand} />
          ))}
        </div>
      </div>
    </div>
  );
}

export function BrandRail() {
  const half = Math.ceil(brands.items.length / 2);

  return (
    // Canvas, not the prototype's white: WhyBand directly above is already white, and white
    // cards need a surface behind them to read as cards at all.
    <Section aria-labelledby="brands-heading">
      <Reveal>
        <SectionHeading
          id="brands-heading"
          eyebrow={brands.copy.eyebrow}
          title={<AccentTitle text={brands.copy.title} words={2} />}
          lead={brands.copy.lead}
        />
      </Reveal>

      {/* Outside <Reveal> on purpose: the reveal animates a transform on its wrapper, and a
          transformed ancestor makes the rails' own transforms judder while it runs. */}
      <div className="mt-12 grid gap-4">
        <Rail items={brands.items.slice(0, half)} direction="right" />
        <Rail items={brands.items.slice(half)} direction="left" />
      </div>
    </Section>
  );
}

import Image from "next/image";
import { Section, SectionHeading } from "@/components/ui";
import { Reveal } from "@/components/motion/Reveal";
import { homePage } from "@/content/home";
import type { Brand } from "@/content/home";
import { AccentTitle } from "./AccentTitle";

const { brands } = homePage;

/**
 * The equipment brands, grouped by what they make.
 *
 * Grouping rather than a flat rail, because the categories are the useful part. Seventeen names
 * in a row is a wall of words a visitor skims past; "Modules / Inverters / Batteries / Switchgear
 * / Wires / Steel" tells them we think about the whole system rather than just the panels, and it
 * is also how they will compare us against a quote from someone else.
 *
 * No carousel. The prototype scrolled this rail sideways, which hides most of the content behind
 * a gesture and leaves half-cards bleeding off both edges. Everything fits on the page instead.
 *
 * Logos: each brand renders its official mark when one has been cleared and self-hosted, and a
 * lettermark until then (see the held item `proto:partners:logos`). Both shapes are the same
 * size, so dropping a logo in changes nothing around it.
 */
function BrandCard({ brand }: { brand: Brand }) {
  return (
    <li className="flex min-h-[4.5rem] items-center gap-3 rounded-md border border-mist bg-white px-4 py-3">
      {/* A real mark carries its own colour and often its own background, so it is shown plain.
          The lettermark keeps the tinted square, which is what makes the two read as the same
          kind of object at the same size. */}
      {brand.logo ? (
        <Image
          src={brand.logo}
          alt=""
          width={40}
          height={40}
          className="size-10 shrink-0 rounded-sm object-contain"
        />
      ) : (
        <span
          aria-hidden="true"
          className="grid size-10 shrink-0 place-items-center rounded-sm bg-green-500/10 font-display text-ui font-bold text-green-700"
        >
          {/* Initials of the words in the name, so "APL Apollo" reads AA rather than A. */}
          {brand.name
            .split(" ")
            .map((word) => word[0])
            .join("")
            .slice(0, 2)}
        </span>
      )}
      <span className="min-w-0">
        <span className="block truncate font-display text-ui font-bold text-carbon">{brand.name}</span>
      </span>
    </li>
  );
}

export function BrandRail() {
  // Preserve the order the owner listed them in, within each group.
  const groups = brands.items.reduce<Map<string, Brand[]>>((acc, brand) => {
    const bucket = acc.get(brand.category);
    if (bucket) bucket.push(brand);
    else acc.set(brand.category, [brand]);
    return acc;
  }, new Map());

  return (
    <Section aria-labelledby="brands-heading">
      <Reveal>
        <SectionHeading
          id="brands-heading"
          align="stacked"
          eyebrow={brands.copy.eyebrow}
          title={<AccentTitle text={brands.copy.title} words={2} />}
        />

        <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {[...groups].map(([category, items]) => (
            <div key={category}>
              <h3 className="font-mono text-label text-green-700 uppercase">{category}</h3>
              <ul className="mt-3 grid gap-2">
                {items.map((brand) => (
                  <BrandCard key={brand.name} brand={brand} />
                ))}
              </ul>
            </div>
          ))}
        </div>
      </Reveal>
    </Section>
  );
}

"use client";

import { LazyMotion, domAnimation, m, useReducedMotion } from "motion/react";
import { useId, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import { ChevronDownIcon } from "./Icons";

export interface AccordionItem {
  /** Unique on the page; used as the item's anchor id and for the ARIA wiring. */
  id: string;
  question: string;
  answer: ReactNode;
}

type AccordionProps = {
  items: AccordionItem[];
  /** Only one item open at a time. */
  single?: boolean;
  /** Ids that render expanded in the server HTML. */
  defaultOpen?: string[];
  headingLevel?: 2 | 3 | 4;
  className?: string;
};

const ease = [0.22, 1, 0.36, 1] as const;

const panelVariants = {
  open: { height: "auto", opacity: 1 },
  closed: { height: 0, opacity: 0 },
};

/**
 * Disclosure list for FAQs: button[aria-expanded] + region, Up/Down/Home/End between questions.
 * Every answer is in the server HTML (closed ones carry `hidden`); the height tween is instant under
 * reduced motion.
 */
export function Accordion({ items, single = false, defaultOpen = [], headingLevel = 3, className = "" }: AccordionProps) {
  const [open, setOpen] = useState(() => new Set(defaultOpen));
  const reduced = useReducedMotion();
  const baseId = useId();
  const triggers = useRef<(HTMLButtonElement | null)[]>([]);
  const Heading = `h${headingLevel}` as const;

  const toggle = (id: string) =>
    setOpen((previous) => {
      const next = single ? new Set<string>() : new Set(previous);
      if (previous.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const onKeyDown = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    const targets: Record<string, number> = { ArrowDown: index + 1, ArrowUp: index - 1, Home: 0, End: items.length - 1 };
    const target = targets[event.key];
    if (target === undefined) return;
    event.preventDefault();
    triggers.current[(target + items.length) % items.length]?.focus();
  };

  return (
    <LazyMotion features={domAnimation} strict>
      <div
        className={`divide-y divide-mist border-y border-mist in-data-[surface=dark]:divide-white/15 in-data-[surface=dark]:border-white/15 ${className}`}
      >
        {items.map((item, index) => {
          const isOpen = open.has(item.id);
          const buttonId = `${baseId}-${item.id}-button`;
          const panelId = `${baseId}-${item.id}-panel`;
          return (
            <div key={item.id} id={item.id}>
              <Heading>
                <button
                  type="button"
                  id={buttonId}
                  aria-expanded={isOpen}
                  aria-controls={panelId}
                  onClick={() => toggle(item.id)}
                  onKeyDown={(event) => onKeyDown(event, index)}
                  ref={(element) => {
                    triggers.current[index] = element;
                  }}
                  className="flex min-h-11 w-full items-center justify-between gap-6 py-5 text-left font-display text-h4 font-semibold text-carbon transition-colors duration-200 hover:text-green-700 in-data-[surface=dark]:text-white in-data-[surface=dark]:hover:text-green-300"
                >
                  <span>{item.question}</span>
                  <ChevronDownIcon
                    className={`size-5 shrink-0 transition-transform duration-200 ease-controlled ${isOpen ? "rotate-180" : ""}`}
                  />
                </button>
              </Heading>
              <AccordionPanel id={panelId} labelledBy={buttonId} open={isOpen} instant={reduced === true}>
                {item.answer}
              </AccordionPanel>
            </div>
          );
        })}
      </div>
    </LazyMotion>
  );
}

type AccordionPanelProps = {
  id: string;
  labelledBy: string;
  open: boolean;
  instant: boolean;
  children: ReactNode;
};

function AccordionPanel({ id, labelledBy, open, instant, children }: AccordionPanelProps) {
  // `hidden` is applied only once the close animation has finished, so the panel can tween to 0 first.
  const [settledClosed, setSettledClosed] = useState(!open);

  return (
    <m.div
      id={id}
      role="region"
      aria-labelledby={labelledBy}
      hidden={!open && settledClosed}
      initial={false}
      animate={open ? "open" : "closed"}
      variants={panelVariants}
      transition={instant ? { duration: 0 } : { duration: 0.3, ease }}
      onAnimationStart={(definition) => {
        if (definition === "open") setSettledClosed(false);
      }}
      onAnimationComplete={(definition) => {
        if (definition === "closed") setSettledClosed(true);
      }}
      className="overflow-hidden"
    >
      <div className="pb-6 text-body text-ink-2 in-data-[surface=dark]:text-white/80">{children}</div>
    </m.div>
  );
}

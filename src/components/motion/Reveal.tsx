"use client";

import { LazyMotion, domAnimation, m, stagger, useInView, useReducedMotion } from "motion/react";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { EASE_OUT_EXPO, REVEAL_DURATION, REVEAL_RISE } from "./tokens";

type RevealTag = "div" | "section" | "article" | "aside" | "ul" | "ol" | "li" | "p" | "figure" | "span";

// Owner review 2, point 13: the old 8px / 0.38s fade was too small to register as movement — the
// sections looked like they were simply switching on. A 24px rise on an ease-out-expo curve travels
// far enough to read as "coming up"; 0.5s (down from 0.62s, owner 2026-09-25, after
// sweat-and-fit.vercel.app) keeps it quick, and matches the CSS scroll reveal in ScrollReveal.tsx.
const ease = EASE_OUT_EXPO;
const rise = REVEAL_RISE;
const duration = REVEAL_DURATION;

const itemVariants = {
  hidden: { opacity: 0, y: rise, transition: { duration: 0 } },
  visible: { opacity: 1, y: 0, transition: { duration, ease } },
};

type RevealProps = {
  as?: RevealTag;
  /** Seconds before the reveal starts. */
  delay?: number;
  /**
   * Seconds between the reveals of nested <RevealItem>s. With stagger set this element only orchestrates
   * its items and does not fade itself.
   */
  stagger?: number;
  id?: string;
  className?: string;
  children: ReactNode;
};

/**
 * Fade + rise when the block scrolls into view, once. The server HTML is fully visible: elements are
 * hidden only after hydration and only when they sit below the viewport, so LCP and above-the-fold
 * content are never affected. No-op under prefers-reduced-motion.
 */
export function Reveal({ as = "div", delay = 0, stagger: itemStagger, id, className, children }: RevealProps) {
  const element = useRef<HTMLElement | null>(null);
  const [armed, setArmed] = useState(false);
  const reduced = useReducedMotion();
  const inView = useInView(element, { once: true, margin: "0px 0px -10% 0px" });

  useEffect(() => {
    if (reduced) return;
    const node = element.current;
    if (node && node.getBoundingClientRect().top >= window.innerHeight) setArmed(true);
  }, [reduced]);

  // An intersection observer only fires while an element crosses the viewport. A jump that skips
  // past it — restored scroll on refresh, a deep link, Cmd+End — leaves it hidden for good. Once
  // armed, watch the scroll position too and reveal as soon as the viewport reaches the element.
  useEffect(() => {
    if (reduced || !armed || inView) return;
    const node = element.current;
    if (!node) return;
    const revealIfReached = () => {
      if (node.getBoundingClientRect().top < window.innerHeight) setArmed(false);
    };
    revealIfReached();
    window.addEventListener("scroll", revealIfReached, { passive: true });
    window.addEventListener("resize", revealIfReached, { passive: true });
    return () => {
      window.removeEventListener("scroll", revealIfReached);
      window.removeEventListener("resize", revealIfReached);
    };
  }, [armed, inView, reduced]);

  const variants =
    itemStagger === undefined
      ? {
          hidden: itemVariants.hidden,
          visible: { ...itemVariants.visible, transition: { duration, ease, delay } },
        }
      : {
          hidden: { transition: { duration: 0 } },
          visible: { transition: { delayChildren: stagger(itemStagger, { startDelay: delay }) } },
        };

  // The tags share one runtime shape; the div signature stands in for the union.
  const Tag = m[as] as typeof m.div;

  return (
    <LazyMotion features={domAnimation} strict>
      <Tag
        ref={(node: HTMLElement | null) => {
          element.current = node;
        }}
        id={id}
        className={className}
        data-motion-reveal=""
        initial={false}
        animate={armed && !inView ? "hidden" : "visible"}
        variants={variants}
      >
        {children}
      </Tag>
    </LazyMotion>
  );
}

type RevealItemProps = {
  as?: RevealTag;
  id?: string;
  className?: string;
  children: ReactNode;
};

/** A staggered child of <Reveal stagger>; renders plainly (and stays visible) anywhere else. */
export function RevealItem({ as = "div", id, className, children }: RevealItemProps) {
  const Tag = m[as] as typeof m.div;
  return (
    <Tag id={id} className={className} variants={itemVariants}>
      {children}
    </Tag>
  );
}

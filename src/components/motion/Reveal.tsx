"use client";

import { LazyMotion, domAnimation, m, stagger, useInView, useReducedMotion } from "motion/react";
import { useEffect, useRef, useState, type ReactNode } from "react";

type RevealTag = "div" | "section" | "article" | "ul" | "ol" | "li" | "p" | "figure" | "span";

const ease = [0.22, 1, 0.36, 1] as const;
const rise = 8;
const duration = 0.5;

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
 * Fade + 8px rise when the block scrolls into view, once. The server HTML is fully visible: elements are
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

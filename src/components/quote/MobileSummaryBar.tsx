"use client";

/**
 * Small screens only: keeps the headline figure in view while the visitor plays with step 1,
 * and gets out of the way (including out of the tab order) once step 2 is on screen, so it
 * never sits on top of the form or the footer.
 *
 * Both figure lines are templates, not a number with a unit stuck on the end: Kannada says
 * "ವರ್ಷಕ್ಕೆ ₹41,000" — the amount second — so the hole has to be able to move.
 */

import { useEffect, useRef, useState } from "react";
import { ArrowRightIcon } from "@/components/ui";
import type { QuotePage } from "@/content/quote";
import { TickerNumber } from "@/components/motion/TickerNumber";
import { formatInr } from "@/lib/solar/format";
import { fillTags } from "./template";
import { useEstimate } from "./EstimateProvider";

export interface MobileSummaryCopy {
  summary: QuotePage["summary"];
  format: QuotePage["format"];
}

export function MobileSummaryBar({ targetId, copy }: { targetId: string; copy: MobileSummaryCopy }) {
  const { estimate } = useEstimate();
  const [atTarget, setAtTarget] = useState(false);
  const rail = useRef<HTMLDivElement>(null);

  // Publish the rail's height so anything else anchored to the bottom of the viewport can sit
  // above it. Today that is the floating WhatsApp bubble, which would otherwise land on top of
  // this bar on a phone. It is measured rather than hard-coded because the bar wraps to two
  // lines at narrow widths, and cleared whenever the bar is not actually occupying space.
  useEffect(() => {
    const node = rail.current;
    const root = document.documentElement;
    const clear = () => root.style.removeProperty("--bottom-rail-h");
    if (!node || atTarget) {
      clear();
      return clear;
    }
    const observer = new ResizeObserver(([entry]) => {
      root.style.setProperty("--bottom-rail-h", `${Math.round(entry.contentRect.height)}px`);
    });
    observer.observe(node);
    return () => {
      observer.disconnect();
      clear();
    };
  }, [atTarget]);

  // One-way: once the form has been reached the shortcut has done its job, and a bar that came
  // back on the way down would sit on top of the footer.
  useEffect(() => {
    const target = document.getElementById(targetId);
    if (!target) return;
    const observer = new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting)) {
        setAtTarget(true);
        observer.disconnect();
      }
    });
    observer.observe(target);
    return () => observer.disconnect();
  }, [targetId]);

  return (
    <div
      ref={rail}
      data-surface="dark"
      inert={atTarget}
      className={`fixed inset-x-0 bottom-0 z-40 border-t border-white/15 bg-teal-900 transition-[opacity,transform] duration-200 ease-controlled lg:hidden ${
        atTarget ? "pointer-events-none translate-y-full opacity-0" : "translate-y-0 opacity-100"
      }`}
    >
      <div className="container-page flex flex-wrap items-center justify-between gap-x-4 gap-y-2 py-3">
        <div className="min-w-0">
          {estimate === null ? (
            // Only reachable if the bill itself is unusable; the PIN no longer gates anything.
            <>
              <p className="text-ui font-medium text-white">{copy.summary.waitingHeading}</p>
              <p className="text-small text-on-dark-muted">{copy.summary.waitingNote}</p>
            </>
          ) : (
            <>
              {/* Same springing figures as the tiles above, so the bar and the panel agree
                  frame by frame instead of one settling before the other. */}
              <p className="font-mono text-ui font-medium text-white tabular-nums">
                {fillTags(copy.summary.kwp, {
                  values: { kwp: <TickerNumber value={estimate.systemKwp} format={(n) => n.toFixed(1)} /> },
                })}
              </p>
              <p className="text-small text-on-dark-muted tabular-nums">
                {fillTags(copy.summary.perYear, {
                  spacing: "detach",
                  values: {
                    amount: (
                      <TickerNumber
                        value={estimate.annualSavingsInr}
                        format={(n) =>
                          formatInr(Math.round(n), {
                            compact: { lakh: copy.format.compactLakh, crore: copy.format.compactCrore },
                          })
                        }
                      />
                    ),
                  },
                })}
              </p>
            </>
          )}
        </div>
        <a
          href={`#${targetId}`}
          className="group inline-flex min-h-11 items-center gap-3 rounded-full bg-white py-1.5 pr-1.5 pl-5 text-ui font-semibold text-carbon transition-colors duration-200 ease-controlled hover:bg-canvas"
        >
          <span>{copy.summary.cta}</span>
          <span
            aria-hidden="true"
            className="inline-grid size-8 shrink-0 place-items-center rounded-full bg-green-700 text-white transition-transform duration-200 ease-controlled group-hover:translate-x-0.5"
          >
            <ArrowRightIcon className="size-4" />
          </span>
        </a>
      </div>
    </div>
  );
}

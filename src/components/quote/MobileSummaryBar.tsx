"use client";

/**
 * Small screens only: keeps the headline figure in view while the visitor plays with step 1,
 * and gets out of the way (including out of the tab order) once step 2 is on screen, so it
 * never sits on top of the form or the footer.
 */

import { useEffect, useState } from "react";
import { ArrowRightIcon } from "@/components/ui";
import { formatInr } from "@/lib/solar/format";
import { useEstimate } from "./EstimateProvider";

export function MobileSummaryBar({ targetId }: { targetId: string }) {
  const { estimate } = useEstimate();
  const [atTarget, setAtTarget] = useState(false);

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
      data-surface="dark"
      inert={atTarget}
      className={`fixed inset-x-0 bottom-0 z-40 border-t border-white/15 bg-teal-900 transition-[opacity,transform] duration-200 ease-controlled lg:hidden ${
        atTarget ? "pointer-events-none translate-y-full opacity-0" : "translate-y-0 opacity-100"
      }`}
    >
      <div className="container-page flex flex-wrap items-center justify-between gap-x-4 gap-y-2 py-3">
        <div className="min-w-0">
          {estimate === null ? (
            // No PIN code yet, so there is no estimate to summarise (owner review round 2, point 8).
            <>
              <p className="text-ui font-medium text-white">Your estimate</p>
              <p className="text-small text-on-dark-muted">Add your PIN code to see it</p>
            </>
          ) : (
            <>
              <p className="font-mono text-ui font-medium text-white tabular-nums">
                {estimate.systemKwp.toFixed(1)} kWp
              </p>
              <p className="text-small text-on-dark-muted">
                {formatInr(estimate.annualSavingsInr, { compact: true })} a year (estimated)
              </p>
            </>
          )}
        </div>
        <a
          href={`#${targetId}`}
          className="group inline-flex min-h-11 items-center gap-3 rounded-full bg-white py-1.5 pr-1.5 pl-5 text-ui font-semibold text-carbon transition-colors duration-200 ease-controlled hover:bg-canvas"
        >
          <span>Get proposal</span>
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

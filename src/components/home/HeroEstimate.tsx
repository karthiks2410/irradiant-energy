"use client";

import { useId, useState, type FormEvent } from "react";
import { ArrowRightIcon } from "@/components/ui";
import { useHomeEstimate } from "./HomeEstimateProvider";

/** The engine's own rule (resolveRegion), restated so this can validate before handing over. */
const PINCODE_RE = /(\d{6})/;

/**
 * Two fields and a button, in the hero: the monthly bill and a PIN code.
 *
 * This is the site's one real advantage put where people can find it. Every competitor compared
 * (Tata Power, Arka, Atria, EcoSoch) puts its number behind a name, a mobile and an SMS code, or
 * has no estimator at all. Ours needs no name, no email, no phone and no verification — and it
 * was sitting four screens down where nothing above the fold hinted it existed. Burying the best
 * thing on the page is the mistake two of those four also make.
 *
 * It does not compute here. It seeds the shared inputs and sends the visitor to the calculator
 * band, which shows the figures and, just as importantly, the assumptions behind them. Putting
 * a bare number in the hero with its caveats four sections away would be the wrong trade.
 *
 * The PIN is asked for because the calculator will not show figures without one. It is worth
 * knowing that it currently changes no figure at all — every tariff and yield constant is the
 * same statewide, so it only decides which caveat appears. If that gate is ever lifted, this
 * drops to a single field.
 *
 * PROPOSED CONTENT — REQUIRES CLIENT APPROVAL: every string below is new UX copy. None of it
 * states a fact about the business; the promise it makes ("no phone number") is about this form.
 */
export function HeroEstimate() {
  const { bill, setBill, location, setLocation } = useHomeEstimate();
  const [missingPin, setMissingPin] = useState(false);
  const billId = useId();
  const pinId = useId();

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (!PINCODE_RE.test(location)) {
      setMissingPin(true);
      document.getElementById(pinId)?.focus();
      return;
    }
    setMissingPin(false);
    // A plain hash jump rather than scrollIntoView, so Lenis applies the header offset the same
    // way it does for every other in-page link (ui-kit README § Motion islands).
    window.location.hash = "calculator";
  };

  const field =
    "min-h-12 w-full rounded-md border border-white/25 bg-white/10 px-3.5 text-ui text-white backdrop-blur-sm placeholder:text-white/55 focus-visible:border-white focus-visible:outline-none";

  return (
    <form onSubmit={submit} className="mt-7 max-w-[520px]">
      <div className="grid gap-2.5 sm:grid-cols-[1.3fr_1fr]">
        <div>
          <label htmlFor={billId} className="block text-small font-medium text-white/85">
            Monthly electricity bill
          </label>
          <div className="relative mt-1.5">
            <span aria-hidden="true" className="absolute inset-y-0 left-3.5 grid place-items-center text-ui text-white/70">
              ₹
            </span>
            <input
              id={billId}
              name="bill"
              type="text"
              inputMode="numeric"
              autoComplete="off"
              value={bill}
              onChange={(event) => setBill(event.target.value.replace(/[^\d]/g, ""))}
              className={`${field} pl-7`}
            />
          </div>
        </div>

        <div>
          <label htmlFor={pinId} className="block text-small font-medium text-white/85">
            PIN code
          </label>
          <input
            id={pinId}
            name="pincode"
            type="text"
            inputMode="numeric"
            autoComplete="postal-code"
            placeholder="e.g. 560001"
            value={location}
            onChange={(event) => {
              setLocation(event.target.value);
              if (missingPin) setMissingPin(false);
            }}
            aria-invalid={missingPin || undefined}
            aria-describedby={missingPin ? `${pinId}-error` : undefined}
            className={`${field} mt-1.5 ${missingPin ? "border-yellow-400" : ""}`}
          />
        </div>
      </div>

      {missingPin && (
        <p id={`${pinId}-error`} role="alert" className="mt-2 text-small font-medium text-yellow-400">
          Add a 6-digit PIN code and we will show your estimate.
        </p>
      )}

      <div className="mt-3.5 flex flex-wrap items-center gap-x-4 gap-y-2">
        <button
          type="submit"
          className="group inline-flex min-h-[54px] items-center gap-3 rounded-full bg-white py-1.5 pr-1.5 pl-6 text-ui font-semibold text-carbon transition-colors duration-200 ease-controlled hover:bg-canvas"
        >
          See my estimate
          <span
            aria-hidden="true"
            className="grid size-10 shrink-0 place-items-center rounded-full bg-green-700 text-white transition-transform duration-200 ease-controlled group-hover:translate-x-0.5"
          >
            <ArrowRightIcon className="size-4" />
          </span>
        </button>
        <p className="text-small text-white/80">No phone number. No sign-up.</p>
      </div>
    </form>
  );
}

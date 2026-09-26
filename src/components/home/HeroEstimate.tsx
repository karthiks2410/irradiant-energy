"use client";

import { useId, type FormEvent } from "react";
import { ArrowRightIcon } from "@/components/ui";
import { useHomeEstimate } from "./HomeEstimateProvider";

/**
 * One field and a button, in the hero: the monthly bill.
 *
 * This is the site's one real advantage put where people can find it. Every competitor compared
 * (Tata Power, Arka, Atria, EcoSoch) puts its number behind a name, a mobile and an SMS code, or
 * has no estimator at all. Ours needs no name, no email, no phone and no verification — and it
 * was sitting four screens down where nothing above the fold hinted it existed.
 *
 * One field, because the bill is the only input that moves a figure. The PIN code used to be
 * asked for here too, until measuring showed it changes nothing the visitor sees: at the same
 * bill, a Bengaluru PIN, a Mysuru PIN, a Delhi PIN and no PIN all return the same system size,
 * generation, saving and payback. It narrows the tariff caveat, which is worth offering in the
 * calculator and not worth a second field in the hero.
 *
 * It does not compute here. It seeds the shared bill and sends the visitor to the calculator
 * band, which shows the figures and, just as importantly, the assumptions behind them. Putting
 * a bare number in the hero with its caveats four sections away would be the wrong trade.
 *
 * PROPOSED CONTENT — REQUIRES CLIENT APPROVAL: every string it renders is new UX copy (see
 * `ui.home` in src/content/ui.ts). None of it states a fact about the business; the promise it
 * makes ("no phone number") is about this form. The strings arrive as props because this is a
 * client island: importing them would ship both languages to the browser.
 */
export function HeroEstimate({
  billLabel,
  submitLabel,
  note,
}: {
  billLabel: string;
  submitLabel: string;
  note: string;
}) {
  const { bill, setBill } = useHomeEstimate();
  const billId = useId();

  const submit = (event: FormEvent) => {
    event.preventDefault();
    // A plain hash jump rather than scrollIntoView, so Lenis applies the header offset the same
    // way it does for every other in-page link (ui-kit README § Motion islands).
    window.location.hash = "calculator";
  };

  return (
    <form onSubmit={submit} className="mt-7 max-w-[520px]">
      <label htmlFor={billId} className="block text-small font-medium text-white/85">
        {billLabel}
      </label>

      <div className="mt-1.5 flex flex-wrap items-center gap-2.5">
        <div className="relative min-w-[9rem] flex-1">
          <span
            aria-hidden="true"
            className="absolute inset-y-0 left-4 grid place-items-center text-ui text-white/70"
          >
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
            className="min-h-[54px] w-full rounded-full border border-white/25 bg-white/10 pr-4 pl-8 text-ui text-white backdrop-blur-sm placeholder:text-white/55 focus-visible:border-white focus-visible:outline-none"
          />
        </div>

        <button
          type="submit"
          className="group inline-flex min-h-[54px] shrink-0 items-center gap-3 rounded-full bg-white py-1.5 pr-1.5 pl-6 text-ui font-semibold text-carbon transition-colors duration-200 ease-controlled hover:bg-canvas"
        >
          {submitLabel}
          <span
            aria-hidden="true"
            className="grid size-10 shrink-0 place-items-center rounded-full bg-green-700 text-white transition-transform duration-200 ease-controlled group-hover:translate-x-0.5"
          >
            <ArrowRightIcon className="size-4" />
          </span>
        </button>
      </div>

      <p className="mt-2.5 text-small text-white/80">{note}</p>
    </form>
  );
}

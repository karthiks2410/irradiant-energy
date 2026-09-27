"use client";

import { useId, type FormEvent } from "react";
import { ArrowRightIcon } from "@/components/ui";
import { useHomeEstimate } from "./HomeEstimateProvider";
import { QUOTE_SECTION_ID } from "./quote-section";

/**
 * One field and a button, in the hero: the monthly bill.
 *
 * It does not compute here. "See my estimate" takes the visitor to the quote form further down
 * the page (components/home/HomeQuote.tsx) — the same short form as the header's popup — with the
 * range their bill falls in already chosen for the property type selected there, and the cursor
 * in Name. The figures show as soon as that form is sent.
 *
 * History: this used to seed a calculator band that showed every figure with no details asked.
 * The owner moved the home page to the popup's order on 2026-09-27 (the figures come after a name
 * and a WhatsApp number), so the note under this field, "No phone number, no sign-up.", was
 * removed with it: the next step asks for a phone number, and the note would have said otherwise.
 * The ungated calculator stays on /get-quote.
 *
 * PROPOSED CONTENT — REQUIRES CLIENT APPROVAL: every string it renders is new UX copy (see
 * `ui.home` in src/content/ui.ts). None of it states a fact about the business. The strings
 * arrive as props because this is a client island: importing them would ship both languages to
 * the browser.
 */
export function HeroEstimate({ billLabel, submitLabel }: { billLabel: string; submitLabel: string }) {
  const { bill, setBill, requestEstimate } = useHomeEstimate();
  const billId = useId();

  const submit = (event: FormEvent) => {
    event.preventDefault();
    requestEstimate();
    // A plain hash jump, like every other in-page link: the page's scroll-padding keeps the section
    // clear of the fixed header. A second press finds the hash already set, which jumps nowhere,
    // so that one scrolls the section into view itself (the same padding applies).
    if (window.location.hash === `#${QUOTE_SECTION_ID}`) {
      document.getElementById(QUOTE_SECTION_ID)?.scrollIntoView({ block: "start" });
    } else {
      window.location.hash = QUOTE_SECTION_ID;
    }
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
    </form>
  );
}

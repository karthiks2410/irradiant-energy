"use client";

import { Link } from "@/components/i18n/LocaleLink";
import { useEffect, useId, useRef } from "react";
import { RichText } from "@/components/i18n/RichText";
import { acceptButton, inlineLink, rejectButton } from "@/components/consent/styles";
import type { Ui } from "@/content/ui";
import { CONSENT_COOKIE_DAYS, CONSENT_COOKIE_NAME, REJECT_ALL, type ConsentChoice } from "@/lib/consent";

/**
 * Per-category preferences, and the re-open point behind "Cookie settings" in the footer.
 *
 * Built on the native <dialog> with showModal(), like MobileMenu: focus containment, Esc to close
 * and an inert page behind it come from the platform, and the browser returns focus to whatever
 * opened it. A *modal* focus trap is correct here — unlike the banner, this is something the
 * visitor deliberately opened, and it is a few tab stops deep.
 *
 * Fully controlled: the draft answer lives in ConsentManager, so opening the dialog always shows
 * what is stored and closing it without saving changes nothing.
 *
 * What each category says has to match what the site actually does. The Analytics copy names
 * Google Analytics and says "may", so it is true both in a build without a measurement ID (nothing
 * loads) and in one with it (src/lib/gtag.ts describes the configuration it promises). If a second
 * optional category is ever added, add it here, to ConsentChoice, and bump CONSENT_VERSION so
 * everyone is asked again.
 */

type ConsentSettingsProps = {
  /** `ui.consent.settings`, handed down by <ConsentManager> from the page's own locale. */
  copy: Ui["consent"]["settings"];
  open: boolean;
  value: ConsentChoice;
  onChange: (choice: ConsentChoice) => void;
  onSave: () => void;
  onRejectAll: () => void;
  /** Called when the dialog closes without saving (Esc, the close button). */
  onClose: () => void;
};

export function ConsentSettings({ copy, open, value, onChange, onSave, onRejectAll, onClose }: ConsentSettingsProps) {
  const dialog = useRef<HTMLDialogElement>(null);
  const analyticsId = useId();
  const analyticsHintId = `${analyticsId}-hint`;

  // Open and close follow the `open` prop; the platform owns everything else about the dialog.
  useEffect(() => {
    const element = dialog.current;
    if (!element) return;
    if (open && !element.open) element.showModal();
    if (!open && element.open) element.close();
  }, [open]);

  const close = () => dialog.current?.close();

  return (
    <dialog
      ref={dialog}
      onClose={onClose}
      aria-labelledby="consent-settings-title"
      data-lenis-prevent
      className="m-auto max-h-[min(44rem,calc(100dvh-2rem))] w-[min(36rem,calc(100vw-2rem))] overflow-y-auto rounded-lg bg-white p-0 text-carbon shadow-overlay sheet"
    >
      <div className="flex items-start justify-between gap-4 border-b border-mist p-5 sm:p-6">
        <h2 id="consent-settings-title" className="font-display text-h3 font-bold text-carbon">
          {copy.title}
        </h2>
        <button
          type="button"
          onClick={close}
          className="inline-grid size-11 shrink-0 place-items-center rounded-full border border-mist text-teal-900 transition-colors hover:bg-canvas"
        >
          <span className="sr-only">{copy.closeAria}</span>
          <svg viewBox="0 0 24 24" aria-hidden="true" className="size-5" fill="none" stroke="currentColor" strokeWidth="1.75">
            <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      <div className="p-5 sm:p-6">
        <div className="space-y-4">
          {/* Strictly necessary is not a choice, so it is not a control. A disabled checkbox would
              look like a choice that had been taken away. */}
          <section className="rounded-md border border-mist bg-canvas p-4 sm:p-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="font-display text-h4 font-semibold text-carbon">{copy.necessary.heading}</h3>
              <span className="rounded-full bg-soft-green px-3 py-1 font-label text-label text-green-700 uppercase">
                {copy.necessary.badge}
              </span>
            </div>
            <p className="mt-3 text-small text-ink-2">
              {/* The cookie's name and its lifetime are facts, so they stay here and drop into the
                  sentence through the template rather than being retyped in the content. */}
              <RichText
                text={copy.necessary.body}
                values={{ cookieName: CONSENT_COOKIE_NAME, days: CONSENT_COOKIE_DAYS }}
                slots={{ code: (inner) => <code className="font-mono text-ink-2">{inner}</code> }}
              />
            </p>
            <p className="mt-2 text-small text-ink-2">{copy.necessary.security}</p>
          </section>

          <section className="rounded-md border border-mist p-4 sm:p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h3 className="font-display text-h4 font-semibold text-carbon">{copy.analytics.heading}</h3>
              {/* The visible label IS the accessible name ("Allow analytics"), and the whole row is
                  the hit target, so it clears 44px comfortably. */}
              <label
                htmlFor={analyticsId}
                className="inline-flex min-h-11 cursor-pointer items-center gap-3 text-small font-medium text-ink-2"
              >
                <input
                  id={analyticsId}
                  type="checkbox"
                  checked={value.analytics}
                  aria-describedby={analyticsHintId}
                  onChange={(event) => onChange({ ...value, analytics: event.target.checked })}
                  className="size-5 shrink-0 accent-green-700"
                />
                <span>{copy.analytics.label}</span>
              </label>
            </div>
            <p id={analyticsHintId} className="mt-3 text-small text-ink-2">
              {copy.analytics.hint}
            </p>
          </section>
        </div>

        {/* Same rule as the banner: saving and refusing are the same control in two hues. */}
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <button type="button" onClick={onSave} className={acceptButton}>
            {copy.save}
          </button>
          <button
            type="button"
            onClick={() => {
              onChange(REJECT_ALL);
              onRejectAll();
            }}
            className={rejectButton}
          >
            {copy.rejectAll}
          </button>
        </div>

        <p className="mt-4 text-small text-grey-600">
          <RichText
            text={copy.moreDetail}
            slots={{
              cookieLink: (inner) => (
                <Link href="/cookies" className={inlineLink} onClick={close}>
                  {inner}
                </Link>
              ),
              privacyLink: (inner) => (
                <Link href="/privacy" className={inlineLink} onClick={close}>
                  {inner}
                </Link>
              ),
            }}
          />
        </p>
      </div>
    </dialog>
  );
}

/**
 * The two emails have two readers, and the guard here is that they stay two emails.
 *
 * The customer acknowledgement follows the language the form was filled in — a Kannada page, a
 * Kannada form, a Kannada email — and the internal alert stays English for the sales team, with
 * one row saying which language the enquiry arrived in (architecture.md §6.12).
 *
 * The form itself is never submitted to get here: `renderCustomerQuotation` is a pure
 * function of its context, so both languages can be rendered and read without sending anything.
 */

import { describe, expect, it } from "vitest";
import { LOCALES } from "@/i18n/config";
import { getContent } from "@/i18n/content";
import { customerWhatsappHref, renderCustomerQuotation, renderLeadAlert } from "./emails";
import type { Lead } from "./schema";

const KANNADA = /[ಀ-೿]/;

const lead: Lead = {
  name: "Ramesh Gowda",
  phone: "+919845000000",
  email: "ramesh@example.com",
  segment: "home",
  pincode: "560001",
  monthlyBill: 3_500,
  roofAreaSqft: undefined,
  message: undefined,
  consent: true,
  whatsappOptIn: true,
  website: undefined,
  startedAt: 1_700_000_000_000,
};

const context = (locale: (typeof LOCALES)[number]) => ({
  lead,
  reference: "IE-7K3QX2",
  estimate: null,
  submittedAt: new Date("2026-09-23T10:30:00+05:30"),
  locale,
});

describe("the customer acknowledgement", () => {
  it("is written in the language the form was filled in", () => {
    const english = renderCustomerQuotation(context("en"));
    expect(english.html).toContain('<html lang="en">');
    expect(english.subject).toBe("We have your solar enquiry (IE-7K3QX2)");
    expect(english.text).toContain("Thanks, Ramesh. We have your enquiry.");
    expect(english.html).not.toMatch(KANNADA);

    const kannada = renderCustomerQuotation(context("kn"));
    expect(kannada.html).toContain('<html lang="kn">');
    expect(kannada.subject).toMatch(KANNADA);
    expect(kannada.subject).toContain("IE-7K3QX2");
    // Every sentence, not just the subject: the heading, the row labels and the disclaimer all
    // come from the overlay, in both the HTML and the plain-text part.
    const copy = getContent("kn").quote.email;
    for (const line of [copy.disclaimer, copy.rowReference, copy.rowMonthlyBill]) {
      expect(kannada.text, JSON.stringify(line)).toContain(line);
    }
    expect(kannada.html).toContain(copy.talkNow);
    expect(kannada.html).toContain(copy.whatsappButton);
  });

  it("leaves no template hole unfilled, in either language", () => {
    for (const locale of LOCALES) {
      const { subject, html, text } = renderCustomerQuotation(context(locale));
      for (const part of [subject, html, text]) {
        expect(part, `${locale}: an unfilled {placeholder}`).not.toMatch(/\{[a-zA-Z]+\}/);
      }
    }
  });

  it("keeps the reference, and only the reference, in the WhatsApp prefill", () => {
    for (const locale of LOCALES) {
      const href = customerWhatsappHref("IE-7K3QX2", locale);
      const prefill = decodeURIComponent(new URL(href).searchParams.get("text") ?? "");
      expect(prefill).toContain("IE-7K3QX2");
      expect(prefill).not.toContain(lead.name);
      expect(prefill).not.toContain(lead.phone);
      expect(prefill).not.toContain(lead.email);
      if (locale === "kn") expect(prefill).toMatch(KANNADA);
    }
  });
});

describe("the internal sales alert", () => {
  it("stays English whichever language the enquiry came in", () => {
    for (const locale of LOCALES) {
      const alert = renderLeadAlert(context(locale));
      expect(alert.subject).toBe("New solar enquiry IE-7K3QX2 · Home");
      expect(alert.html).toContain('<html lang="en">');
      // The one Kannada run it may contain is the endonym in the Language row, and nothing else.
      expect(alert.text.replaceAll("ಕನ್ನಡ", "")).not.toMatch(KANNADA);
    }
  });

  it("says which language the enquiry arrived in", () => {
    expect(renderLeadAlert(context("en")).text).toContain("Language: English");
    expect(renderLeadAlert(context("kn")).text).toContain("Language: Kannada (ಕನ್ನಡ)");
  });
});

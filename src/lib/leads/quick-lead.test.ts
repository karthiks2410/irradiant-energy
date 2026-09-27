import { describe, expect, it } from "vitest";
import { renderCustomerQuotation, renderLeadAlert, renderQuickEmailNote, type EmailLead } from "./emails";
import { findBucket, labelFor, quickEstimate } from "./quick";
import { parseQuickLead, quickEmailSchema } from "./schema";

const NOW = 1_800_000_000_000;

function form(overrides: Record<string, string | undefined> = {}): FormData {
  const values: Record<string, string | undefined> = {
    name: "Asha Rao",
    phone: "98450 12345",
    segment: "home",
    pincode: "560001",
    billBucket: "home-3",
    consent: "on",
    website: "",
    startedAt: String(NOW - 10_000),
    ...overrides,
  };
  const data = new FormData();
  for (const [key, value] of Object.entries(values)) if (value !== undefined) data.set(key, value);
  return data;
}

describe("parseQuickLead", () => {
  it("accepts a complete popup submission without an email", () => {
    const result = parseQuickLead(form(), NOW);
    expect(result.kind).toBe("ok");
    if (result.kind === "ok") {
      expect(result.lead.phone).toBe("+919845012345");
      expect(result.lead.billBucket).toBe("home-3");
    }
  });

  it("rejects a bill range that belongs to another property type", () => {
    const result = parseQuickLead(form({ segment: "home", billBucket: "business-2" }), NOW);
    expect(result.kind).toBe("invalid");
    if (result.kind === "invalid") expect(result.fieldErrors.billBucket).toBeDefined();
  });

  it("requires the consent tick", () => {
    const result = parseQuickLead(form({ consent: undefined }), NOW);
    expect(result.kind).toBe("invalid");
    if (result.kind === "invalid") expect(result.fieldErrors.consent).toBeDefined();
  });

  it("requires a PIN code and a bill range", () => {
    const result = parseQuickLead(form({ pincode: "", billBucket: undefined }), NOW);
    expect(result.kind).toBe("invalid");
    if (result.kind === "invalid") {
      expect(result.fieldErrors.pincode).toBeDefined();
      expect(result.fieldErrors.billBucket).toBeDefined();
    }
  });

  it("treats a filled honeypot as spam and an instant submit as a bot", () => {
    expect(parseQuickLead(form({ website: "http://spam" }), NOW).kind).toBe("spam");
    expect(parseQuickLead(form({ startedAt: String(NOW - 500) }), NOW).kind).toBe("too-fast");
  });
});

describe("quickEmailSchema", () => {
  const base = { reference: "IE-7K3QX2", name: "Asha Rao", segment: "home", pincode: "560001", billBucket: "home-3" };

  it("accepts a valid request", () => {
    expect(quickEmailSchema.safeParse({ ...base, email: "asha@example.com" }).success).toBe(true);
  });

  it("rejects a bad email or a forged reference", () => {
    expect(quickEmailSchema.safeParse({ ...base, email: "not-an-email" }).success).toBe(false);
    expect(quickEmailSchema.safeParse({ ...base, email: "asha@example.com", reference: "anything" }).success).toBe(false);
  });
});

describe("emails for a popup lead", () => {
  const bucket = findBucket("home", "home-3")!;
  const estimate = quickEstimate("home", bucket);
  const lead: EmailLead = {
    name: "Asha Rao",
    phone: "+919845012345",
    segment: "home",
    pincode: "560001",
    consent: true,
    whatsappOptIn: true,
    website: undefined,
    startedAt: NOW,
  };
  const context = {
    lead,
    reference: "IE-7K3QX2",
    estimate: estimate.representative,
    submittedAt: new Date(NOW),
    locale: "en" as const,
    source: "quick quote popup" as const,
    billRange: { label: labelFor("home", "home-3")!, representativeBillInr: estimate.representativeBillInr, openEnded: false },
  };

  it("tells sales there is no email and shows the range, not a made-up bill", () => {
    const alert = renderLeadAlert(context);
    expect(alert.text).toContain("not given — follow up by phone or WhatsApp");
    expect(alert.text).toContain("Monthly bill: ₹2,500–4,000");
    expect(alert.text).toContain("the middle of the ₹2,500–4,000 range");
    expect(alert.text).toContain("on the quick quote popup");
    expect(alert.text).not.toContain("Replying to this email goes to the customer");
  });

  it("gives the customer the same range note and the right reason in the footer", () => {
    const email = renderCustomerQuotation({ ...context, lead: { ...lead, email: "asha@example.com" } });
    expect(email.text).toContain("Monthly bill: ₹2,500–4,000");
    expect(email.text).toContain("the middle of the ₹2,500–4,000 range");
    expect(email.text).toContain("asked us to email your estimate");
  });

  it("names the home page form, and treats it exactly like the popup otherwise", () => {
    const home = { ...context, source: "home page form" as const };
    const alert = renderLeadAlert(home);
    expect(alert.text).toContain("Form: Quote form on the home page");
    expect(alert.text).toContain("on the home page form");
    expect(alert.text).not.toContain("quick quote popup");
    // Same lead, same range note, same "no email yet" line.
    expect(alert.text).toContain("not given — follow up by phone or WhatsApp");
    expect(alert.text).toContain("the middle of the ₹2,500–4,000 range");
    // A home page form lead is always a quote: a stray site-visit flag does not rename the form.
    expect(renderLeadAlert({ ...home, request: "site-visit" }).text).toContain("Form: Quote form on the home page");
    // The customer's breakdown gives the popup's reason in its footer: they asked for it by email.
    const email = renderCustomerQuotation({ ...home, lead: { ...lead, email: "asha@example.com" } });
    expect(email.text).toContain("asked us to email your estimate");
    expect(email.text).not.toContain("submitted the estimate form");
  });

  it("names the form in the note that carries the address", () => {
    expect(renderQuickEmailNote("IE-7K3QX2", "Asha Rao", "asha@example.com").text).toContain(
      "Sent automatically by the quick quote popup",
    );
    const note = renderQuickEmailNote("IE-7K3QX2", "Asha Rao", "asha@example.com", "home page form");
    expect(note.text).toContain("Sent automatically by the home page form");
    expect(note.html).toContain("Sent automatically by the home page form");
  });

  it("calls the open top bucket's figures a minimum", () => {
    const top = findBucket("home", "home-5")!;
    const alert = renderLeadAlert({
      ...context,
      estimate: quickEstimate("home", top).representative,
      billRange: { label: labelFor("home", "home-5")!, representativeBillInr: 8_000, openEnded: true },
    });
    expect(alert.text).toContain("treat these figures as a minimum");
  });
});

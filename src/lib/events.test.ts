import { describe, expect, it } from "vitest";
import {
  classifyLink,
  contentGroupOf,
  describeLinkClick,
  EVENT_NAMES,
  languageOf,
  linkLocation,
  pageTypeOf,
  scrubParams,
} from "./events";

/**
 * The rules that decide what an analytics event may carry. Being wrong here is a privacy failure,
 * so the cases are the ones where a caller hands in something it should not.
 */

/** What a person could type into our forms, in the shapes it would take. */
const PERSONAL = ["Asha Rao", "9845012345", "+91 98450 12345", "+919845012345", "asha@example.com", "560001", "3500", "₹3,500"];

describe("scrubParams", () => {
  it("keeps an event's own parameters with allowed values", () => {
    expect(
      scrubParams("generate_lead", { form: "popup", property_type: "home", bill_band: "home-3", site_language: "kn" }),
    ).toEqual({ form: "popup", property_type: "home", bill_band: "home-3", site_language: "kn" });
    expect(scrubParams("click_social", { network: "linkedin" })).toEqual({ network: "linkedin" });
    expect(scrubParams("use_calculator", { property_type: "commercial", bill_band: "unknown", site_language: "en" })).toEqual({
      property_type: "commercial",
      bill_band: "unknown",
      site_language: "en",
    });
  });

  it("drops keys the event does not declare, whatever they hold", () => {
    expect(
      scrubParams("click_call", { location: "header", site_language: "en", language: "en", name: "Asha Rao", phone: "9845012345", email: "a@b.in" }),
    ).toEqual({ location: "header", site_language: "en" });
  });

  it("drops a declared parameter whose value is not on its list", () => {
    for (const value of PERSONAL) {
      const clean = scrubParams("generate_lead", { form: "popup", property_type: value, bill_band: value, site_language: value });
      expect(clean, value).toEqual({ form: "popup" });
    }
    // A number is not a label, even a harmless-looking one.
    expect(scrubParams("generate_lead", { form: "calculator", bill_band: 3500 as unknown as string })).toEqual({ form: "calculator" });
  });

  it("never lets a name, phone number, email address or PIN code through any event", () => {
    for (const name of EVENT_NAMES) {
      const hostile: Record<string, string> = {};
      for (const key of ["form", "property_type", "bill_band", "site_language", "language", "location", "intent", "button", "from", "to", "network", "name", "phone", "email", "pincode", "pin", "message"]) {
        hostile[key] = PERSONAL[Math.abs(key.length) % PERSONAL.length];
      }
      const clean = scrubParams(name, hostile) ?? {};
      const sent = JSON.stringify(clean);
      for (const value of PERSONAL) expect(sent, `${name} leaked ${value}`).not.toContain(value);
    }
  });

  it("refuses an event that is not ours", () => {
    expect(scrubParams("page_view", {})).toBeNull();
    expect(scrubParams("purchase", { value: "1" })).toBeNull();
    expect(scrubParams("__proto__", {})).toBeNull();
  });
});

describe("classifyLink", () => {
  it("counts calls, email and every WhatsApp link shape", () => {
    expect(classifyLink("tel:+919845794343")).toEqual({ event: "click_call" });
    expect(classifyLink("TEL:+919845794343")).toEqual({ event: "click_call" });
    expect(classifyLink("mailto:info@irradiantenergy.in")).toEqual({ event: "click_email" });
    expect(classifyLink("https://wa.me/919845794343?text=Hi%20there")).toEqual({ event: "click_whatsapp" });
    expect(classifyLink("https://api.whatsapp.com/send?phone=919845794343")).toEqual({ event: "click_whatsapp" });
    expect(classifyLink("whatsapp://send?phone=919845794343")).toEqual({ event: "click_whatsapp" });
  });

  it("names the social network from the host alone", () => {
    expect(classifyLink("https://www.linkedin.com/company/irradiant-energy")).toEqual({ event: "click_social", network: "linkedin" });
    expect(classifyLink("https://www.instagram.com/irradiantenergy/")).toEqual({ event: "click_social", network: "instagram" });
    expect(classifyLink("https://m.facebook.com/irradiantenergy")).toEqual({ event: "click_social", network: "facebook" });
    expect(classifyLink("https://twitter.com/irradiant")).toEqual({ event: "click_social", network: "x" });
    expect(classifyLink("https://x.com/irradiant")).toEqual({ event: "click_social", network: "x" });
  });

  it("ignores everything else", () => {
    for (const href of ["/en/contact", "#faq", "https://www.irradiantenergy.in/en", "https://mnre.gov.in/", "javascript:void(0)", "", "not a url"]) {
      expect(classifyLink(href), href).toBeNull();
    }
    // A look-alike host is not WhatsApp.
    expect(classifyLink("https://wa.me.example.com/91984")).toBeNull();
  });
});

describe("describeLinkClick", () => {
  it("reports the marked location and the page language, never the number or the prefill", () => {
    const call = describeLinkClick({ href: "tel:+919845794343", marked: "header", pathname: "/kn/about" });
    expect(call).toEqual({ name: "click_call", params: { location: "header", site_language: "kn" } });

    const chat = describeLinkClick({ href: "https://wa.me/919845794343?text=IE-7K3QX2", marked: "result", pathname: "/en" });
    expect(chat).toEqual({ name: "click_whatsapp", params: { location: "result", site_language: "en" } });
    expect(JSON.stringify(chat)).not.toMatch(/9845794343|IE-7K3QX2/);
  });

  it("falls back to the page's own location when nothing is marked", () => {
    expect(describeLinkClick({ href: "mailto:info@irradiantenergy.in", pathname: "/en/contact" })).toEqual({
      name: "click_email",
      params: { location: "contact", site_language: "en" },
    });
    expect(describeLinkClick({ href: "tel:+91", marked: "somewhere-else", pathname: "/en/get-quote" })).toEqual({
      name: "click_call",
      params: { location: "page", site_language: "en" },
    });
  });

  it("counts a social profile by network only", () => {
    expect(describeLinkClick({ href: "https://www.instagram.com/x", marked: "footer", pathname: "/en" })).toEqual({
      name: "click_social",
      params: { network: "instagram" },
    });
  });

  it("counts the language switch as from → to, and only a real change", () => {
    expect(describeLinkClick({ href: "/kn/about", pathname: "/en/about", switchTo: "kn" })).toEqual({
      name: "switch_language",
      params: { from: "en", to: "kn" },
    });
    expect(describeLinkClick({ href: "/en", pathname: "/kn", switchTo: "en" })).toEqual({
      name: "switch_language",
      params: { from: "kn", to: "en" },
    });
    expect(describeLinkClick({ href: "/kn", pathname: "/en", switchTo: "kn-IN" })).toEqual({
      name: "switch_language",
      params: { from: "en", to: "kn" },
    });
    expect(describeLinkClick({ href: "/en", pathname: "/en", switchTo: "en" })).toBeNull();
    expect(describeLinkClick({ href: "/fr", pathname: "/en", switchTo: "fr" })).toBeNull();
  });

  it("ignores ordinary links", () => {
    expect(describeLinkClick({ href: "/en/solutions", marked: "footer", pathname: "/en" })).toBeNull();
  });
});

describe("linkLocation", () => {
  it("accepts only the known labels", () => {
    expect(linkLocation("bubble", "home")).toBe("bubble");
    expect(linkLocation("popup", "other")).toBe("popup");
    expect(linkLocation("<script>", "home")).toBe("page");
    expect(linkLocation(null, "contact")).toBe("contact");
  });
});

describe("trackContext", () => {
  it("is the page's type and language group, from the path alone", async () => {
    const { trackContext } = await import("./events");
    expect(trackContext("/kn/get-quote")).toEqual({ page_type: "calculator", content_group: "Kannada" });
    expect(trackContext("/en")).toEqual({ page_type: "home", content_group: "English" });
  });
});

describe("pages", () => {
  it("groups by language", () => {
    expect(languageOf("/kn/solutions")).toBe("kn");
    expect(languageOf("/kn")).toBe("kn");
    expect(languageOf("/en/about")).toBe("en");
    expect(languageOf("/knowledge")).toBe("en");
    expect(contentGroupOf("/kn/get-quote")).toBe("Kannada");
    expect(contentGroupOf("/en/get-quote")).toBe("English");
  });

  it("names each kind of page", () => {
    expect(pageTypeOf("/en")).toBe("home");
    expect(pageTypeOf("/kn/")).toBe("home");
    expect(pageTypeOf("/en/solutions")).toBe("solutions");
    expect(pageTypeOf("/en/solutions/solar/home")).toBe("segment");
    expect(pageTypeOf("/kn/solutions/solar/housing-society")).toBe("segment");
    expect(pageTypeOf("/en/get-quote")).toBe("calculator");
    expect(pageTypeOf("/en/about")).toBe("about");
    expect(pageTypeOf("/kn/contact")).toBe("contact");
    expect(pageTypeOf("/en/privacy")).toBe("legal");
    expect(pageTypeOf("/en/terms")).toBe("legal");
    expect(pageTypeOf("/kn/cookies")).toBe("legal");
    expect(pageTypeOf("/en/nowhere")).toBe("other");
  });
});

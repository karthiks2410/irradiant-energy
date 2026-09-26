import { describe, expect, it } from "vitest";
import { cleanSourceValue, looksPersonal, parseLeadSource, summariseLeadSource, utmFromSearch } from "./source";

/**
 * The lead source arrives from the visitor's browser, so the server reads it as hostile: only the
 * allow-listed keys, short values, nothing that could be a person's email, number or PIN code.
 */

const post = (value: unknown) => parseLeadSource(JSON.stringify(value));

describe("parseLeadSource", () => {
  it("keeps the allow-listed keys", () => {
    expect(
      post({
        page: "/en/get-quote",
        landing: "/kn/solutions/solar/home",
        referrer: "l.instagram.com",
        utm_source: "instagram",
        utm_medium: "social",
        utm_campaign: "bio_link",
        utm_content: "profile",
        utm_term: "rooftop solar",
      }),
    ).toEqual({
      page: "/en/get-quote",
      landing: "/kn/solutions/solar/home",
      referrer: "l.instagram.com",
      utm_source: "instagram",
      utm_medium: "social",
      utm_campaign: "bio_link",
      utm_content: "profile",
      utm_term: "rooftop solar",
    });
  });

  it("drops unknown keys and non-string values", () => {
    expect(post({ page: "/en", name: "Asha", phone: "9845012345", utm_source: 7, utm_medium: ["x"], __proto__: { x: 1 } })).toEqual({
      page: "/en",
    });
  });

  it("drops a value that looks like an email address, a phone number or a PIN code", () => {
    expect(
      post({
        utm_source: "asha@example.com",
        utm_medium: "+91 98450 12345",
        utm_campaign: "call-9845012345",
        utm_content: "560001",
        utm_term: "asha at example",
        page: "/en/9845012345",
      }),
    ).toEqual({ utm_term: "asha at example" });
  });

  it("keeps paths to paths and hosts to hosts", () => {
    expect(post({ page: "/en/get-quote?name=Asha&phone=9845012345#form", landing: "https://evil.example/x", referrer: "Google.COM" })).toEqual({
      page: "/en/get-quote",
      referrer: "google.com",
    });
    expect(post({ page: "/en/<script>", referrer: "not a host" })).toEqual({});
  });

  it("cuts long values and strips control characters and angle brackets", () => {
    const parsed = post({ utm_campaign: "a".repeat(500), utm_source: "news\u0000<b>letter</b>" });
    expect(parsed.utm_campaign).toHaveLength(100);
    expect(parsed.utm_source).toBe("news b letter /b");
  });

  it("treats anything malformed as no source at all, without throwing", () => {
    for (const raw of [undefined, null, 7, "", "not json", "[1,2]", "null", '"a string"', "x".repeat(5_000)]) {
      expect(parseLeadSource(raw), String(raw).slice(0, 20)).toEqual({});
    }
  });
});

describe("looksPersonal", () => {
  it("flags email-, phone- and PIN-like values and leaves campaign names alone", () => {
    for (const value of ["a@b.in", "x@y", "9845012345", "+91 98450-12345", "(080) 2345 6789", "560001", "tag560001"]) {
      expect(looksPersonal(value), value).toBe(true);
    }
    for (const value of ["instagram", "diwali-2026-10-15", "q4_2026", "bio link", "whatsapp_status"]) {
      expect(looksPersonal(value), value).toBe(false);
    }
  });
});

describe("cleanSourceValue", () => {
  it("rejects empty and whitespace", () => {
    expect(cleanSourceValue("utm_source", "   ")).toBeUndefined();
    expect(cleanSourceValue("utm_source", "  whatsapp  ")).toBe("whatsapp");
  });
});

describe("utmFromSearch", () => {
  it("reads only the five campaign tags", () => {
    expect(utmFromSearch("?utm_source=whatsapp&utm_medium=social&utm_campaign=status&name=Asha&phone=9845012345&utm_id=7")).toEqual({
      utm_source: "whatsapp",
      utm_medium: "social",
      utm_campaign: "status",
    });
    expect(utmFromSearch("")).toEqual({});
  });
});

describe("summariseLeadSource", () => {
  it("prefers campaign tags, then the referring site, then says it does not know", () => {
    expect(summariseLeadSource({ utm_source: "instagram", utm_medium: "social", utm_campaign: "bio", referrer: "l.instagram.com" })).toEqual({
      source: "instagram",
      medium: "social",
      campaign: "bio",
    });
    expect(summariseLeadSource({ utm_campaign: "flyer" })).toEqual({ source: "(not set)", medium: "(not set)", campaign: "flyer" });
    expect(summariseLeadSource({ referrer: "google.com" })).toEqual({ source: "google.com", medium: "referral", campaign: "" });
    expect(summariseLeadSource({ page: "/en" })).toEqual({ source: "direct or unknown", medium: "", campaign: "" });
  });
});

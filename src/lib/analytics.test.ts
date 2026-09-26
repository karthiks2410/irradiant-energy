import { afterEach, describe, expect, it, vi } from "vitest";

/**
 * Which builds may load Google Analytics and emit the Search Console tag. The failure that matters
 * is a Preview or local build sending data to the live GA property, or a malformed ID being used.
 */

async function load(env: Record<string, string>) {
  vi.resetModules();
  for (const [name, value] of Object.entries(env)) vi.stubEnv(name, value);
  return import("@/lib/analytics");
}

afterEach(() => vi.unstubAllEnvs());

describe("Google Analytics measurement ID", () => {
  it("is used in Production", async () => {
    const { gaMeasurementId, analyticsEnabled } = await load({
      NEXT_PUBLIC_VERCEL_ENV: "production",
      NEXT_PUBLIC_GA_MEASUREMENT_ID: " g-abc123xyz ",
    });
    expect(gaMeasurementId).toBe("G-ABC123XYZ");
    expect(analyticsEnabled).toBe(true);
  });

  it("is ignored on Preview and locally unless the explicit flag is set", async () => {
    expect((await load({ NEXT_PUBLIC_VERCEL_ENV: "preview", NEXT_PUBLIC_GA_MEASUREMENT_ID: "G-ABC123" })).gaMeasurementId).toBeNull();
    expect((await load({ NEXT_PUBLIC_VERCEL_ENV: "", NEXT_PUBLIC_GA_MEASUREMENT_ID: "G-ABC123" })).analyticsEnabled).toBe(false);
    const flagged = await load({
      NEXT_PUBLIC_VERCEL_ENV: "",
      NEXT_PUBLIC_GA_MEASUREMENT_ID: "G-ABC123",
      NEXT_PUBLIC_GA_ALLOW_NON_PRODUCTION: "1",
    });
    expect(flagged.gaMeasurementId).toBe("G-ABC123");
  });

  it("rejects anything that is not a GA4 web stream ID", async () => {
    for (const id of ["", "UA-12345-1", "GTM-ABC123", "G-", "G-abc<script>"]) {
      const { gaMeasurementId } = await load({ NEXT_PUBLIC_VERCEL_ENV: "production", NEXT_PUBLIC_GA_MEASUREMENT_ID: id });
      expect(gaMeasurementId, id).toBeNull();
    }
  });
});

describe("Search Console verification token", () => {
  it("is null when unset and trimmed when set", async () => {
    expect((await load({ NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION: "" })).googleSiteVerification).toBeNull();
    expect((await load({ NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION: " abc-123_XYZ " })).googleSiteVerification).toBe("abc-123_XYZ");
  });
});

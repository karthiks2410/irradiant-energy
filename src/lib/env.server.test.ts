import { afterEach, describe, expect, it, vi } from "vitest";
import { CANONICAL_ORIGIN } from "@/lib/env";
import { assertProductionBuildEnv, productionBuildEnvProblems } from "@/lib/env.server";

/**
 * The Production build gate for the canonical origin. The failure it exists for: a Production
 * deployment that builds cleanly and ships robots.txt "Disallow: /" and noindex on every page
 * because NEXT_PUBLIC_SITE_URL is missing, or canonicals that point at a redirecting host because
 * it is wrong. Preview, CI and local builds must keep building without it.
 */

const PRODUCTION = { VERCEL_ENV: "production", NEXT_PUBLIC_VERCEL_ENV: "production" } as const;

function problemsWith(siteUrl: string | undefined) {
  return productionBuildEnvProblems({ ...PRODUCTION, NEXT_PUBLIC_SITE_URL: siteUrl });
}

describe("Production build gate: NEXT_PUBLIC_SITE_URL", () => {
  it("passes a Production build set to the canonical origin", () => {
    expect(CANONICAL_ORIGIN).toBe("https://www.irradiantenergy.in");
    expect(problemsWith(CANONICAL_ORIGIN)).toEqual([]);
    expect(() => assertProductionBuildEnv({ ...PRODUCTION, NEXT_PUBLIC_SITE_URL: CANONICAL_ORIGIN })).not.toThrow();
  });

  it("stops a Production build when it is missing or blank", () => {
    for (const value of [undefined, "", "   "]) {
      const problems = problemsWith(value);
      expect(problems, JSON.stringify(value)).toHaveLength(1);
      expect(problems[0]).toMatch(/NEXT_PUBLIC_SITE_URL is not set/);
      expect(problems[0]).toContain("Disallow: /");
      expect(problems[0]).toContain(`Set NEXT_PUBLIC_SITE_URL to ${CANONICAL_ORIGIN}`);
    }
  });

  it("stops a Production build on an http URL", () => {
    const [problem] = problemsWith("http://www.irradiantenergy.in");
    expect(problem).toMatch(/must be an https URL/);
  });

  it("stops a Production build on something that is not a URL", () => {
    for (const value of ["www.irradiantenergy.in", "irradiantenergy.in", "https//www.irradiantenergy.in"]) {
      expect(problemsWith(value)[0], value).toMatch(/which is not a URL/);
    }
  });

  it("stops a Production build on anything but a bare origin", () => {
    for (const value of [
      "https://www.irradiantenergy.in/",
      "https://www.irradiantenergy.in/en",
      "https://www.irradiantenergy.in?utm=x",
      "https://www.irradiantenergy.in#top",
      "https://www.irradiantenergy.in:443",
      "https://user@www.irradiantenergy.in",
      "https://WWW.irradiantenergy.in",
      " https://www.irradiantenergy.in",
      "https://www.irradiantenergy.in\n",
    ]) {
      expect(problemsWith(value)[0], JSON.stringify(value)).toMatch(/must be a bare origin/);
    }
  });

  it("stops a Production build on a host that redirects to the canonical one", () => {
    for (const value of ["https://irradiantenergy.in", "https://irradiant-energy.vercel.app"]) {
      const [problem] = problemsWith(value);
      expect(problem, value).toMatch(/but the canonical origin is https:\/\/www\.irradiantenergy\.in/);
    }
  });

  it("treats either Vercel variable as Production", () => {
    expect(productionBuildEnvProblems({ NEXT_PUBLIC_VERCEL_ENV: "production" })[0]).toMatch(/NEXT_PUBLIC_SITE_URL is not set/);
    expect(productionBuildEnvProblems({ VERCEL_ENV: "production", NEXT_PUBLIC_VERCEL_ENV: "production" })[0]).toMatch(
      /NEXT_PUBLIC_SITE_URL is not set/,
    );
  });

  it("stops a Production build whose public environment flag is not exposed, since the site reads that one", () => {
    const problems = productionBuildEnvProblems({ VERCEL_ENV: "production", NEXT_PUBLIC_SITE_URL: CANONICAL_ORIGIN });
    expect(problems).toHaveLength(1);
    expect(problems[0]).toMatch(/NEXT_PUBLIC_VERCEL_ENV is ""/);
    expect(problems[0]).toMatch(/Automatically expose System Environment Variables/);
  });

  it("leaves Preview, CI and local builds alone, with or without a value", () => {
    for (const env of [
      {},
      { VERCEL_ENV: "preview", NEXT_PUBLIC_VERCEL_ENV: "preview" },
      { VERCEL_ENV: "development", NEXT_PUBLIC_VERCEL_ENV: "development" },
      { VERCEL_ENV: "preview", NEXT_PUBLIC_VERCEL_ENV: "preview", NEXT_PUBLIC_SITE_URL: "http://localhost:3000" },
      { NEXT_PUBLIC_VERCEL_ENV: "", NEXT_PUBLIC_SITE_URL: "not a url" },
    ]) {
      expect(productionBuildEnvProblems(env), JSON.stringify(env)).toEqual([]);
      expect(() => assertProductionBuildEnv(env)).not.toThrow();
    }
  });

  it("throws one error listing every problem, so the build log alone says what to fix", () => {
    expect(() => assertProductionBuildEnv({ VERCEL_ENV: "production" })).toThrow(
      /^Production build stopped by src\/lib\/env\.server\.ts:\n {2}- VERCEL_ENV is "production" but NEXT_PUBLIC_VERCEL_ENV[^\n]*\n {2}- NEXT_PUBLIC_SITE_URL is not set/,
    );
  });
});

describe("next.config.ts runs the gate", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.resetModules();
  });

  async function loadConfig(env: Record<string, string>) {
    vi.resetModules();
    for (const [name, value] of Object.entries(env)) vi.stubEnv(name, value);
    return import("../../next.config");
  }

  it("refuses to load for a Production build without the site URL", async () => {
    await expect(loadConfig({ ...PRODUCTION, NEXT_PUBLIC_SITE_URL: "" })).rejects.toThrow(/NEXT_PUBLIC_SITE_URL is not set/);
  });

  it("loads for a Production build with it, and for a build outside Vercel", async () => {
    await expect(loadConfig({ ...PRODUCTION, NEXT_PUBLIC_SITE_URL: CANONICAL_ORIGIN })).resolves.toHaveProperty("default");
    await expect(loadConfig({ VERCEL_ENV: "", NEXT_PUBLIC_VERCEL_ENV: "", NEXT_PUBLIC_SITE_URL: "" })).resolves.toHaveProperty("default");
  });
});

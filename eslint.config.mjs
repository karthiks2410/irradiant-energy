import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Local QA scratch: gitignored, never shipped, and not worth linting.
    ".qa/**",
    // Planning record and research scratch (docs/kannada/tmp/**): kept out of git via
    // .git/info/exclude, never bundled, and full of throwaway CommonJS probe scripts. Linting it
    // measured the research, not the site.
    "docs/**",
    "test-results/**",
    "playwright-report/**",
  ]),
]);

export default eslintConfig;

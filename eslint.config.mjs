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
    ".next-preview/**",
    ".next-preview-*/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // The source-only legacy archive is retained for migration reference and
    // is not part of the v3 route tree or client bundle.
    "legacy/**",
    "components/ui/**",
  ]),
]);

export default eslintConfig;

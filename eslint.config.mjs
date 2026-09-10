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
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Legacy dashboard is retained on the legacy branch/deployment. v3 quality
    // gates apply to the new route groups and shared foundation only.
    "app/dashboard/**",
    "app/ui/**",
    "legacy/**",
    "components/ui/**",
    "components/theme-provider.tsx",
    "components/theme-toggle.tsx",
    "components/navbar.tsx",
    "components/markdown-renderer.tsx",
  ]),
]);

export default eslintConfig;

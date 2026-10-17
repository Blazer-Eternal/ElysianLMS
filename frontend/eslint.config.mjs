import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
  {
    rules: {
      // Avatars come from API-provided URLs of arbitrary shape; next/image
      // needs an allow-list we cannot know at build time.
      "@next/next/no-img-element": "off",
    },
  },
]);

export default eslintConfig;

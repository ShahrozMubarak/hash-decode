import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  globalIgnores([
    "dist/**",
    ".vinext/**",
    ".wrangler/**",
    ".sites-runtime/**",
    "outputs/**",
    "work/**",
  ]),
  {
    files: ["app/**/*.{tsx,jsx}", "components/studio/**/*.{tsx,jsx}"],
    rules: {
      // Each native document navigation receives a new Worker CSP nonce.
      "@next/next/no-html-link-for-pages": "off",
      // The Worker serves owner-supplied image URLs without a Next image proxy.
      "@next/next/no-img-element": "off"
    }
  }
]);
export default eslintConfig;

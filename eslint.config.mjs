import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    rules: {
      '@typescript-eslint/no-unused-vars': ['warn', {
        varsIgnorePattern: '^_',
        argsIgnorePattern: '^_',
        caughtErrorsIgnorePattern: '^_',
        destructuredArrayIgnorePattern: '^_',
      }],
    },
  },
  globalIgnores([
    // Next.js defaults
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Project-specific build output (distDir: 'dist')
    "dist/**",
    // Dependencies
    "node_modules/**",
    // Generated / tooling
    "*.config.js",
    "*.config.mjs",
    "public/sw.js",
    "public/_pagefind/**",
    "src/test/**",
    // Node CJS scripts (not transpiled)
    "scripts/**",
  ]),
]);

export default eslintConfig;

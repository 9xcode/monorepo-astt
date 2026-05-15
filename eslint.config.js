import svelte from "eslint-plugin-svelte";
import astro from "eslint-plugin-astro";
import ts from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";
import svelteParser from "svelte-eslint-parser";
import astroParser from "astro-eslint-parser";

export default [
  // JS/TS
  {
    files: ["**/*.{js,ts,svelte.js,svelte.ts}"],
    languageOptions: {
      parser: tsParser,
      ecmaVersion: "latest",
      sourceType: "module",
    },
    plugins: {
      "@typescript-eslint": ts
    },
    rules: {
      // "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-unused-vars": ["warn", { 
        "argsIgnorePattern": "^_",
        "varsIgnorePattern": "^_",
        "caughtErrorsIgnorePattern": "^_"
      }]
    }
  },
  // Astro
  ...astro.configs["flat/recommended"],
  // Svelte
  ...svelte.configs["flat/recommended"],
  {
    files: ["**/*.svelte"],
    languageOptions: {
      parser: svelteParser,
      parserOptions: {
        parser: tsParser,
        extraFileExtensions: [".svelte"]
      }
    }
  },
  {
    files: ["**/*.svelte.ts"],
    languageOptions: {
      parser: svelteParser,
      parserOptions: {
        parser: tsParser
      }
    }
  },
  {
    files: ["**/*.astro"],
    languageOptions: {
      parser: astroParser,
      parserOptions: {
        parser: tsParser,
        extraFileExtensions: [".astro"]
      }
    }
  },
  // Ignore
  {
    ignores: ["**/dist/**", "**/node_modules/**", "**/.astro/**", "**/.planning/**", "**/ios/**", "**/android/**"]
  }
];

import { config } from "@repo/eslint-config/react";

/** @type {import("eslint").Linter.Config} */
export default [
  ...config,
  {
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
      "react-refresh/only-export-components": "off",
      'react-hooks/incompatible-library': 'off',
    },
  },
];

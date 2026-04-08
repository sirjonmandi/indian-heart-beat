import globals from "globals";
import pluginJs from "@eslint/js";
import pluginReact from "eslint-plugin-react";
import pluginReactNative from "eslint-plugin-react-native";
import prettierConfig from "eslint-config-prettier";
import prettierPlugin from "eslint-plugin-prettier";

export default [
  {
    files: ["**/*.{js,mjs,cjs,jsx,ts,tsx}"],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      },
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    plugins: {
      react: pluginReact,
      "react-native": pluginReactNative,
      prettier: prettierPlugin,
    },
    rules: {
      ...pluginJs.configs.recommended.rules,
      ...pluginReact.configs.flat.recommended.rules,
      ...pluginReactNative.configs.recommended.rules,
      "prettier/prettier": "error", // Ensures Prettier integration
    },
  },
  prettierConfig, // Disables conflicting ESLint rules with Prettier
];
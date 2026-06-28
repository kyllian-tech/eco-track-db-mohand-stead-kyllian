const js = require("@eslint/js");
const globals = require("globals");

module.exports = [
  {
    ignores: [
      "src/config/connexionSupabase.js",
      "src/kafka/**",
      "node_modules/**",
    ],
  },
  js.configs.recommended,
  {
    files: ["src/**/*.js", "tests/**/*.js"],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "commonjs",
      globals: {
        ...globals.node,
      },
    },
    rules: {
      "no-unused-vars": "off",
      "no-console": "off",
      "no-undef": "error",
    },
  },
];

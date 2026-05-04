import { FlatCompat } from "@eslint/eslintrc";

const compat = new FlatCompat({
  baseDirectory: import.meta.dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals"),
  {
    rules: {
      // Prose-heavy pages (legal, marketing copy) inherently use quotation
      // marks and apostrophes. HTML-escaping every occurrence creates noisy
      // diffs and unreadable source. Disable globally; reviewers should catch
      // actual XSS risks in code review instead.
      "react/no-unescaped-entities": "off",
    },
    linterOptions: {
      // Unused eslint-disable directives are common during development.
      // Demote from error to warn so they don't block builds.
      reportUnusedDisableDirectives: "warn",
    },
  },
];

export default eslintConfig;

import { FlatCompat } from '@eslint/eslintrc';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const compat = new FlatCompat({
  baseDirectory: dirname(fileURLToPath(import.meta.url)),
});

/**
 * Reserved-token enforcement — see PORTFOLIO_BRIEF.md §11.5.
 *
 * `--signal` and `--warn` are reserved for verified-data and limitation UI only.
 * Three layers keep that true without relying on discipline:
 *   1. Neither token is registered in `@theme`, so Tailwind generates no
 *      `text-signal` / `bg-warn` utilities. They cannot be used by accident.
 *   2. stylelint bans `var(--signal)` / `var(--warn)` outside src/styles/reserved.css.
 *   3. The rule below bans the two semantic classes that consume them outside the
 *      two components allowed to render them.
 */
const RESERVED_CLASSES = ['is-verified', 'is-limitation'];
const RESERVED_CLASS_OWNERS = [
  'src/components/VerifiedValue.tsx',
  'src/components/Limitation.tsx',
];

const reservedClassPattern = RESERVED_CLASSES.join('|');

const eslintConfig = [
  ...compat.extends('next/core-web-vitals', 'next/typescript'),
  {
    // MDX is not linted here: no MDX parser is installed, and the TypeScript
    // parser chokes on YAML frontmatter. Case-study content is validated instead
    // by the Zod schema in src/lib/projects.ts and by scripts/check-mono-subset.ts.
    ignores: ['.next/**', 'node_modules/**', 'out/**', 'next-env.d.ts', '**/*.mdx'],
  },
  {
    // Scoped to source files: the rule's own definition below mentions the
    // reserved class names, and a config file is not a render path.
    files: ['src/**/*.ts', 'src/**/*.tsx'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/consistent-type-imports': 'error',
      'no-restricted-syntax': [
        'error',
        {
          selector: `Literal[value=/\\b(${reservedClassPattern})\\b/]`,
          message:
            'Reserved: `is-verified` / `is-limitation` consume --signal / --warn and may only be used in VerifiedValue.tsx or Limitation.tsx. See PORTFOLIO_BRIEF.md §11.5.',
        },
        {
          selector: `TemplateElement[value.raw=/\\b(${reservedClassPattern})\\b/]`,
          message:
            'Reserved: `is-verified` / `is-limitation` consume --signal / --warn and may only be used in VerifiedValue.tsx or Limitation.tsx. See PORTFOLIO_BRIEF.md §11.5.',
        },
        {
          selector: 'Literal[value=/var\\(\\s*--(signal|warn)\\b/]',
          message:
            'Reserved: --signal / --warn must not be referenced from TSX. Use the VerifiedValue or Limitation component. See PORTFOLIO_BRIEF.md §11.5.',
        },
      ],
    },
  },
  {
    // The two components that are permitted to consume the reserved tokens.
    files: RESERVED_CLASS_OWNERS,
    rules: {
      'no-restricted-syntax': 'off',
    },
  },
  {
    // Node scripts are not part of the browser bundle.
    files: ['scripts/**/*.ts'],
    rules: {
      'no-console': 'off',
      '@typescript-eslint/no-require-imports': 'off',
    },
  },
];

export default eslintConfig;

import { FlatCompat } from '@eslint/eslintrc';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const compat = new FlatCompat({
  baseDirectory: dirname(fileURLToPath(import.meta.url)),
});

/**
 * Reserved-token enforcement — see DESIGN.md, "Two rules enforced by tooling".
 *
 * `--signal` and `--warn` are reserved for verified-data and limitation UI only.
 * Three layers keep that true without relying on discipline:
 *   1. Neither token is registered in `@theme`, so Tailwind generates no
 *      `text-signal` / `bg-warn` utilities. They cannot be used by accident.
 *   2. stylelint bans `var(--signal)` / `var(--warn)` outside src/styles/reserved.css.
 *   3. The rule below bans the two semantic classes that consume them outside the
 *      two components allowed to render them.
 */
const RESERVED_CLASSES = [
  'is-verified',
  'is-limitation',
  'data-fill-[1-4]',
  'data-stroke-[1-4]',
  'ramp-fill-[1-4]',
  'ramp-bg-[1-4]',
];
const RESERVED_CLASS_OWNERS = [
  'src/components/VerifiedValue.tsx',
  'src/components/Limitation.tsx',
  // Diagram maps a semantic prop to a scale step internally, so
  // these are the only files that ever name a data colour.
  'src/components/Diagram.tsx',
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
            'Reserved class: --signal, --warn and the --data / --ramp scales may only be reached through VerifiedValue, Limitation or Diagram. See DESIGN.md.',
        },
        {
          selector: `TemplateElement[value.raw=/\\b(${reservedClassPattern})\\b/]`,
          message:
            'Reserved class: --signal, --warn and the --data / --ramp scales may only be reached through VerifiedValue, Limitation or Diagram. See DESIGN.md.',
        },
        {
          selector: 'Literal[value=/var\\(\\s*--(signal|warn|data-[1-4]|ramp-[1-4])\\b/]',
          message:
            'Reserved: --signal, --warn and the --data / --ramp scales must not be referenced from TSX. Use VerifiedValue, Limitation or Diagram. See DESIGN.md.',
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

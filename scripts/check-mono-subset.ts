/**
 * Fails the build if anything rendered in the monospace class uses a glyph the
 * subset font cannot draw. See PORTFOLIO_BRIEF.md §11.3 and DESIGN.md.
 *
 * Two checks:
 *   1. Every literal child of <Measured> in .tsx / .mdx is inside the subset.
 *   2. `font-mono` and the mono token appear only in Measured.tsx, so mono cannot
 *      be applied to arbitrary text by bypassing the component.
 *
 * Values that arrive at runtime (a coding-profile snapshot, say) cannot be checked
 * statically. Those degrade gracefully instead: Instrument Sans is the next entry in
 * the mono font stack, so an out-of-subset glyph renders in the grotesk rather than
 * as a missing-glyph box. <Measured> additionally throws in development.
 */

import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { MONO_SUBSET, outOfSubset } from '../src/lib/mono-subset';
import { profile } from '../src/content/profile';
import { getAllProjects } from '../src/lib/projects';

// npm scripts run from the package root. Resolved from cwd rather than
// import.meta.dirname because tsx transpiles this module to CJS, where
// import.meta is not populated.
const ROOT = process.cwd();
const SCAN_DIRS = ['src', 'data'];
const MONO_OWNER = 'src/components/Measured.tsx';

type Violation = { file: string; line: number; detail: string };

function walk(dir: string): string[] {
  const out: string[] = [];
  for (const entry of readdirSync(dir)) {
    if (entry === 'node_modules' || entry.startsWith('.')) continue;
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) out.push(...walk(full));
    else if (/\.(tsx?|mdx)$/.test(entry)) out.push(full);
  }
  return out;
}

const violations: Violation[] = [];

for (const dir of SCAN_DIRS) {
  const abs = join(ROOT, dir);
  try {
    statSync(abs);
  } catch {
    continue;
  }

  for (const file of walk(abs)) {
    const rel = relative(ROOT, file);
    const source = readFileSync(file, 'utf8');
    const lines = source.split('\n');

    // 1. Literal children of <Measured>. Skip children that are expressions,
    //    which cannot be resolved without evaluating the module.
    for (const match of source.matchAll(/<Measured\b[^>]*>([^<]*)<\/Measured>/g)) {
      const inner = match[1] ?? '';
      if (inner.includes('{') || inner.trim() === '') continue;
      const bad = outOfSubset(inner.trim());
      if (bad.length > 0) {
        const line = source.slice(0, match.index).split('\n').length;
        violations.push({
          file: rel,
          line,
          detail: `<Measured> contains ${bad.map((c) => JSON.stringify(c)).join(', ')} — not in the subset`,
        });
      }
    }

    // 2. font-mono may only be applied inside the Measured component.
    if (rel !== MONO_OWNER) {
      lines.forEach((text, i) => {
        if (/\bfont-mono\b/.test(text) || /var\(\s*--font-mono\s*\)/.test(text)) {
          violations.push({
            file: rel,
            line: i + 1,
            detail:
              'applies `font-mono` outside Measured.tsx — render measured values with <Measured>',
          });
        }
      });
    }
  }
}

// 3. The typed content itself. Every value that reaches <Measured> at runtime
//    lives in profile.ts or a case study's frontmatter, so both are checked
//    directly rather than by scanning for literals.
for (const [index, point] of profile.proof.entries()) {
  const bad = outOfSubset(point.value);
  if (bad.length > 0) {
    violations.push({
      file: 'src/content/profile.ts',
      line: 0,
      detail: `proof[${index}] value ${JSON.stringify(point.value)} contains ${bad.map((c) => JSON.stringify(c)).join(', ')}`,
    });
  }
}

for (const project of getAllProjects()) {
  for (const [index, metric] of project.metrics.entries()) {
    const bad = outOfSubset(metric.value);
    if (bad.length > 0) {
      violations.push({
        file: `src/content/projects/${project.slug}.mdx`,
        line: 0,
        detail: `metrics[${index}] value ${JSON.stringify(metric.value)} contains ${bad.map((c) => JSON.stringify(c)).join(', ')}`,
      });
    }
  }
}

if (violations.length > 0) {
  console.error(`\n  Monospace subset check failed — ${violations.length} violation(s).`);
  console.error(`  The subset is: ${JSON.stringify(MONO_SUBSET)}\n`);
  for (const v of violations) {
    console.error(`  ${v.file}${v.line > 0 ? `:${v.line}` : ''}`);
    console.error(`    ${v.detail}`);
  }
  console.error(
    '\n  Monospace on this site means "this is a real, measured number". To add a\n' +
      '  glyph, extend MONO_SUBSET in src/lib/mono-subset.ts, re-run\n' +
      '  `python3 scripts/subset-fonts.py`, and commit the regenerated font.\n',
  );
  process.exit(1);
}

const checkedValues =
  profile.proof.length +
  getAllProjects().reduce((total, project) => total + project.metrics.length, 0);

console.log(
  `  mono subset ok — ${checkedValues} measured values checked against ${JSON.stringify(MONO_SUBSET)}`,
);

/**
 * Fails the build if anything rendered in the monospace class uses a glyph the
 * subset font cannot draw. See DESIGN.md, "The monospace face is subset to
 * numeric glyphs".
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
import { stats } from '../src/lib/stats-snapshot';

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

// 3. The typed content itself.
//
//    The scan above only sees literal children of <Measured>. Most values reach it
//    as expressions — {String(stats.leetcode.data.hard)} and the like — which
//    cannot be resolved by reading the source. So every datum that is rendered in
//    the mono class is checked here at its source instead: the proof strip, case
//    study frontmatter, the hand-entered GeeksforGeeks figures, and the committed
//    coding-profile snapshot.
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

/*
 * The GeeksforGeeks block that used to be checked here is gone with the data. The
 * snapshot check below is kept even though nothing renders those values yet: the
 * fetch and its workflow are still in place, and a guard is cheaper to keep than
 * to remember to restore.
 */

if (stats !== null) {
  const snapshotValues: [string, number][] = [
    ...(stats.leetcode === null
      ? []
      : ([
          ['leetcode.total', stats.leetcode.data.total],
          ['leetcode.easy', stats.leetcode.data.easy],
          ['leetcode.medium', stats.leetcode.data.medium],
          ['leetcode.hard', stats.leetcode.data.hard],
        ] as [string, number][])),
    ...(stats.github === null
      ? []
      : ([['github.publicRepos', stats.github.data.publicRepos]] as [string, number][])),
  ];
  for (const [field, value] of snapshotValues) {
    const bad = outOfSubset(String(value));
    if (bad.length > 0) {
      violations.push({
        file: 'data/stats.json',
        line: 0,
        detail: `${field} renders as ${JSON.stringify(String(value))}, containing ${bad.map((c) => JSON.stringify(c)).join(', ')}`,
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

const snapshotCount =
  stats === null
    ? 0
    : (stats.leetcode === null ? 0 : 4) + (stats.github === null ? 0 : 1);
const checkedValues =
  profile.proof.length +
  getAllProjects().reduce((total, project) => total + project.metrics.length, 0) +
  snapshotCount;

console.log(
  `  mono subset ok — ${checkedValues} measured values checked against ${JSON.stringify(MONO_SUBSET)}`,
);

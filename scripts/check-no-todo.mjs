/**
 * Fails the build if an unfinished note or an em-dash reaches anything a visitor
 * can load.
 *
 * Scans the build output rather than the source: unfinished notes are allowed in
 * MDX comments, TypeScript comments and CONTENT.md, and none of those render. What
 * must never ship is a rendered page — or an RSC payload, which is how the first
 * leak happened: a client component received the full project objects, so every
 * case study's prose travelled to the browser for a page that showed summaries.
 *
 * Run after `next build`, and in CI.
 */

import { readdirSync, readFileSync, statSync } from 'node:fs';
import { extname, join, relative } from 'node:path';

const ROOT = process.cwd();
const BUILD = join(ROOT, '.next', 'server', 'app');
const SCANNED = new Set(['.html', '.rsc', '.body', '.json', '.txt']);
const CHECKS = [
  {
    needle: /TODO/,
    label: 'TODO',
    advice:
      'Write the section from evidence, or delete it. A visitor must never see the\n  word. Notes belong in MDX comments or CONTENT.md.',
  },
  {
    // Review markers are notes to the author. A reader seeing one is the same
    // failure as a TODO: the site narrating its own build status. Found live on a
    // case study after the TODO guard shipped, because the guard only knew one word.
    needle: /\[(INFERRED|CHECK|TBD|FIXME|XXX)\]/,
    label: 'review marker',
    advice:
      'Move the note into an MDX comment and keep the prose, or rewrite the prose so\n  the caveat is unnecessary.',
  },
  {
    // An em-dash almost always marks two sentences, a comma, or a colon that was
    // not chosen. Recorded as a standing rule in the brief; enforced here so the
    // rule survives the next person writing copy.
    needle: /\u2014/,
    label: 'em-dash',
    advice:
      'Rewrite the sentence rather than substituting another character. An em-dash\n  usually wants a full stop, a comma, or a colon.',
  },
];

function walk(dir) {
  const out = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) out.push(...walk(full));
    else if (SCANNED.has(extname(entry))) out.push(full);
  }
  return out;
}

let files;
try {
  files = walk(BUILD);
} catch {
  console.error('  no build output at .next/server/app — run `next build` first.');
  process.exit(1);
}

let failed = false;
for (const check of CHECKS) {
  const offenders = [];
  for (const file of files) {
    const text = readFileSync(file, 'utf8');
    const at = text.search(check.needle);
    if (at === -1) continue;
    const count = (text.match(new RegExp(check.needle, 'g')) ?? []).length;
    offenders.push({
      file: relative(ROOT, file),
      count,
      sample: text.slice(Math.max(0, at - 60), at + 90).replace(/\s+/g, ' '),
    });
  }
  if (offenders.length === 0) continue;
  failed = true;
  console.error(
    `\n  ${check.label} reached the build output in ${offenders.length} file(s).\n`,
  );
  for (const o of offenders) {
    console.error(`  ${o.file}  (${o.count})`);
    console.error(`    ...${o.sample}...\n`);
  }
  console.error(`  ${check.advice}\n`);
}

if (failed) process.exit(1);
console.log(
  `  build output clean: no TODO, review marker or em-dash in ${files.length} files`,
);

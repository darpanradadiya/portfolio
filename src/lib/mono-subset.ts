/**
 * The complete glyph set of the monospace face.
 *
 * Monospace on this site is a semantic signal meaning "this is a real, measured
 * number" (see DESIGN.md). To keep that a fact rather than a convention, the font
 * file itself is subset to exactly these glyphs — it physically cannot render prose.
 *
 * This constant is the single source of truth. Three things read it:
 *   - scripts/subset-fonts.py, which builds the .woff2
 *   - scripts/check-mono-subset.ts, which fails the build on a violation
 *   - the <Measured> component, which is the only way to render mono text
 *
 * Adding a glyph is a deliberate act: extend this string, re-run the font script,
 * and commit the regenerated font. Do not work around the guard.
 */
export const MONO_SUBSET = '0123456789.,+-%/:Kx ';

/** Characters in `value` that the monospace font cannot render. */
export function outOfSubset(value: string): string[] {
  const allowed = new Set(MONO_SUBSET);
  return [...new Set([...value])].filter((char) => !allowed.has(char));
}

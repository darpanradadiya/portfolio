import { outOfSubset } from '@/lib/mono-subset';

type MeasuredProps = {
  /** A measured value. Only glyphs in MONO_SUBSET may be used. */
  children: string;
  className?: string;
};

/**
 * The only way to render monospace text on this site.
 *
 * Monospace is a semantic signal here: it means "this is a real, measured number".
 * `children` is typed as `string` rather than `ReactNode` so a value cannot be
 * composed out of arbitrary markup, and `scripts/check-mono-subset.ts` fails the
 * build if a literal falls outside the font's glyph set.
 *
 * Values that only exist at runtime degrade rather than break: Instrument Sans is
 * the next font in the mono stack, so an out-of-subset glyph renders in the grotesk.
 * In development this throws instead, so the problem surfaces while it is cheap.
 */
export function Measured({ children, className = '' }: MeasuredProps) {
  if (process.env.NODE_ENV !== 'production') {
    const bad = outOfSubset(children);
    if (bad.length > 0) {
      throw new Error(
        `<Measured> received ${bad.map((c) => JSON.stringify(c)).join(', ')}, ` +
          `which the subset monospace font cannot render. Value: ${JSON.stringify(children)}. ` +
          `See src/lib/mono-subset.ts.`,
      );
    }
  }

  return <span className={`font-mono tabular-nums ${className}`.trim()}>{children}</span>;
}

import type { ReactNode } from 'react';

type SectionProps = {
  /**
   * The rail marker — a short, sentence-case label. Not an all-caps eyebrow;
   * the rail exists so the page does not need those.
   */
  marker?: string;
  children: ReactNode;
  /** Renders a hairline above the section. */
  divided?: boolean;
  /**
   * Tints the section as a distinct zone. The band runs the full width of the
   * viewport while the content stays in the measure, which is why this component
   * carries its own .page wrapper rather than sitting inside one.
   *
   * A band is a tint shift rather than a lightness step (1.07:1 against the
   * ground), so it always draws a hairline at its edges — otherwise the boundary
   * is invisible.
   */
  band?: 'cool' | 'warm';
  /** Reveals on scroll entry, transform and opacity only. */
  reveal?: boolean;
  /** Two-stop gradient behind the section, cool band into the page ground. */
  wash?: boolean;
  id?: string;
  'aria-labelledby'?: string;
};

/**
 * The page's structural primitive: a 7rem rail carrying a section marker, beside a
 * 66ch measure holding the content. Below 48rem the rail collapses and the marker
 * sits above. See DESIGN.md, "Layout".
 */
export function Section({
  marker,
  children,
  divided = false,
  band,
  reveal = false,
  wash = false,
  id,
  'aria-labelledby': labelledBy,
}: SectionProps) {
  const bandClass = band === 'cool' ? 'band-cool' : band === 'warm' ? 'band-warm' : '';
  const outer = [
    bandClass,
    wash ? 'hero-wash' : '',
    band !== undefined || wash ? 'py-12 md:py-16' : '',
    reveal ? 'reveal' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <section id={id} aria-labelledby={labelledBy} className={outer}>
      <div className="page">
        <div className={divided ? 'border-rule border-t pt-10 md:pt-14' : ''}>
          <div className="railed">
            <div className="text-2xs text-ink-muted md:pt-[0.45rem] md:text-right">
              {marker ?? null}
            </div>
            <div>{children}</div>
          </div>
        </div>
      </div>
    </section>
  );
}

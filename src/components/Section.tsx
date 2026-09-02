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
  id,
  'aria-labelledby': labelledBy,
}: SectionProps) {
  return (
    <section
      id={id}
      aria-labelledby={labelledBy}
      className={divided ? 'border-t border-rule pt-10 md:pt-14' : ''}
    >
      <div className="railed">
        <div className="text-2xs text-ink-muted md:pt-[0.45rem] md:text-right">
          {marker ?? null}
        </div>
        <div>{children}</div>
      </div>
    </section>
  );
}

import Link from 'next/link';

type BackLinkProps = {
  href: string;
  children: string;
};

/**
 * A back affordance.
 *
 * The arrow is an inline SVG rather than the character U+2190, because Instrument
 * Sans does not contain that glyph — a literal "←" would fall back to a system font
 * and render visibly out of family. It is also the only arrow in the design system;
 * a prefix on a back link is not the banned suffix arrow on every link and button.
 */
export function BackLink({ href, children }: BackLinkProps) {
  return (
    <Link href={href} className="inline-flex items-center gap-1.5 text-xs no-underline">
      <svg
        aria-hidden="true"
        focusable="false"
        width="12"
        height="12"
        viewBox="0 0 12 12"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinecap="square"
      >
        <path d="M11 6H1.5M5 2L1 6l4 4" />
      </svg>
      <span className="decoration-rule-strong underline underline-offset-[0.2em]">
        {children}
      </span>
    </Link>
  );
}

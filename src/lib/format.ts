import type { CSSProperties } from 'react';

/** A CSS custom property in a style prop, without reaching for `any`. */
export function cssVar(name: `--${string}`, value: string | number): CSSProperties {
  return { [name]: value } as CSSProperties;
}

/** "2026-09-02" -> "2 September 2026". */
export function formatDate(iso: string): string {
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  });
}

import type { ReactNode } from 'react';

type LimitationProps = {
  children: ReactNode;
  className?: string;
};

/**
 * A limitation, caveat, or stale-data notice.
 *
 * One of only two components permitted to consume `--warn`. Honest limitations are
 * a feature of this site, not an embarrassment — they get their own token so they
 * are impossible to confuse with an error state.
 */
export function Limitation({ children, className = '' }: LimitationProps) {
  return <p className={`is-limitation text-xs ${className}`.trim()}>{children}</p>;
}

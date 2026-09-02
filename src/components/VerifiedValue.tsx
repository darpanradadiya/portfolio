import { Measured } from '@/components/Measured';

type VerifiedValueProps = {
  value: string;
  className?: string;
};

/**
 * A measured value that has been checked against a real source.
 *
 * One of only two components permitted to consume `--signal`. See DESIGN.md,
 * "Two rules enforced by tooling" — `--signal` is not an accent colour, and this
 * component is the reason the token exists.
 */
export function VerifiedValue({ value, className = '' }: VerifiedValueProps) {
  return <Measured className={`is-verified ${className}`.trim()}>{value}</Measured>;
}

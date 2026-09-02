import { Measured } from '@/components/Measured';

type Tier = {
  label: string;
  count: number;
  /** Emphasised tiers are set larger — the distribution is the point. */
  emphasis?: boolean;
};

/**
 * A difficulty distribution.
 *
 * Medium and Hard are set larger than the rest because depth is the claim being
 * made here, not volume. Tiers with a zero count are omitted rather than shown as
 * "0", per the display rules.
 */
export function DifficultyTiers({ tiers }: { tiers: readonly Tier[] }) {
  const shown = tiers.filter((tier) => tier.count > 0);

  return (
    <ul className="flex list-none flex-wrap gap-x-8 gap-y-4 p-0">
      {shown.map((tier) => (
        <li key={tier.label}>
          <Measured
            className={tier.emphasis === true ? 'block text-2xl' : 'block text-lg'}
          >
            {String(tier.count)}
          </Measured>
          <span className="text-2xs text-ink-muted mt-1 block">{tier.label}</span>
        </li>
      ))}
    </ul>
  );
}

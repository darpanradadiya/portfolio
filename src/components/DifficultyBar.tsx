import { Measured } from '@/components/Measured';

/**
 * A difficulty distribution as a stacked bar.
 *
 * One hue, light to dark, so "harder" reads as "denser" rather than as four
 * unrelated categories. This is the only component permitted to touch the
 * `--ramp-*` scale, and it maps a tier to a step internally rather than exposing
 * the class names.
 *
 * Adjacent ramp steps sit about 1.4:1 apart, which is not enough separation on its
 * own, so a hairline in the page ground is drawn between segments and every tier is
 * labelled with its exact count. The bar itself is `aria-hidden`: the legend below
 * carries strictly more information, so there is nothing for a screen reader in the
 * drawing that is not in the list.
 */

export type Tier = {
  label: string;
  count: number;
};

/** Step 1 is the lightest. Tiers arrive easiest-first and get progressively denser. */
const RAMP_BG = ['ramp-bg-1', 'ramp-bg-2', 'ramp-bg-3', 'ramp-bg-4'] as const;

export function DifficultyBar({
  tiers,
  note,
}: {
  /** Easiest first. At most four, matching the ramp. */
  tiers: readonly Tier[];
  note?: string;
}) {
  const shown = tiers.filter((tier) => tier.count > 0).slice(0, RAMP_BG.length);
  const total = shown.reduce((sum, tier) => sum + tier.count, 0);

  if (total === 0) return null;

  return (
    <div>
      <div
        aria-hidden="true"
        className="border-rule-strong flex h-8 w-full overflow-hidden border"
      >
        {shown.map((tier, index) => (
          <div
            key={tier.label}
            className={[
              RAMP_BG[index],
              // A hairline in the page ground, so the boundary never depends on the
              // 1.4:1 between adjacent ramp steps.
              index > 0 ? 'border-paper border-l-2' : '',
            ]
              .filter(Boolean)
              .join(' ')}
            style={{ flexGrow: tier.count, flexBasis: 0 }}
          />
        ))}
      </div>

      <ul className="mt-4 flex list-none flex-wrap gap-x-6 gap-y-3 p-0">
        {shown.map((tier, index) => (
          <li key={tier.label} className="flex items-baseline gap-2">
            <span
              aria-hidden="true"
              className={`${RAMP_BG[index]} border-rule mt-[0.15rem] inline-block h-2.5 w-2.5 shrink-0 self-start border`}
            />
            <span>
              <Measured className="text-base">{String(tier.count)}</Measured>{' '}
              <span className="text-2xs text-ink-muted">{tier.label}</span>
            </span>
          </li>
        ))}
      </ul>

      {note !== undefined && <p className="text-ink-muted text-2xs mt-3">{note}</p>}
    </div>
  );
}

import { Measured } from '@/components/Measured';
import { profile } from '@/content/profile';
import { cssVar, formatDate } from '@/lib/format';

/**
 * Four measured numbers, each with its evidence directly beneath it. This is where
 * the page spends its boldness — the numerals are the only thing set at
 * --text-display, and everything else on the home page stays quiet.
 *
 * The one motion moment on the site lives here: the three vertical hairlines
 * between the cells scale in from zero height, staggered 60ms. Transform-only, so
 * it cannot shift layout, and the numbers are at their final value from the first
 * frame. Nothing counts up — a count-up renders 0 on frame one, and no statistic
 * here may ever display as zero.
 */
export function ProofStrip() {
  return (
    <div>
      <ol className="grid list-none grid-cols-1 p-0 md:grid-cols-4">
        {profile.proof.map((point, index) => (
          <li
            key={point.label}
            className={[
              'relative py-6',
              index > 0 ? 'border-rule border-t md:border-t-0' : '',
              'md:px-5 md:first:pl-0 md:last:pr-0',
            ]
              .filter(Boolean)
              .join(' ')}
          >
            {index > 0 && (
              <span
                aria-hidden="true"
                className="proof-rule bg-rule-strong absolute top-0 left-0 hidden h-full w-px md:block"
                style={cssVar('--rule-index', index - 1)}
              />
            )}
            <Measured className="text-display block">{point.value}</Measured>
            <span className="mt-3 block text-xs">{point.label}</span>
            <span className="text-2xs text-ink-muted mt-1 block">{point.provenance}</span>
          </li>
        ))}
      </ol>
      <p className="text-2xs text-ink-muted mt-2">
        Coding-profile figures verified {formatDate(profile.statsVerifiedOn)}. Everything
        else is documented in the résumé.
      </p>
    </div>
  );
}

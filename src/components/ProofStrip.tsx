import { Measured } from '@/components/Measured';
import { profile } from '@/content/profile';
import { cssVar, formatDate } from '@/lib/format';

/**
 * Four measured numbers, each with its evidence directly beneath it. This is where
 * the page spends its boldness — the numerals are the only thing set at
 * --text-display, and everything else on the home page stays quiet.
 *
 * Two columns, not four. Measured at the page's full width, four columns give each
 * cell about 223px, and "100K+" at a display size needs 288px: the four-across
 * layout was overflowing its own cells at every width above 768px, and pushing the
 * page into horizontal scroll at 768 and 1024. Two-up roughly doubles the room,
 * which is the whole point of the section.
 *
 * The strip is also the one block that breaks out of the 66ch measure, because the
 * brief says to spend the boldness here and a measure-width strip cannot.
 *
 * The site's only motion lives here: the vertical hairlines scale in once on load,
 * transform-only, with the numbers at their final value from the first frame.
 */
export function ProofStrip() {
  return (
    <div className="page">
      <ol className="grid list-none grid-cols-1 p-0 sm:grid-cols-2">
        {profile.proof.map((point, index) => {
          const isRightColumn = index % 2 === 1;
          return (
            <li
              key={point.label}
              className={[
                'relative py-9 md:py-12',
                // Stacked: a rule above every cell but the first.
                index > 0 ? 'border-rule-strong border-t' : '',
                // Two-up: the second cell sits beside the first, so it loses its
                // top rule and gains a vertical one.
                index === 1 ? 'sm:border-t-0' : '',
                isRightColumn ? 'sm:pl-8' : 'sm:pr-8',
              ]
                .filter(Boolean)
                .join(' ')}
            >
              {isRightColumn && (
                <span
                  aria-hidden="true"
                  className="proof-rule bg-rule-strong absolute top-0 left-0 hidden h-full w-[2px] sm:block"
                  style={cssVar('--rule-index', index === 1 ? 0 : 1)}
                />
              )}
              <Measured className="text-display block">{point.value}</Measured>
              <span className="mt-4 block text-lg">{point.label}</span>
              <span className="text-ink-muted mt-2 block text-xs">
                {point.provenance}
              </span>
            </li>
          );
        })}
      </ol>
      <p className="text-ink-muted text-2xs mt-6 pb-2">
        Coding-profile figures verified {formatDate(profile.statsVerifiedOn)}. Everything
        else is documented in the résumé.
      </p>
    </div>
  );
}

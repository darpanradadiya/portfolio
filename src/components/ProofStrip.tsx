import { Measured } from '@/components/Measured';
import { profile } from '@/content/profile';
import { cssVar } from '@/lib/format';

/**
 * Four measured numbers, each with its evidence directly beneath it. This is where
 * the page spends its boldness: the numerals are the only thing set at
 * --text-display, and everything else on the home page stays quiet.
 *
 * Four columns from 768px, two below. It was two-up at every width, which stacked
 * the strip into two tall rows and made it the second-largest block on the home
 * page for four short facts. The first attempt at four-up overflowed its own cells
 * because the numerals were 6rem; they are 2.75rem now, and the arithmetic for
 * both breakpoints is written out beside --text-display in tokens.css.
 *
 * The strip is also the one block that breaks out of the 66ch measure, because the
 * brief says to spend the boldness here and a measure-width strip cannot.
 *
 * The site's only motion lives here: the vertical hairlines scale in once on load,
 * transform-only, with the numbers at their final value from the first frame.
 */

/** Columns below and above the 768px breakpoint. The rules follow from these. */
const NARROW_COLUMNS = 2;
const WIDE_COLUMNS = 4;

export function ProofStrip() {
  const points = profile.proof;
  const last = points.length - 1;

  return (
    <div className="page">
      <ol className="grid list-none grid-cols-2 p-0 md:grid-cols-4">
        {points.map((point, index) => {
          /*
           * A cell needs a rule on its left when it is not first in its row, and
           * one above when it is not in the first row. Both facts change at the
           * breakpoint, so both are computed twice and the difference becomes a
           * md: variant. Derived from the column counts rather than written per
           * index, so a fifth proof point cannot land in a broken grid.
           */
          const narrowFirstInRow = index % NARROW_COLUMNS === 0;
          const narrowFirstRow = index < NARROW_COLUMNS;
          const narrowLastInRow =
            index % NARROW_COLUMNS === NARROW_COLUMNS - 1 || index === last;
          const wideFirstInRow = index % WIDE_COLUMNS === 0;
          const wideFirstRow = index < WIDE_COLUMNS;
          const wideLastInRow =
            index % WIDE_COLUMNS === WIDE_COLUMNS - 1 || index === last;

          const showsRule = !narrowFirstInRow || !wideFirstInRow;
          const ruleVisibility = !narrowFirstInRow
            ? wideFirstInRow
              ? 'block md:hidden'
              : 'block'
            : 'hidden md:block';

          return (
            <li
              key={point.label}
              className={[
                'relative py-7 md:py-8',
                !narrowFirstRow ? 'border-rule-strong border-t' : '',
                !narrowFirstRow && wideFirstRow ? 'md:border-t-0' : '',
                !narrowFirstInRow ? 'pl-4' : '',
                !wideFirstInRow ? 'md:pl-4' : '',
                !narrowLastInRow ? 'pr-4' : '',
                !wideLastInRow ? 'md:pr-4' : '',
              ]
                .filter(Boolean)
                .join(' ')}
            >
              {showsRule && (
                <span
                  aria-hidden="true"
                  className={`proof-rule bg-rule-strong absolute top-0 left-0 h-full w-[2px] ${ruleVisibility}`}
                  style={cssVar('--rule-index', index - 1)}
                />
              )}
              <Measured className="text-display block">{point.value}</Measured>
              {/*
                text-base, not text-lg. A four-column cell is about 190px wide and
                "pytest functions" needs 136px at this size and 168px one step up,
                so the larger size wrapped every label but one onto a second line.
              */}
              <span className="mt-3 block text-base">{point.label}</span>
              <span className="text-ink-muted text-2xs mt-1.5 block">
                {point.provenance}
              </span>
            </li>
          );
        })}
      </ol>
      {/*
        No verification date. It dated the coding-profile figures, and there are
        none: every cell is now measured from a repository or documented in the
        résumé, and none of them moves without a commit.
      */}
      <p className="text-ink-muted text-2xs mt-5 pb-2">
        Every figure here is measured from the repository it names, or documented in the
        résumé.
      </p>
    </div>
  );
}

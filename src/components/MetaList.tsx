type MetaListProps = {
  items: readonly string[];
  className?: string;
};

/**
 * A short run of metadata — two or three items that fit on one line.
 *
 * Separated by 1px vertical hairlines rather than middle dots. The hairlines only
 * appear from 48rem up: at narrow widths the items stack, and a border-left on a
 * wrapped item renders as a tall bar down the side of the block, which reads as a
 * quotation marker rather than a separator. Below that breakpoint the items are
 * spaced instead.
 *
 * For lists long enough to wrap at any width — a twelve-item stack, say — use
 * StackList, which joins with commas for exactly this reason.
 */
export function MetaList({ items, className = '' }: MetaListProps) {
  return (
    <ul
      className={`flex list-none flex-col gap-1 p-0 md:flex-row md:flex-wrap md:gap-0 ${className}`.trim()}
    >
      {items.map((item, index) => (
        <li
          key={item}
          className={index === 0 ? 'md:pr-3' : 'md:border-rule md:border-l md:px-3'}
        >
          {item}
        </li>
      ))}
    </ul>
  );
}

type StackListProps = {
  items: readonly string[];
  className?: string;
};

/**
 * A technology list, joined with commas.
 *
 * These lists are long enough to wrap at any viewport width, so hairline separators
 * are not an option: a border-left on the first item of a wrapped row reads as a
 * stray vertical bar. Commas wrap correctly at every width and are not the banned
 * middle-dot join.
 *
 * Marked up as a real list so it is announced as one, with the commas presentational.
 */
export function StackList({ items, className = '' }: StackListProps) {
  return (
    <ul className={`m-0 flex list-none flex-wrap p-0 ${className}`.trim()}>
      {items.map((item, index) => (
        <li key={item}>
          {item}
          {index < items.length - 1 && <span aria-hidden="true">,&nbsp;</span>}
        </li>
      ))}
    </ul>
  );
}

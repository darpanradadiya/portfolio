import { REPOSITORIES } from '@/content/repositories';

/**
 * The rest of the account, at the density it deserves.
 *
 * Rows, not cards. Six cards would take four times the height to carry the same
 * four facts, and this section has a job the case studies do not: be scannable in
 * about ten seconds by someone deciding whether to open any of them.
 *
 * The name is the link text rather than a prettier label, so what a reader clicks
 * matches where they land and can be checked against the account.
 */
export function RepositoryList() {
  if (REPOSITORIES.length === 0) return null;

  return (
    <ul className="mt-6 flex list-none flex-col gap-3 p-0">
      {REPOSITORIES.map((repository) => (
        <li key={repository.name} className="sm:flex sm:items-baseline sm:gap-x-3">
          {/*
            Name and language share a line at every width. The language had its
            own right-aligned column, which cost a fourth line per row at 390px
            for one word, and "Art_Gallery JavaScript" reads as one fact anyway.
          */}
          <span className="flex items-baseline gap-x-2 sm:shrink-0">
            <a href={repository.url} className="text-xs">
              {repository.name}
            </a>
            <span className="text-ink-muted text-2xs shrink-0">
              {repository.language}
            </span>
          </span>
          <span className="text-ink-muted text-2xs block min-w-0">
            {repository.line}
            {/*
              Provenance as a tag, not a sentence. Same muted treatment a case
              study's dataNote gets, at the density a one-line row can afford:
              invented data and shared authorship both change how the row reads,
              and neither fits in the fifteen words.
            */}
            {repository.note !== null && (
              <span className="whitespace-nowrap italic"> ({repository.note})</span>
            )}
          </span>
        </li>
      ))}
    </ul>
  );
}

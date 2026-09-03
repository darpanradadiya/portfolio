import { z } from 'zod';

/**
 * The coding-profile snapshot: types, validation, and the merge rule.
 *
 * Everything in this file is pure. The I/O lives in scripts/fetch-stats.ts, so the
 * guarantee that matters — that a bad fetch can never replace good data — is
 * testable without touching the network. See src/lib/stats.test.ts.
 *
 * Two rules from the brief are enforced by the *shape* of these types rather than
 * by the code that fills them:
 *
 *   1. No recency or activity fields exist. There is nowhere to put a streak, a
 *      heatmap, a submission calendar, or a last-active date, so none of those can
 *      leak into the UI even by accident.
 *   2. Codeforces has no entry at all. It is linked but never quantified, so its
 *      rating is fetched only to confirm the handle resolves and is then discarded.
 */

const nonNegativeInt = z.number().int().nonnegative();

export const leetcodeStatsSchema = z
  .object({
    total: nonNegativeInt,
    easy: nonNegativeInt,
    medium: nonNegativeInt,
    hard: nonNegativeInt,
  })
  .strict();

export const githubStatsSchema = z
  .object({
    publicRepos: nonNegativeInt,
    stars: nonNegativeInt,
    topLanguages: z
      .array(
        z
          .object({ name: z.string().min(1), repoCount: z.number().int().positive() })
          .strict(),
      )
      .max(8),
  })
  .strict();

/**
 * Each section carries its own verification date. The UI renders "as of" from this
 * rather than from the snapshot's fetchedAt, so a section that failed to refresh
 * reports the date its data is actually from instead of borrowing today's.
 */
function sectionSchema<T extends z.ZodTypeAny>(data: T) {
  return z.object({ data, verifiedAt: z.string().date() }).strict();
}

export const statsSnapshotSchema = z
  .object({
    /** When the fetch script last completed. Not necessarily when data changed. */
    fetchedAt: z.string().datetime(),
    leetcode: sectionSchema(leetcodeStatsSchema).nullable(),
    github: sectionSchema(githubStatsSchema).nullable(),
  })
  .strict();

export type LeetcodeStats = z.infer<typeof leetcodeStatsSchema>;
export type GithubStats = z.infer<typeof githubStatsSchema>;
export type StatsSnapshot = z.infer<typeof statsSnapshotSchema>;
export type Section<T> = { data: T; verifiedAt: string };

export type MergeResult = {
  snapshot: StatsSnapshot;
  warnings: string[];
};

/** Whether a LeetCode payload is internally consistent and actually says something. */
export function leetcodeIsUsable(stats: LeetcodeStats): boolean {
  if (stats.total <= 0) return false;
  return stats.easy + stats.medium + stats.hard === stats.total;
}

/**
 * Decide whether an incoming section replaces the one on disk.
 *
 * A section is treated atomically: taking the better of each field independently
 * could leave a breakdown that does not sum to its own total, which is worse than
 * stale data because it looks authoritative and is wrong.
 *
 * Incoming data is rejected when it is absent (the fetch failed), internally
 * inconsistent, zero, or lower than what is already stored. Any external source
 * can start returning zeroes or partial results without notice — LeetCode's
 * endpoint is undocumented — and a visitor must never see a number go backwards.
 */
export function chooseSection<T>(
  label: string,
  previous: Section<T> | null,
  incoming: Section<T> | null,
  isUsable: (value: T) => boolean,
  score: (value: T) => number,
): { section: Section<T> | null; warnings: string[] } {
  const warnings: string[] = [];

  if (incoming === null) {
    if (previous !== null) {
      warnings.push(
        `${label}: fetch produced nothing; keeping the snapshot from ${previous.verifiedAt}`,
      );
    } else {
      warnings.push(`${label}: fetch produced nothing and there is no previous snapshot`);
    }
    return { section: previous, warnings };
  }

  if (!isUsable(incoming.data)) {
    warnings.push(
      `${label}: fetched data is unusable (zero or internally inconsistent); ` +
        (previous === null
          ? 'no previous snapshot to fall back to'
          : `keeping the snapshot from ${previous.verifiedAt}`),
    );
    return { section: previous, warnings };
  }

  if (previous !== null && score(incoming.data) < score(previous.data)) {
    warnings.push(
      `${label}: fetched count ${score(incoming.data)} is lower than the stored ` +
        `${score(previous.data)}; keeping the snapshot from ${previous.verifiedAt}. ` +
        `Counts do not go down, so treat this as an upstream fault rather than a correction.`,
    );
    return { section: previous, warnings };
  }

  return { section: incoming, warnings };
}

/**
 * Merge a freshly fetched snapshot over the one committed to disk.
 *
 * This is the guarantee the whole statistics architecture rests on: the file on
 * disk never gets worse. If every source fails, the result is byte-identical to
 * the input apart from `fetchedAt`.
 */
export function mergeSnapshot(
  previous: StatsSnapshot | null,
  incoming: {
    fetchedAt: string;
    leetcode: Section<LeetcodeStats> | null;
    github: Section<GithubStats> | null;
  },
): MergeResult {
  const leetcode = chooseSection(
    'leetcode',
    previous?.leetcode ?? null,
    incoming.leetcode,
    leetcodeIsUsable,
    (stats) => stats.total,
  );

  const github = chooseSection(
    'github',
    previous?.github ?? null,
    incoming.github,
    (stats) => stats.publicRepos > 0,
    (stats) => stats.publicRepos,
  );

  return {
    snapshot: {
      fetchedAt: incoming.fetchedAt,
      leetcode: leetcode.section,
      github: github.section,
    },
    warnings: [...leetcode.warnings, ...github.warnings],
  };
}

/** Parse a snapshot read from disk, returning null if it is absent or malformed. */
export function parseSnapshot(raw: unknown): StatsSnapshot | null {
  const parsed = statsSnapshotSchema.safeParse(raw);
  return parsed.success ? parsed.data : null;
}

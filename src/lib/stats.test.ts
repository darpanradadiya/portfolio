import { describe, expect, it } from 'vitest';
import { geeksforgeeksBreakdownSums, profile } from '@/content/profile';
import {
  chooseSection,
  leetcodeIsUsable,
  mergeSnapshot,
  parseSnapshot,
  statsSnapshotSchema,
  type GithubStats,
  type LeetcodeStats,
  type Section,
  type StatsSnapshot,
} from './stats';

const NOW = '2026-09-02T12:00:00.000Z';
const TODAY = '2026-09-02';
const EARLIER = '2026-08-01';

function leetcode(total: number, easy = 0, medium = 0, hard = 0): LeetcodeStats {
  return { total, easy, medium, hard };
}

function section<T>(data: T, verifiedAt = TODAY): Section<T> {
  return { data, verifiedAt };
}

const GOOD_LEETCODE = leetcode(242, 55, 151, 36);
const GOOD_GITHUB: GithubStats = {
  publicRepos: 30,
  stars: 4,
  topLanguages: [{ name: 'Python', repoCount: 12 }],
};

function snapshot(over: Partial<StatsSnapshot> = {}): StatsSnapshot {
  return {
    fetchedAt: '2026-08-01T12:00:00.000Z',
    leetcode: section(GOOD_LEETCODE, EARLIER),
    github: section(GOOD_GITHUB, EARLIER),
    ...over,
  };
}

describe('leetcodeIsUsable', () => {
  it('accepts a payload whose breakdown sums to its total', () => {
    expect(leetcodeIsUsable(GOOD_LEETCODE)).toBe(true);
  });

  it('rejects an all-zero payload, which is what a throttled endpoint returns', () => {
    expect(leetcodeIsUsable(leetcode(0))).toBe(false);
  });

  it('rejects a breakdown that does not sum to the total', () => {
    // A partial response is more dangerous than no response: it looks authoritative.
    expect(leetcodeIsUsable(leetcode(242, 55, 151, 0))).toBe(false);
  });

  it('rejects a positive total with an empty breakdown', () => {
    expect(leetcodeIsUsable(leetcode(242))).toBe(false);
  });
});

describe('mergeSnapshot — the snapshot never gets worse', () => {
  it('keeps the stored value when the new count is lower', () => {
    const previous = snapshot();
    const { snapshot: result, warnings } = mergeSnapshot(previous, {
      fetchedAt: NOW,
      leetcode: section(leetcode(200, 50, 120, 30)),
      github: section(GOOD_GITHUB),
    });

    expect(result.leetcode?.data.total).toBe(242);
    expect(result.leetcode?.verifiedAt).toBe(EARLIER);
    expect(warnings.join(' ')).toMatch(/lower than the stored/);
  });

  it('keeps the stored value when the fetch returns zero', () => {
    const { snapshot: result, warnings } = mergeSnapshot(snapshot(), {
      fetchedAt: NOW,
      leetcode: section(leetcode(0)),
      github: section(GOOD_GITHUB),
    });

    expect(result.leetcode?.data.total).toBe(242);
    expect(warnings.join(' ')).toMatch(/unusable/);
  });

  it('keeps the stored value when the fetch fails entirely', () => {
    const { snapshot: result, warnings } = mergeSnapshot(snapshot(), {
      fetchedAt: NOW,
      leetcode: null,
      github: null,
    });

    expect(result.leetcode?.data).toEqual(GOOD_LEETCODE);
    expect(result.github?.data).toEqual(GOOD_GITHUB);
    expect(warnings).toHaveLength(2);
  });

  it('leaves the snapshot untouched apart from fetchedAt when every source fails', () => {
    const previous = snapshot();
    const { snapshot: result } = mergeSnapshot(previous, {
      fetchedAt: NOW,
      leetcode: null,
      github: null,
    });

    expect(result).toEqual({ ...previous, fetchedAt: NOW });
  });

  it('accepts a higher count and advances verifiedAt', () => {
    const { snapshot: result, warnings } = mergeSnapshot(snapshot(), {
      fetchedAt: NOW,
      leetcode: section(leetcode(250, 57, 155, 38)),
      github: section({ ...GOOD_GITHUB, publicRepos: 31 }),
    });

    expect(result.leetcode?.data.total).toBe(250);
    expect(result.leetcode?.verifiedAt).toBe(TODAY);
    expect(result.github?.data.publicRepos).toBe(31);
    expect(warnings).toEqual([]);
  });

  it('accepts an unchanged count', () => {
    const { snapshot: result, warnings } = mergeSnapshot(snapshot(), {
      fetchedAt: NOW,
      leetcode: section(GOOD_LEETCODE),
      github: section(GOOD_GITHUB),
    });

    expect(result.leetcode?.data.total).toBe(242);
    expect(warnings).toEqual([]);
  });

  it('rejects a lower count even when the breakdown is self-consistent', () => {
    // Self-consistency is not evidence of correctness. LeetCode has been observed
    // returning a smaller but coherent payload; the stored value still wins.
    const { snapshot: result } = mergeSnapshot(snapshot(), {
      fetchedAt: NOW,
      leetcode: section(leetcode(100, 20, 60, 20)),
      github: null,
    });

    expect(result.leetcode?.data.total).toBe(242);
  });

  it('takes the first good value when there is no previous snapshot', () => {
    const { snapshot: result, warnings } = mergeSnapshot(null, {
      fetchedAt: NOW,
      leetcode: section(GOOD_LEETCODE),
      github: section(GOOD_GITHUB),
    });

    expect(result.leetcode?.data).toEqual(GOOD_LEETCODE);
    expect(warnings).toEqual([]);
  });

  it('stores null, not a zero, when there is no previous snapshot and the fetch is bad', () => {
    // The UI must never render a zero, so the field is absent rather than 0.
    const { snapshot: result, warnings } = mergeSnapshot(null, {
      fetchedAt: NOW,
      leetcode: section(leetcode(0)),
      github: null,
    });

    expect(result.leetcode).toBeNull();
    expect(result.github).toBeNull();
    expect(warnings.join(' ')).toMatch(/no previous snapshot/);
  });

  it('degrades one source without touching the other', () => {
    const { snapshot: result } = mergeSnapshot(snapshot(), {
      fetchedAt: NOW,
      leetcode: null,
      github: section({ ...GOOD_GITHUB, publicRepos: 33 }),
    });

    expect(result.leetcode?.data.total).toBe(242);
    expect(result.github?.data.publicRepos).toBe(33);
  });
});

describe('chooseSection', () => {
  it('treats a section atomically rather than merging field by field', () => {
    // Taking the max of each field independently could leave a breakdown that does
    // not sum to its total. The whole previous section is kept instead.
    const previous = section(leetcode(242, 55, 151, 36), EARLIER);
    const incoming = section(leetcode(240, 60, 150, 30));

    const { section: chosen } = chooseSection(
      'leetcode',
      previous,
      incoming,
      leetcodeIsUsable,
      (s) => s.total,
    );

    expect(chosen).toBe(previous);
    expect(chosen?.data.easy).toBe(55);
  });
});

describe('the snapshot shape forbids activity data', () => {
  it('rejects a streak field', () => {
    const withStreak = { ...snapshot(), streak: 12 };
    expect(statsSnapshotSchema.safeParse(withStreak).success).toBe(false);
  });

  it('rejects a submission calendar on a section', () => {
    const withCalendar = snapshot({
      leetcode: {
        data: { ...GOOD_LEETCODE, submissionCalendar: {} },
        verifiedAt: TODAY,
      } as never,
    });
    expect(statsSnapshotSchema.safeParse(withCalendar).success).toBe(false);
  });

  it('rejects a last-active date', () => {
    const withLastActive = snapshot({
      github: {
        data: { ...GOOD_GITHUB, lastActiveAt: TODAY },
        verifiedAt: TODAY,
      } as never,
    });
    expect(statsSnapshotSchema.safeParse(withLastActive).success).toBe(false);
  });

  it('has no Codeforces field to populate', () => {
    const withCodeforces = { ...snapshot(), codeforces: { rating: 1250 } };
    expect(statsSnapshotSchema.safeParse(withCodeforces).success).toBe(false);
  });
});

describe('parseSnapshot', () => {
  it('returns null for a malformed file rather than throwing', () => {
    expect(parseSnapshot({ nonsense: true })).toBeNull();
    expect(parseSnapshot(null)).toBeNull();
  });

  it('round-trips a valid snapshot', () => {
    const valid = snapshot();
    expect(parseSnapshot(JSON.parse(JSON.stringify(valid)))).toEqual(valid);
  });
});

describe('hand-entered GeeksforGeeks figures', () => {
  it('has a breakdown that sums to the stated total', () => {
    // These are typed in by hand rather than fetched, so this arithmetic check is
    // the only automated defence against a typo.
    expect(geeksforgeeksBreakdownSums()).toBe(true);
  });

  it('records when the figures were verified', () => {
    expect(profile.geeksforgeeks.verifiedOn).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it('agrees with the proof strip, which claims 950+ across both platforms', () => {
    // 719 GeeksforGeeks + 242 LeetCode = 961, so "950+" is true and conservative.
    const claimed = 950;
    const actual = profile.geeksforgeeks.total + 242;
    expect(actual).toBeGreaterThanOrEqual(claimed);
  });
});

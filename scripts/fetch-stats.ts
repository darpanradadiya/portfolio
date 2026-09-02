/**
 * Fetch coding-profile statistics and write data/stats.json.
 *
 * Runs in CI, never in the browser: CORS blocks most of these endpoints, the
 * limits are per-IP, and LeetCode's endpoint is undocumented and can change or
 * throttle without notice. The committed snapshot is what the site renders, so a
 * visitor never waits on a third party and never sees a spinner or a zero.
 *
 * The merge rule lives in src/lib/stats.ts and is unit-tested: a fetch that
 * returns nothing, zeroes, an inconsistent breakdown, or a lower count than the
 * stored one leaves the snapshot alone. This script only does I/O.
 *
 * Three deliberate omissions, all from the brief:
 *   - No activity or recency data is requested or stored. There is no field for a
 *     streak, a submission calendar, or a last-active date.
 *   - Codeforces is queried only to confirm the handle still resolves. The rating
 *     is neither stored nor logged: this repository is public, so a CI log is
 *     published output.
 *   - GeeksforGeeks has no public API. Its figures are hand-entered constants in
 *     profile.ts with the date they were verified.
 *
 * Warnings do not fail the run. Keeping good data is the designed outcome, not an
 * error — but every rejection is logged loudly enough to notice in CI.
 */

import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { profile } from '../src/content/profile';
import {
  githubStatsSchema,
  leetcodeStatsSchema,
  mergeSnapshot,
  parseSnapshot,
  type GithubStats,
  type LeetcodeStats,
  type Section,
} from '../src/lib/stats';

const ROOT = process.cwd();
const SNAPSHOT_PATH = join(ROOT, 'data', 'stats.json');
const USER_AGENT =
  'darpanradadiya-portfolio-stats/1.0 (+https://github.com/darpanradadiya/portfolio)';
const TIMEOUT_MS = 15_000;

const today = (): string => new Date().toISOString().slice(0, 10);

async function getJson(url: string, init: RequestInit = {}): Promise<unknown> {
  const response = await fetch(url, {
    ...init,
    headers: { 'user-agent': USER_AGENT, accept: 'application/json', ...init.headers },
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });
  if (!response.ok) {
    throw new Error(`${url} responded ${response.status}`);
  }
  return response.json();
}

/* ------------------------------------------------------------------ GitHub -- */

type GithubRepo = {
  stargazers_count?: number;
  language?: string | null;
  fork?: boolean;
};

async function fetchGithub(): Promise<Section<GithubStats> | null> {
  const login = profile.links.github.handle;
  if (login === null) return null;

  const token = process.env.GITHUB_TOKEN;
  const headers: Record<string, string> = token
    ? { authorization: `Bearer ${token}` }
    : {};

  try {
    const user = (await getJson(`https://api.github.com/users/${login}`, {
      headers,
    })) as {
      public_repos?: number;
    };

    const repos: GithubRepo[] = [];
    for (let page = 1; page <= 4; page += 1) {
      const batch = (await getJson(
        `https://api.github.com/users/${login}/repos?per_page=100&type=owner&page=${page}`,
        { headers },
      )) as GithubRepo[];
      repos.push(...batch);
      if (batch.length < 100) break;
    }

    const owned = repos.filter((repo) => repo.fork !== true);
    const stars = owned.reduce((total, repo) => total + (repo.stargazers_count ?? 0), 0);

    // Language counted by repository, not by bytes or by recency.
    const tally = new Map<string, number>();
    for (const repo of owned) {
      if (typeof repo.language === 'string' && repo.language.length > 0) {
        tally.set(repo.language, (tally.get(repo.language) ?? 0) + 1);
      }
    }
    const topLanguages = [...tally.entries()]
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
      .slice(0, 6)
      .map(([name, repoCount]) => ({ name, repoCount }));

    const data = githubStatsSchema.parse({
      publicRepos: user.public_repos ?? owned.length,
      stars,
      topLanguages,
    });

    console.log(`  github     ${data.publicRepos} public repos, ${data.stars} stars`);
    return { data, verifiedAt: today() };
  } catch (error) {
    console.warn(`  github     fetch failed: ${(error as Error).message}`);
    return null;
  }
}

/* ---------------------------------------------------------------- LeetCode -- */

const LEETCODE_QUERY = `
  query userProblemsSolved($username: String!) {
    matchedUser(username: $username) {
      submitStatsGlobal {
        acSubmissionNum {
          difficulty
          count
        }
      }
    }
  }
`;

async function fetchLeetcode(): Promise<Section<LeetcodeStats> | null> {
  const username = profile.links.leetcode.handle;
  if (username === null) return null;

  try {
    const payload = (await getJson('https://leetcode.com/graphql', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        referer: `https://leetcode.com/u/${username}/`,
      },
      body: JSON.stringify({ query: LEETCODE_QUERY, variables: { username } }),
    })) as {
      data?: {
        matchedUser?: {
          submitStatsGlobal?: {
            acSubmissionNum?: { difficulty: string; count: number }[];
          };
        } | null;
      };
    };

    const buckets = payload.data?.matchedUser?.submitStatsGlobal?.acSubmissionNum;
    if (buckets === undefined) {
      throw new Error('response did not contain acSubmissionNum');
    }

    const at = (difficulty: string): number =>
      buckets.find((bucket) => bucket.difficulty === difficulty)?.count ?? 0;

    const data = leetcodeStatsSchema.parse({
      total: at('All'),
      easy: at('Easy'),
      medium: at('Medium'),
      hard: at('Hard'),
    });

    console.log(
      `  leetcode   ${data.total} solved (easy ${data.easy}, medium ${data.medium}, hard ${data.hard})`,
    );
    return { data, verifiedAt: today() };
  } catch (error) {
    console.warn(`  leetcode   fetch failed: ${(error as Error).message}`);
    return null;
  }
}

/* -------------------------------------------------------------- Codeforces -- */

/**
 * A liveness check, not a data source. Confirms the profile the site links to
 * still exists, so a dead link surfaces in CI. Nothing is returned, stored, or
 * logged: the rating is deliberately not rendered anywhere, and this repository is
 * public, so printing it to a CI log would publish it just as surely as the page.
 */
async function checkCodeforcesLink(): Promise<void> {
  const handle = profile.links.codeforces.handle;
  if (handle === null) return;

  try {
    const payload = (await getJson(
      `https://codeforces.com/api/user.info?handles=${handle}`,
    )) as { status?: string; result?: unknown[] };

    if (
      payload.status === 'OK' &&
      Array.isArray(payload.result) &&
      payload.result.length > 0
    ) {
      console.log(
        '  codeforces handle resolves (link only; no figures stored or logged)',
      );
    } else {
      console.warn('  codeforces handle did NOT resolve — the outbound link may be dead');
    }
  } catch (error) {
    console.warn(`  codeforces check failed: ${(error as Error).message}`);
  }
}

/* -------------------------------------------------------------------- main -- */

function readExisting(): ReturnType<typeof parseSnapshot> {
  try {
    return parseSnapshot(JSON.parse(readFileSync(SNAPSHOT_PATH, 'utf8')));
  } catch {
    return null;
  }
}

async function main(): Promise<void> {
  console.log('Fetching coding-profile statistics\n');

  const previous = readExisting();
  if (previous === null) {
    console.log('  (no usable existing snapshot — this run establishes the baseline)');
  }

  const [github, leetcode] = await Promise.all([fetchGithub(), fetchLeetcode()]);
  await checkCodeforcesLink();

  const { snapshot, warnings } = mergeSnapshot(previous, {
    fetchedAt: new Date().toISOString(),
    github,
    leetcode,
  });

  if (warnings.length > 0) {
    console.warn('\nRejected data — the stored snapshot was kept:');
    for (const warning of warnings) {
      console.warn(`  ! ${warning}`);
    }
  }

  mkdirSync(dirname(SNAPSHOT_PATH), { recursive: true });
  writeFileSync(SNAPSHOT_PATH, `${JSON.stringify(snapshot, null, 2)}\n`);

  console.log(`\nWrote data/stats.json (fetchedAt ${snapshot.fetchedAt})`);
  if (snapshot.leetcode === null && snapshot.github === null) {
    console.warn(
      'Every section is empty. The /code page will omit those elements rather',
    );
    console.warn('than render a zero, but this needs looking at.');
  }
}

main().catch((error: unknown) => {
  console.error('fetch-stats failed:', error);
  process.exit(1);
});

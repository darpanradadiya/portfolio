/**
 * Resolve every outbound URL the site commits to, and fail if one is dead.
 *
 * This replaces `fetch-stats.ts`, which fetched coding-profile figures into
 * `data/stats.json` for a page to render. No figure from any coding profile
 * renders anywhere now, so the fetch was writing data nothing read, and
 * committing it to a public repository on a daily schedule. The snapshot, its
 * schema, its merge rule and its Zod validation are all gone with it.
 *
 * One purpose survived the strip: link health. The old script already queried
 * Codeforces purely to confirm the handle resolved, because the rating was never
 * rendered. Every URL in the JSON-LD `sameAs` deserves that same check, and so
 * does every repository row on /projects: a `sameAs` pointing at a deleted
 * profile breaks entity resolution silently, and a repository row that 404s is
 * worse than no row.
 *
 * Writes nothing. Exits non-zero only when a URL is definitely gone, so the
 * schedule is a monitor rather than a data pipeline.
 *
 * THREE STATES, NOT TWO. This is the whole design, and the first run is why.
 * LinkedIn answered 999, LeetCode and Codeforces answered 403, and all three
 * work perfectly in a browser: those codes mean "we do not serve robots", which
 * is not evidence about the link. A monitor that goes red every night for a
 * reason nobody can fix is a monitor nobody reads, so a refusal is reported and
 * not failed on. Only 404 and 410 fail the build, because only those mean the
 * profile or the repository is actually gone.
 *
 * That distinction is also why the script this replaced appeared to work: it
 * checked Codeforces through its JSON API rather than its profile URL, so it
 * never met the refusal. The API route is not available for every platform here,
 * and special-casing each one is more surface than the check is worth.
 *
 * Two things this deliberately does not do:
 *   - It stores and logs no figure from any response. This repository is public,
 *     so a CI log is published output.
 *   - It does not follow a 200 into the page body. Whether the profile still
 *     shows what it used to is not something a status code can answer, and
 *     nothing here depends on it.
 */

import { sameAsUrls } from '../src/content/profile';
import { REPOSITORIES } from '../src/content/repositories';
import { getAllProjects } from '../src/lib/projects';

/*
 * Two timeouts, because a free-tier host that has gone to sleep is not a dead
 * link. The launch audit found the clinic's demo timing out at 15s and answering
 * in 0.2s once awake: the first request pays for the cold start. HEAD gets the
 * short budget, and the GET that decides the verdict gets a long one.
 */
const TIMEOUT_MS = 15_000;
const PATIENT_TIMEOUT_MS = 75_000;
const USER_AGENT =
  'darpanradadiya-portfolio-linkcheck/1.0 (+https://github.com/darpanradadiya/portfolio)';

type Target = { label: string; url: string };
/** `blocked` is a refusal to serve a robot, and `unreachable` a network fault. */
type State = 'alive' | 'gone' | 'blocked' | 'unreachable';
type Result = Target & { state: State; detail: string };

/** Codes that mean the host declined to answer a script, not that the URL is gone. */
const REFUSALS = new Set([401, 403, 405, 406, 429, 999]);

function classify(status: number): State {
  if (status < 400) return 'alive';
  if (status === 404 || status === 410) return 'gone';
  if (REFUSALS.has(status)) return 'blocked';
  // Anything else, a 500 included, is the host's problem rather than the URL's.
  return 'blocked';
}

/**
 * HEAD first, then GET. Several of these hosts answer HEAD with 403 or 405 while
 * serving the page perfectly well, so a HEAD refusal is inconclusive and GET is
 * the tie-breaker. `redirect: 'follow'` is deliberate: a profile URL that
 * redirects is still a working link.
 */
async function resolve(url: string): Promise<{ state: State; detail: string }> {
  let last: { state: State; detail: string } = {
    state: 'unreachable',
    detail: 'no response',
  };

  for (const method of ['HEAD', 'GET'] as const) {
    const controller = new AbortController();
    const budget = method === 'GET' ? PATIENT_TIMEOUT_MS : TIMEOUT_MS;
    const timer = setTimeout(() => controller.abort(), budget);
    try {
      const response = await fetch(url, {
        method,
        redirect: 'follow',
        headers: { 'user-agent': USER_AGENT },
        signal: controller.signal,
      });
      const state = classify(response.status);
      last = { state, detail: `${method} ${response.status}` };
      // A 404 from HEAD is as final as one from GET; only a refusal is worth retrying.
      if (state === 'alive' || state === 'gone') return last;
    } catch (error) {
      last = { state: 'unreachable', detail: (error as Error).message };
    } finally {
      clearTimeout(timer);
    }
  }

  return last;
}

async function main(): Promise<void> {
  /*
   * Every URL a visitor can click, not just the ones in the entity graph. The
   * case-study repository and demo links were the gap the launch audit found: a
   * demo is the single most likely link on the site to rot, because it is the only
   * one that depends on something staying deployed.
   */
  const projects = getAllProjects();
  const targets: Target[] = [
    ...sameAsUrls().map((url) => ({ label: 'sameAs', url })),
    ...REPOSITORIES.map((repository) => ({
      label: 'repository',
      url: repository.url,
    })),
    ...projects.flatMap((project) => [
      ...(project.repo === null
        ? []
        : [{ label: `repo:${project.slug.slice(0, 12)}`, url: project.repo }]),
      ...(project.demo === null
        ? []
        : [{ label: `demo:${project.slug.slice(0, 12)}`, url: project.demo }]),
    ]),
  ];

  console.log(`Checking ${targets.length} outbound URLs\n`);

  const results: Result[] = await Promise.all(
    targets.map(async (target) => ({ ...target, ...(await resolve(target.url)) })),
  );

  const MARKS: Record<State, string> = {
    alive: 'ok     ',
    gone: 'GONE   ',
    blocked: 'blocked',
    unreachable: 'NO REPLY',
  };

  for (const result of results) {
    console.log(
      `  ${MARKS[result.state]} ${result.label.padEnd(19)} ${result.url}  (${result.detail})`,
    );
  }

  const gone = results.filter((result) => result.state === 'gone');
  const unreachable = results.filter((result) => result.state === 'unreachable');
  const blocked = results.filter((result) => result.state === 'blocked');

  if (blocked.length > 0) {
    console.log(
      `\n  ${blocked.length} host(s) declined to answer a script. Not a failure: ` +
        'those URLs work in a browser.',
    );
  }

  const failures = [...gone, ...unreachable];
  if (failures.length > 0) {
    console.error(`\n  ${failures.length} of ${results.length} URLs did not resolve.`);
    for (const failure of failures) {
      console.error(`    ${failure.url}  ${failure.detail}`);
    }
    console.error(
      '\n  A sameAs URL breaks entity resolution silently; a repository row 404s for\n' +
        '  every visitor. Fix the URL or remove the entry.\n',
    );
    process.exit(1);
  }

  console.log(
    `\n  no dead URLs (${results.length - blocked.length} of ${results.length} confirmed alive)`,
  );
}

// Not top-level await: tsx transpiles this module to CJS, where it is a syntax
// error. Same constraint the mono guard documents for import.meta.
main().catch((error: unknown) => {
  console.error(`\n  link check crashed: ${(error as Error).message}`);
  process.exit(1);
});

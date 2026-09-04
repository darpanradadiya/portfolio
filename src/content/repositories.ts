/**
 * Every other public repository worth a reader's time, one line each.
 *
 * Five projects have case studies. This is the rest of the account, at the density
 * it deserves: a name, what the code does, the language, and a link. Anyone who
 * wants more can open the repository, which is the point of listing it at all.
 *
 * Three rules, enforced in the unit tests rather than trusted to memory:
 *
 *   1. No numbers. Not stars, not commits, not lines. A count of anything here
 *      would be a fact about GitHub rather than about the work.
 *   2. Under fifteen words. The section exists to be scanned, not read.
 *   3. Every URL is checked for a 200 by `scripts/check-links.ts`, on the same
 *      schedule as the profile links. A row that 404s is worse than no row.
 *
 * The one-liners are written from the source, not from the repository description.
 * Most of these have no README at all, and the two that do describe something
 * other than what the code turned out to be.
 *
 * What is deliberately absent, and why, because the omissions are the harder half:
 *
 *   - Four private repositories (clipper-and-poster, movie-reel-pipeline,
 *     fuelr-game-day-meals, and Carbon Record's own repository). A row here is a
 *     link, and a link to a private repository is a 404 for every visitor.
 *   - Eight lab repositories, each containing a single markdown write-up and no
 *     code, plus one empty repository and the empty profile-config repository.
 *   - Tutorial and exercise output: a forked Udemy course, a Node.js exercise
 *     collection, a file-sorting script that also exists inside it, a localStorage
 *     Kanban board, and a first HTML page.
 *   - GroupShare, which is `firebase init` output. The cloud function is the
 *     untouched template with every line commented out, the Firestore rules are
 *     deny-all, and the hosting page is the default welcome screen.
 *   - Two Los Angeles foot-traffic dashboards. The analysis is real, but both read
 *     their data from absolute paths on one laptop and the data is not in either
 *     repository, so neither runs for anyone else.
 *   - Ecommerce_platform, whose README describes a named cafe in Sri Lanka. That
 *     matches nothing else in the account, and on a site whose argument is that
 *     every claim can be checked, an unverifiable one is worse than a gap.
 *   - This repository, already linked in the footer of every page.
 */

export type Repository = {
  readonly name: string;
  readonly url: string;
  /** What the code does, from the code. Under fifteen words, no numbers. */
  readonly line: string;
  /** The language the source is actually in, not GitHub's linguist guess. */
  readonly language: string;
};

export const GITHUB_ACCOUNT = 'https://github.com/darpanradadiya';

/** Newest first, which is also roughly strongest first. */
export const REPOSITORIES: readonly Repository[] = [
  {
    name: 'GB-Cyclist-Accidents-Dashboard',
    url: `${GITHUB_ACCOUNT}/GB-Cyclist-Accidents-Dashboard`,
    line: 'Joins UK casualty and collision records to compare injury severity',
    language: 'Python',
  },
  {
    name: 'medicare-opioid-dashboard',
    url: `${GITHUB_ACCOUNT}/medicare-opioid-dashboard`,
    line: 'Streamlit views over CMS Medicare Part D prescribing records',
    language: 'Python',
  },
  {
    name: 'Super_store_analysis_Rshiny_app',
    url: `${GITHUB_ACCOUNT}/Super_store_analysis_Rshiny_app`,
    line: 'Retail sales Shiny app with ARIMA forecast and interactive map',
    language: 'R',
  },
  {
    name: 'BCG_Dashboard',
    url: `${GITHUB_ACCOUNT}/BCG_Dashboard`,
    line: 'Deal pipeline dashboard with a logistic-regression outcome model',
    language: 'Python',
  },
  {
    name: 'Weather_Monitoring_System',
    url: `${GITHUB_ACCOUNT}/Weather_Monitoring_System`,
    line: 'Express dashboard over seeded Mongo sensor readings',
    language: 'JavaScript',
  },
  {
    name: 'Art_Gallery',
    url: `${GITHUB_ACCOUNT}/Art_Gallery`,
    line: 'Express and EJS CRUD over artworks, buyers and stock queries',
    language: 'JavaScript',
  },
];

/** The word budget from the module comment, as a number the tests can use. */
export const MAX_REPOSITORY_LINE_WORDS = 15;

export function repositoryLineWords(line: string): number {
  return line.trim().split(/\s+/).length;
}

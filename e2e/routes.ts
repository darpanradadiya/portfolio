import { getAllProjects } from '../src/lib/projects';

/**
 * Every page the site serves.
 *
 * The project routes are derived from the same loader the site uses rather than
 * listed by hand. A hand-kept copy drifts: removing a case study once left this
 * file asserting a 200 on a route that had become a 404, and the suite failed for
 * a reason that had nothing to do with the site being broken.
 */
const PROJECT_ROUTES = getAllProjects().map((project) => `/projects/${project.slug}`);

export const PAGE_ROUTES = [
  '/',
  '/projects',
  ...PROJECT_ROUTES,
  '/about',
  '/resume',
  '/contact',
] as const;

export const FILE_ROUTES = [
  '/robots.txt',
  '/sitemap.xml',
  '/llms.txt',
  '/icon.svg',
  '/Darpan_Radadiya_Resume.pdf',
] as const;

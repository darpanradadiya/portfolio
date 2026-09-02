/**
 * Site-wide configuration.
 *
 * The canonical origin comes from `SITE_URL`, so pointing the site at a custom
 * domain is a Vercel dashboard change plus a redeploy — not a commit.
 *
 *   SITE_URL=https://darpanradadiya.com
 *
 * One caveat worth knowing: every page is statically prerendered, so this value is
 * read at build time. Changing it in the dashboard needs a redeploy to take
 * effect. That is one click, but it is not instant.
 *
 * The fallback is the current production URL rather than localhost, so a build
 * that somehow loses the variable still emits correct canonical tags, sitemap
 * entries, and Open Graph URLs instead of pointing search engines at a dev
 * server. For local work with local canonicals, set SITE_URL=http://localhost:3000.
 *
 * Deliberately not VERCEL_URL: that changes on every deployment, which would emit
 * canonical tags and sitemap entries pointing at preview builds.
 */

/** Current production origin. Replaced by SITE_URL once a domain is registered. */
const FALLBACK_SITE_URL = 'https://portfolio-black-five-67.vercel.app';

function resolveSiteUrl(): string {
  const configured = process.env.SITE_URL?.trim();
  if (configured !== undefined && configured.length > 0) {
    return configured.replace(/\/+$/, '');
  }
  return FALLBACK_SITE_URL;
}

export const SITE_URL = resolveSiteUrl();

/** True when the canonical origin is still the platform-assigned fallback. */
export const SITE_URL_IS_FALLBACK = SITE_URL === FALLBACK_SITE_URL;

export const SITE = {
  url: SITE_URL,
  /** Used as the `%s | ...` template suffix and in structured data. */
  name: 'Darpan Radadiya',
  locale: 'en_US',
} as const;

/** Absolute URL for a site-relative path. */
export function absoluteUrl(path: string): string {
  return new URL(path, `${SITE_URL}/`).toString();
}

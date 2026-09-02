/**
 * Site-wide configuration.
 *
 * `SITE_URL` is the single place the canonical origin is defined — swapping in a
 * custom domain is one edit here, or one environment variable. Resolution order:
 *
 *   1. NEXT_PUBLIC_SITE_URL      — set this once the domain is registered
 *   2. VERCEL_PROJECT_PRODUCTION_URL — the stable production URL, not the per-deploy one
 *   3. localhost                 — development
 *
 * Deliberately not VERCEL_URL: that changes on every deployment, which would emit
 * canonical tags and sitemap entries pointing at preview deployments.
 */

function resolveSiteUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL;
  if (explicit) return explicit.replace(/\/+$/, '');

  const production = process.env.VERCEL_PROJECT_PRODUCTION_URL;
  if (production) return `https://${production}`;

  return 'http://localhost:3000';
}

export const SITE_URL = resolveSiteUrl();

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

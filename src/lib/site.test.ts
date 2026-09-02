import { afterEach, describe, expect, it, vi } from 'vitest';

/**
 * SITE_URL is resolved once at module load, so each case re-imports the module
 * with a fresh environment.
 */
async function loadSite(siteUrl?: string) {
  vi.resetModules();
  if (siteUrl === undefined) {
    delete process.env.SITE_URL;
  } else {
    process.env.SITE_URL = siteUrl;
  }
  return import('./site');
}

const ORIGINAL = process.env.SITE_URL;

afterEach(() => {
  if (ORIGINAL === undefined) delete process.env.SITE_URL;
  else process.env.SITE_URL = ORIGINAL;
});

describe('SITE_URL', () => {
  it('uses SITE_URL when it is set', async () => {
    const { SITE_URL, SITE_URL_IS_FALLBACK } = await loadSite(
      'https://darpanradadiya.com',
    );
    expect(SITE_URL).toBe('https://darpanradadiya.com');
    expect(SITE_URL_IS_FALLBACK).toBe(false);
  });

  it('strips a trailing slash, so absolute URLs never double up', async () => {
    const { absoluteUrl } = await loadSite('https://darpanradadiya.com/');
    expect(absoluteUrl('/projects')).toBe('https://darpanradadiya.com/projects');
  });

  it('ignores an empty or whitespace-only value', async () => {
    const { SITE_URL_IS_FALLBACK } = await loadSite('   ');
    expect(SITE_URL_IS_FALLBACK).toBe(true);
  });

  it('falls back to the production URL, never to localhost', async () => {
    // A build that loses the variable must not point search engines at a dev server.
    const { SITE_URL } = await loadSite(undefined);
    expect(SITE_URL).toMatch(/^https:\/\//);
    expect(SITE_URL).not.toContain('localhost');
  });

  it('builds absolute URLs for the routes that need them', async () => {
    const { absoluteUrl } = await loadSite('https://example.com');
    expect(absoluteUrl('/')).toBe('https://example.com/');
    expect(absoluteUrl('/sitemap.xml')).toBe('https://example.com/sitemap.xml');
    expect(absoluteUrl('/projects/carbon-record-automation')).toBe(
      'https://example.com/projects/carbon-record-automation',
    );
  });
});

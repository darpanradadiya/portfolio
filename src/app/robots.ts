import type { MetadataRoute } from 'next';
import { absoluteUrl } from '@/lib/site';

/**
 * AI crawlers are allowed deliberately.
 *
 * Structured data plus an open crawl policy is how an assistant answering "who is
 * Darpan Radadiya?" gets the answer from this site rather than from an inference.
 * The named agents are listed explicitly as well as covered by the wildcard,
 * because Google-Extended in particular is only ever consulted by name.
 */
export default function robots(): MetadataRoute.Robots {
  const allowAll = { allow: '/', disallow: [] as string[] };

  return {
    rules: [
      { userAgent: '*', ...allowAll },
      { userAgent: 'GPTBot', ...allowAll },
      { userAgent: 'ClaudeBot', ...allowAll },
      { userAgent: 'Claude-Web', ...allowAll },
      { userAgent: 'PerplexityBot', ...allowAll },
      { userAgent: 'Google-Extended', ...allowAll },
      { userAgent: 'Applebot-Extended', ...allowAll },
      { userAgent: 'CCBot', ...allowAll },
    ],
    sitemap: absoluteUrl('/sitemap.xml'),
    host: absoluteUrl('/'),
  };
}

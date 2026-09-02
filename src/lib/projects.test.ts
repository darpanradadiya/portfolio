import { describe, expect, it } from 'vitest';
import {
  MAX_DOCUMENT_TITLE,
  MAX_SEO_TITLE,
  SUMMARY_MAX,
  SUMMARY_MIN,
  TITLE_SUFFIX,
  displayTitle,
  documentTitle,
  projectFrontmatterSchema,
  summaryLengthWarning,
  type Project,
} from './projects';

const BASE = {
  title: 'Carbon Record Automation',
  outcomeTitle: null,
  seoTitle: null,
  summary: null,
  featured: true,
  order: 1,
  role: null,
  timeframe: null,
  stack: ['Python'],
  domains: ['ML pipelines'],
  metrics: [],
  repo: null,
  demo: null,
  screenshot: null,
  dataNote: null,
};

const parse = (over: Record<string, unknown> = {}) =>
  projectFrontmatterSchema.safeParse({ ...BASE, ...over });

const seoTitleIssues = (result: ReturnType<typeof parse>) =>
  result.success
    ? []
    : result.error.issues.filter((issue) => issue.path[0] === 'seoTitle');

/** A string of exactly `length` characters. */
const chars = (length: number) => 'x'.repeat(length);

describe('the title budget', () => {
  it('derives the suffix from the site name rather than hardcoding it', () => {
    // Renaming the site cannot silently invalidate the budget.
    expect(TITLE_SUFFIX).toBe(' | Darpan Radadiya');
    expect(MAX_SEO_TITLE).toBe(MAX_DOCUMENT_TITLE - TITLE_SUFFIX.length);
    expect(MAX_SEO_TITLE).toBe(42);
  });
});

describe('seoTitle is required exactly when it is needed', () => {
  it('is not required when outcomeTitle is null', () => {
    expect(parse().success).toBe(true);
  });

  it('is not required when outcomeTitle fits the budget', () => {
    expect(parse({ outcomeTitle: chars(MAX_SEO_TITLE) }).success).toBe(true);
  });

  it('is required the moment outcomeTitle exceeds the budget', () => {
    const result = parse({ outcomeTitle: chars(MAX_SEO_TITLE + 1) });
    expect(result.success).toBe(false);
    expect(seoTitleIssues(result)[0]?.message).toMatch(/is required/);
  });

  it('is satisfied by a short seoTitle alongside a long outcomeTitle', () => {
    const result = parse({
      outcomeTitle: 'Turning feature-length video into per-character reels, unattended',
      seoTitle: 'Per-character reels from long-form video',
    });
    expect(result.success).toBe(true);
  });

  it("requires one for the brief's own example of a good outcome title", () => {
    // 65 characters, which would render an 83-character document title.
    const example = 'Turning feature-length video into per-character reels, unattended';
    expect(example.length).toBeGreaterThan(MAX_SEO_TITLE);
    expect(parse({ outcomeTitle: example }).success).toBe(false);
  });

  it('leaves outcomeTitle alone — the heading is not shortened', () => {
    const long = 'Turning feature-length video into per-character reels, unattended';
    const result = parse({
      outcomeTitle: long,
      seoTitle: 'Per-character reels, unattended',
    });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.outcomeTitle).toBe(long);
  });
});

describe('seoTitle cannot itself overflow the budget', () => {
  it('accepts one at exactly the limit', () => {
    expect(parse({ seoTitle: chars(MAX_SEO_TITLE) }).success).toBe(true);
  });

  it('rejects one a single character over', () => {
    const result = parse({ seoTitle: chars(MAX_SEO_TITLE + 1) });
    expect(result.success).toBe(false);
    expect(seoTitleIssues(result)[0]?.message).toMatch(/characters or fewer/);
  });

  it('reports the document title length the overflow would produce', () => {
    const result = parse({ seoTitle: chars(50) });
    expect(seoTitleIssues(result)[0]?.message).toContain(
      String(50 + TITLE_SUFFIX.length),
    );
  });

  it('rejects an over-long seoTitle even when it was mandatory', () => {
    // Supplying the field is not enough; it has to actually be short.
    const result = parse({
      outcomeTitle: chars(MAX_SEO_TITLE + 10),
      seoTitle: chars(MAX_SEO_TITLE + 5),
    });
    expect(result.success).toBe(false);
  });

  it('requires the key to be present, not merely optional', () => {
    // An omitted field gets forgotten; a key you have to write is one you think about.
    const withoutKey: Record<string, unknown> = { ...BASE };
    Reflect.deleteProperty(withoutKey, 'seoTitle');
    expect(projectFrontmatterSchema.safeParse(withoutKey).success).toBe(false);
  });
});

describe('title selection', () => {
  const project = (over: Partial<Project>): Project =>
    ({ ...BASE, slug: 'x', body: '', ...over }) as Project;

  it('uses the project name when no outcome title is written', () => {
    expect(displayTitle(project({}))).toBe('Carbon Record Automation');
    expect(documentTitle(project({}))).toBe('Carbon Record Automation');
  });

  it('uses outcomeTitle for the heading and for the title when no short form exists', () => {
    const p = project({ outcomeTitle: 'Reels from long video' });
    expect(displayTitle(p)).toBe('Reels from long video');
    expect(documentTitle(p)).toBe('Reels from long video');
  });

  it('splits them once a short form exists', () => {
    const p = project({
      outcomeTitle: 'Turning feature-length video into per-character reels, unattended',
      seoTitle: 'Per-character reels from long video',
    });
    expect(displayTitle(p)).toBe(
      'Turning feature-length video into per-character reels, unattended',
    );
    expect(documentTitle(p)).toBe('Per-character reels from long video');
    expect(documentTitle(p).length + TITLE_SUFFIX.length).toBeLessThanOrEqual(
      MAX_DOCUMENT_TITLE,
    );
  });
});

describe('summaryLengthWarning warns but never blocks', () => {
  it('is silent for a summary in range', () => {
    expect(summaryLengthWarning('slug', chars(SUMMARY_MIN))).toBeNull();
    expect(summaryLengthWarning('slug', chars(SUMMARY_MAX))).toBeNull();
    expect(summaryLengthWarning('slug', chars(145))).toBeNull();
  });

  it('is silent when there is no summary yet', () => {
    expect(summaryLengthWarning('slug', null)).toBeNull();
  });

  it('notes a short summary', () => {
    const warning = summaryLengthWarning('slug', chars(SUMMARY_MIN - 1));
    expect(warning).toMatch(/short of the 130-160/);
    expect(warning).toMatch(/Not an error/);
  });

  it('notes a long summary', () => {
    expect(summaryLengthWarning('slug', chars(SUMMARY_MAX + 1))).toMatch(
      /long of the 130-160/,
    );
  });

  it('does not make the schema reject an out-of-range summary', () => {
    // A short summary is worth shipping. Prose length never fails a build.
    expect(parse({ summary: 'Too short.' }).success).toBe(true);
    expect(parse({ summary: chars(400) }).success).toBe(true);
  });
});

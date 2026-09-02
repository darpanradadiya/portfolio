import { describe, expect, it } from 'vitest';
import { checkRateLimit, contactSchema, pruneHits, RATE_LIMIT } from './contact';

const NOW = 1_800_000_000_000;
const HOUR = 60 * 60 * 1000;

describe('contactSchema', () => {
  const valid = {
    name: 'Ada Lovelace',
    email: 'ada@example.com',
    message: 'I would like to talk to you about a data engineering role.',
  };

  it('accepts a well-formed submission', () => {
    expect(contactSchema.safeParse(valid).success).toBe(true);
  });

  it('trims whitespace rather than accepting a blank name', () => {
    expect(contactSchema.safeParse({ ...valid, name: '   ' }).success).toBe(false);
  });

  it('rejects a malformed address', () => {
    const result = contactSchema.safeParse({ ...valid, email: 'ada@' });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toMatch(/email address/);
    }
  });

  it('rejects a message too short to be worth sending', () => {
    expect(contactSchema.safeParse({ ...valid, message: 'hi' }).success).toBe(false);
  });

  it('rejects a filled honeypot', () => {
    // Hidden field: a human never sees it, so anything in it came from a bot.
    expect(contactSchema.safeParse({ ...valid, company: 'Acme' }).success).toBe(false);
  });

  it('accepts an absent or empty honeypot', () => {
    expect(contactSchema.safeParse({ ...valid, company: '' }).success).toBe(true);
    expect(contactSchema.safeParse(valid).success).toBe(true);
  });
});

describe('checkRateLimit', () => {
  it('allows a first submission', () => {
    const result = checkRateLimit([], NOW);
    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(RATE_LIMIT.maxPerWindow - 1);
  });

  it('allows submissions up to the limit', () => {
    expect(checkRateLimit([NOW - 1000, NOW - 2000], NOW).allowed).toBe(true);
  });

  it('blocks the submission past the limit', () => {
    const hits = [NOW - 1000, NOW - 2000, NOW - 3000];
    const result = checkRateLimit(hits, NOW);
    expect(result.allowed).toBe(false);
    expect(result.remaining).toBe(0);
  });

  it('reports how long to wait, based on the oldest hit in the window', () => {
    const hits = [NOW - HOUR + 5000, NOW - 1000, NOW - 2000];
    const result = checkRateLimit(hits, NOW);
    expect(result.allowed).toBe(false);
    expect(result.retryAfterSeconds).toBe(5);
  });

  it('never reports a zero-second wait', () => {
    const hits = [NOW - HOUR + 1, NOW, NOW];
    expect(checkRateLimit(hits, NOW).retryAfterSeconds).toBeGreaterThanOrEqual(1);
  });

  it('ignores hits that have aged out of the window', () => {
    const hits = [NOW - HOUR - 1, NOW - HOUR - 2, NOW - HOUR - 3];
    expect(checkRateLimit(hits, NOW).allowed).toBe(true);
  });

  it('allows again once the window has passed', () => {
    const hits = [NOW, NOW, NOW];
    expect(checkRateLimit(hits, NOW).allowed).toBe(false);
    expect(checkRateLimit(hits, NOW + HOUR + 1).allowed).toBe(true);
  });
});

describe('pruneHits', () => {
  it('drops aged-out timestamps so the store cannot grow without bound', () => {
    expect(pruneHits([NOW - HOUR - 1, NOW - 500], NOW)).toEqual([NOW - 500]);
  });

  it('keeps everything inside the window', () => {
    expect(pruneHits([NOW - 10, NOW - 20], NOW)).toHaveLength(2);
  });
});

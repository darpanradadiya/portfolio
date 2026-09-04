import { describe, expect, it } from 'vitest';
import {
  GITHUB_ACCOUNT,
  MAX_REPOSITORY_LINE_WORDS,
  REPOSITORIES,
  repositoryLineWords,
} from '@/content/repositories';

/**
 * The three rules in the repositories module comment, enforced rather than
 * trusted. Every one of them is a rule a future edit would break silently.
 */
describe('the repository list', () => {
  it('keeps every line inside the word budget', () => {
    // The section exists to be scanned. A line that has to be read is a line
    // that belongs in a case study instead.
    for (const repository of REPOSITORIES) {
      expect(repositoryLineWords(repository.line), repository.name).toBeLessThanOrEqual(
        MAX_REPOSITORY_LINE_WORDS,
      );
    }
  });

  it('renders no number in any line', () => {
    // Phase 2's rule, mechanically. Not stars, not commits, not lines of code.
    for (const repository of REPOSITORIES) {
      expect(repository.line, repository.name).not.toMatch(/\d/);
    }
  });

  it('points every row at the right account', () => {
    for (const repository of REPOSITORIES) {
      expect(repository.url, repository.name).toBe(
        `${GITHUB_ACCOUNT}/${repository.name}`,
      );
    }
  });

  it('lists no repository twice', () => {
    const names = REPOSITORIES.map((repository) => repository.name);
    expect(new Set(names).size).toBe(names.length);
  });

  it('does not duplicate a project that already has a case study', () => {
    // A case study and a one-line row are two claims about the same work, and
    // the row is the weaker one.
    const featured = [
      'healthcare-clinic-erp',
      'tesla-supercharger-dashboard',
      'Credit_card_Rshiny_app',
      'Bank_Term_Deposit_Prediction',
      'carbon-records-automation',
    ];
    for (const repository of REPOSITORIES) {
      expect(featured, repository.name).not.toContain(repository.name);
    }
  });

  it('gives every row a language', () => {
    for (const repository of REPOSITORIES) {
      expect(repository.language.trim().length, repository.name).toBeGreaterThan(0);
    }
  });
});

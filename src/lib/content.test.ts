import { describe, expect, it } from 'vitest';
import { profile, workPrincipleIdsAreUnique } from '@/content/profile';
import { CLINIC_RELATIONSHIPS, CLINIC_TABLES } from '@/content/clinic-schema';

/**
 * Invariants over the typed content layer.
 *
 * These used to live at the bottom of stats.test.ts, which has been deleted with
 * the coding-profile snapshot it tested. They are not about statistics; they are
 * about claims on pages agreeing with the data those claims cite.
 */

describe('the proof strip', () => {
  /*
   * The GeeksforGeeks arithmetic tests that used to guard the hand-entered
   * figures are gone with the figures. This is their replacement, and it is a
   * stronger check: the old one confirmed a hand-typed breakdown added up to its
   * own total, this one confirms the claim on the busiest page of the site
   * matches the schema it cites.
   */
  const cell = (label: string) => {
    const found = profile.proof.find((point) => point.label === label);
    if (found === undefined) throw new Error(`no proof cell labelled "${label}"`);
    return found;
  };

  it('claims exactly as many clinic tables as the schema has', () => {
    expect(cell('tables in 3NF').value).toBe(String(CLINIC_TABLES.length));
  });

  it('cites the number of relationships the schema actually declares', () => {
    expect(cell('tables in 3NF').provenance).toContain(
      `${CLINIC_RELATIONSHIPS.length} enforced relationships`,
    );
  });

  it('has an enforcement reason recorded for every relationship it counts', () => {
    // "enforced" is the load-bearing word in that provenance line.
    for (const relationship of CLINIC_RELATIONSHIPS) {
      expect(
        relationship.enforcedBy.length,
        `${relationship.from} to ${relationship.to}`,
      ).toBeGreaterThan(0);
    }
  });

  it('renders no coding-profile figure', () => {
    // No problem count, difficulty split or platform ranking, anywhere.
    const platforms = ['geeksforgeeks', 'leetcode', 'codeforces', 'problems solved'];
    for (const point of profile.proof) {
      const haystack = `${point.label} ${point.provenance}`.toLowerCase();
      for (const platform of platforms) {
        expect(haystack, `${point.value} ${point.label}`).not.toContain(platform);
      }
    }
  });
});

describe('"How I work" anchors', () => {
  it('gives every principle a unique id', () => {
    // The home page links to /about#<id>. A duplicate would send two links to the
    // same paragraph, and nothing about the page would look wrong.
    expect(workPrincipleIdsAreUnique()).toBe(true);
  });

  it('uses ids that are valid URL fragments', () => {
    for (const principle of profile.howIWork) {
      expect(principle.id, principle.heading).toMatch(/^[a-z][a-z0-9-]*$/);
    }
  });
});

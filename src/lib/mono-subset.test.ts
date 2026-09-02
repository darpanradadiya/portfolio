import { describe, expect, it } from 'vitest';
import { MONO_SUBSET, outOfSubset } from './mono-subset';
import { profile } from '@/content/profile';

describe('outOfSubset', () => {
  it('accepts every value the proof strip renders', () => {
    for (const point of profile.proof) {
      expect(outOfSubset(point.value), `proof value ${point.value}`).toEqual([]);
    }
  });

  it('accepts the numeric forms the site actually uses', () => {
    for (const value of [
      '270',
      '185',
      '950+',
      '100K+',
      '95K',
      '3.96/4.0',
      '90.15%',
      '5,000',
      '10x',
    ]) {
      expect(outOfSubset(value), value).toEqual([]);
    }
  });

  it('reports letters, which the subset font cannot render', () => {
    expect(outOfSubset('~30GB').sort()).toEqual(['B', 'G', '~']);
  });

  it('reports each offending character once', () => {
    expect(outOfSubset('GG')).toEqual(['G']);
  });

  it('returns nothing for an empty string', () => {
    expect(outOfSubset('')).toEqual([]);
  });

  it('treats the subset itself as fully renderable', () => {
    expect(outOfSubset(MONO_SUBSET)).toEqual([]);
  });

  it('excludes letters that would let mono render prose', () => {
    // The guarantee is that monospace cannot say anything but a measured value.
    for (const letter of ['A', 'e', 'Z', 'q']) {
      expect(outOfSubset(letter), letter).toEqual([letter]);
    }
  });
});

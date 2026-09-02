import rawSnapshot from '@data/stats.json';
import { parseSnapshot, type StatsSnapshot } from '@/lib/stats';

/**
 * The committed snapshot, validated at build time.
 *
 * If the file is malformed this is null and every consumer omits its element
 * rather than rendering a placeholder. Nothing on this site shows a zero, a dash,
 * or a spinner in place of a statistic.
 */
export const stats: StatsSnapshot | null = parseSnapshot(rawSnapshot);

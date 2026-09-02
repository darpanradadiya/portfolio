import { z } from 'zod';

/**
 * Contact form: the shared schema and the pure rate-limit decision.
 *
 * Both live here so the client validates against exactly what the server enforces,
 * and so the rate-limit rule is unit-testable without a request.
 */

export const contactSchema = z.object({
  name: z.string().trim().min(1, 'Tell me your name.').max(120, 'That name is too long.'),
  email: z.string().trim().email('That does not look like an email address.').max(200),
  message: z
    .string()
    .trim()
    .min(20, 'A little more detail, please — at least 20 characters.')
    .max(4000, 'That message is too long. Email directly instead.'),
  /**
   * Honeypot. Real people leave it empty because it is hidden; bots fill it in.
   * Preferred over a CAPTCHA, which costs every human visitor something.
   */
  company: z.string().max(0).optional(),
});

export type ContactInput = z.infer<typeof contactSchema>;

/** Every outcome the endpoint can report. The client renders each one differently. */
export type ContactOutcome =
  | { status: 'sent' }
  | { status: 'invalid'; fieldErrors: Record<string, string[]> }
  | { status: 'rate-limited'; retryAfterSeconds: number }
  | { status: 'unavailable'; reason: string }
  | { status: 'failed'; reason: string };

export const RATE_LIMIT = {
  windowMs: 60 * 60 * 1000,
  maxPerWindow: 3,
} as const;

/**
 * Decide whether a submission is allowed, given the timestamps of previous ones.
 *
 * Pure, so the rule can be tested directly. `hits` are epoch milliseconds; entries
 * older than the window are ignored by the caller and by this function.
 */
export function checkRateLimit(
  hits: readonly number[],
  now: number,
  windowMs: number = RATE_LIMIT.windowMs,
  maxPerWindow: number = RATE_LIMIT.maxPerWindow,
): { allowed: boolean; retryAfterSeconds: number; remaining: number } {
  const recent = hits.filter((hit) => now - hit < windowMs);

  if (recent.length < maxPerWindow) {
    return {
      allowed: true,
      retryAfterSeconds: 0,
      remaining: maxPerWindow - recent.length - 1,
    };
  }

  const oldest = Math.min(...recent);
  const retryAfterMs = windowMs - (now - oldest);

  return {
    allowed: false,
    // Always at least a second, so a client never sees "retry in 0 seconds".
    retryAfterSeconds: Math.max(1, Math.ceil(retryAfterMs / 1000)),
    remaining: 0,
  };
}

/** Drop timestamps that have aged out, so the store does not grow without bound. */
export function pruneHits(
  hits: readonly number[],
  now: number,
  windowMs: number = RATE_LIMIT.windowMs,
): number[] {
  return hits.filter((hit) => now - hit < windowMs);
}

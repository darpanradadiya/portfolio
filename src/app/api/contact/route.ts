import { NextResponse } from 'next/server';
import { profile } from '@/content/profile';
import {
  checkRateLimit,
  contactSchema,
  pruneHits,
  RATE_LIMIT,
  type ContactOutcome,
} from '@/lib/contact';

/**
 * Contact endpoint.
 *
 * The governing rule is that this must never fail silently. Every outcome —
 * delivered, invalid, rate-limited, not configured, provider error — is reported
 * with a distinct status the client renders differently. If mail delivery is not
 * configured, this returns 503 and says so, rather than returning 200 and
 * dropping the message, which is the failure mode the brief bans outright.
 */

export const runtime = 'nodejs';

/**
 * Best-effort in-memory rate limiting.
 *
 * Serverless instances do not share memory, so a determined sender can exceed the
 * limit by landing on cold instances. This is honest about being a courtesy
 * throttle against accidental double-submits and casual spam, not a security
 * control. A shared store (Upstash, Redis) is the upgrade if abuse ever appears;
 * the decision logic in lib/contact.ts is already storage-agnostic.
 */
const hitsByIp = new Map<string, number[]>();

function clientIp(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const first = forwarded?.split(',')[0]?.trim();
  return first !== undefined && first.length > 0
    ? first
    : (request.headers.get('x-real-ip') ?? 'unknown');
}

function reply(outcome: ContactOutcome, status: number, headers?: HeadersInit) {
  return NextResponse.json(outcome, { status, headers });
}

async function deliver(input: {
  name: string;
  email: string;
  message: string;
}): Promise<{ ok: true } | { ok: false; reason: string }> {
  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.CONTACT_TO_EMAIL ?? profile.contact.email;
  const from = process.env.CONTACT_FROM_EMAIL;

  if (apiKey === undefined || from === undefined) {
    return {
      ok: false,
      reason: 'not-configured',
    };
  }

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        authorization: `Bearer ${apiKey}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        from,
        to: [to],
        reply_to: input.email,
        subject: `Portfolio enquiry from ${input.name}`,
        text: `${input.message}\n\n--\n${input.name} <${input.email}>`,
      }),
      signal: AbortSignal.timeout(10_000),
    });

    if (!response.ok) {
      const body = await response.text();
      console.error('contact: provider rejected the send', response.status, body);
      return { ok: false, reason: `provider responded ${response.status}` };
    }

    return { ok: true };
  } catch (error) {
    console.error('contact: send threw', error);
    return { ok: false, reason: (error as Error).message };
  }
}

export async function POST(request: Request) {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return reply(
      {
        status: 'invalid',
        fieldErrors: { message: ['That request could not be read.'] },
      },
      400,
    );
  }

  const parsed = contactSchema.safeParse(payload);
  if (!parsed.success) {
    return reply(
      {
        status: 'invalid',
        fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
      },
      400,
    );
  }

  const ip = clientIp(request);
  const now = Date.now();
  const existing = pruneHits(hitsByIp.get(ip) ?? [], now);
  const limit = checkRateLimit(existing, now);

  if (!limit.allowed) {
    hitsByIp.set(ip, existing);
    return reply(
      { status: 'rate-limited', retryAfterSeconds: limit.retryAfterSeconds },
      429,
      {
        'retry-after': String(limit.retryAfterSeconds),
      },
    );
  }

  const result = await deliver(parsed.data);

  if (!result.ok) {
    if (result.reason === 'not-configured') {
      // 503, never 200. A message that was not sent must not look sent.
      return reply(
        {
          status: 'unavailable',
          reason:
            'The form is not connected to a mail provider yet, so this message was not sent.',
        },
        503,
      );
    }
    return reply(
      {
        status: 'failed',
        reason: 'The message could not be delivered. Nothing was sent.',
      },
      502,
    );
  }

  // Only count submissions that actually went out, so a provider outage does not
  // consume someone's quota.
  hitsByIp.set(ip, [...existing, now]);
  return reply({ status: 'sent' }, 200, {
    'x-ratelimit-remaining': String(limit.remaining),
    'x-ratelimit-window': String(RATE_LIMIT.windowMs),
  });
}

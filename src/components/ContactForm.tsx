'use client';

import { useId, useState } from 'react';
import { contactSchema, type ContactOutcome } from '@/lib/contact';
import { FieldError } from '@/components/FieldError';
import { Limitation } from '@/components/Limitation';

type FormState =
  | { kind: 'idle' }
  | { kind: 'submitting' }
  | { kind: 'sent' }
  | { kind: 'invalid'; fieldErrors: Record<string, string[]> }
  | { kind: 'rate-limited'; retryAfterSeconds: number }
  | { kind: 'unavailable'; reason: string }
  | { kind: 'failed'; reason: string };

/**
 * The contact form.
 *
 * Every outcome is shown to the person who submitted it. There is no path through
 * this component where a message disappears and the UI implies it was sent — a
 * form that fails silently is worse than no form, because it costs the sender an
 * opportunity they think they took.
 *
 * When sending is impossible for any reason, the email address is offered as a
 * fallback in the same breath, so the visitor is never left with only bad news.
 */
export function ContactForm({ email }: { email: string }) {
  const [state, setState] = useState<FormState>({ kind: 'idle' });
  const nameId = useId();
  const emailId = useId();
  const messageId = useId();
  const companyId = useId();

  const fieldErrors = state.kind === 'invalid' ? state.fieldErrors : {};

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const candidate = {
      name: String(form.get('name') ?? ''),
      email: String(form.get('email') ?? ''),
      message: String(form.get('message') ?? ''),
      company: String(form.get('company') ?? ''),
    };

    // Validate against the same schema the server enforces, so an obvious mistake
    // is caught without a round trip.
    const parsed = contactSchema.safeParse(candidate);
    if (!parsed.success) {
      setState({
        kind: 'invalid',
        fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
      });
      return;
    }

    setState({ kind: 'submitting' });

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(parsed.data),
      });
      const outcome = (await response.json()) as ContactOutcome;

      switch (outcome.status) {
        case 'sent':
          setState({ kind: 'sent' });
          break;
        case 'invalid':
          setState({ kind: 'invalid', fieldErrors: outcome.fieldErrors });
          break;
        case 'rate-limited':
          setState({
            kind: 'rate-limited',
            retryAfterSeconds: outcome.retryAfterSeconds,
          });
          break;
        case 'unavailable':
          setState({ kind: 'unavailable', reason: outcome.reason });
          break;
        default:
          setState({ kind: 'failed', reason: outcome.reason });
      }
    } catch {
      // A network failure is still a failure the sender must see.
      setState({
        kind: 'failed',
        reason: 'The request did not reach the server. Nothing was sent.',
      });
    }
  }

  if (state.kind === 'sent') {
    return (
      <p role="status" className="measure">
        Message sent. Darpan will reply to the address you gave.
      </p>
    );
  }

  const fieldClass =
    'border-rule-strong bg-transparent text-ink w-full border px-2.5 py-1.5 text-base';

  return (
    <form onSubmit={onSubmit} noValidate className="measure flex flex-col gap-5">
      <div>
        <label htmlFor={nameId} className="block text-xs">
          Name
        </label>
        <input
          id={nameId}
          name="name"
          type="text"
          autoComplete="name"
          required
          aria-invalid={fieldErrors.name !== undefined}
          aria-describedby={
            fieldErrors.name !== undefined ? `${nameId}-error` : undefined
          }
          className={`mt-1.5 ${fieldClass}`}
        />
        {fieldErrors.name !== undefined && (
          <FieldError id={`${nameId}-error`}>{fieldErrors.name.join(' ')}</FieldError>
        )}
      </div>

      <div>
        <label htmlFor={emailId} className="block text-xs">
          Email
        </label>
        <input
          id={emailId}
          name="email"
          type="email"
          autoComplete="email"
          required
          aria-invalid={fieldErrors.email !== undefined}
          aria-describedby={
            fieldErrors.email !== undefined ? `${emailId}-error` : undefined
          }
          className={`mt-1.5 ${fieldClass}`}
        />
        {fieldErrors.email !== undefined && (
          <FieldError id={`${emailId}-error`}>{fieldErrors.email.join(' ')}</FieldError>
        )}
      </div>

      <div>
        <label htmlFor={messageId} className="block text-xs">
          Message
        </label>
        <textarea
          id={messageId}
          name="message"
          rows={5}
          required
          aria-invalid={fieldErrors.message !== undefined}
          aria-describedby={
            fieldErrors.message !== undefined ? `${messageId}-error` : undefined
          }
          className={`mt-1.5 ${fieldClass}`}
        />
        {fieldErrors.message !== undefined && (
          <FieldError id={`${messageId}-error`}>
            {fieldErrors.message.join(' ')}
          </FieldError>
        )}
      </div>

      {/* Honeypot: hidden from people, tempting to bots. Cheaper than a CAPTCHA. */}
      <div aria-hidden="true" className="absolute -left-[9999px]">
        <label htmlFor={companyId}>Company</label>
        <input
          id={companyId}
          name="company"
          type="text"
          tabIndex={-1}
          autoComplete="off"
        />
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <button
          type="submit"
          disabled={state.kind === 'submitting'}
          className="border-ink bg-ink text-paper cursor-pointer border px-3 py-1.5 text-xs disabled:cursor-wait disabled:opacity-70"
        >
          {state.kind === 'submitting' ? 'Sending…' : 'Send message'}
        </button>
        <span className="text-ink-muted text-2xs">
          Or email <a href={`mailto:${email}`}>{email}</a> directly.
        </span>
      </div>

      {/* Non-field outcomes. Announced, and each one distinguishable from the others. */}
      <div role="status" aria-live="polite">
        {state.kind === 'rate-limited' && (
          <Limitation>
            That is three messages in the last hour, so this one was not sent. Try again
            in {state.retryAfterSeconds} seconds, or email {email} directly.
          </Limitation>
        )}
        {state.kind === 'unavailable' && (
          <Limitation>
            {state.reason} Please email <a href={`mailto:${email}`}>{email}</a> instead.
          </Limitation>
        )}
        {state.kind === 'failed' && (
          <Limitation>
            {state.reason} Please email <a href={`mailto:${email}`}>{email}</a> instead.
          </Limitation>
        )}
        {state.kind === 'invalid' && Object.keys(fieldErrors).length === 0 && (
          <Limitation>
            That submission was rejected and nothing was sent. Please email {email}.
          </Limitation>
        )}
      </div>
    </form>
  );
}

'use client';

import { useState } from 'react';

/**
 * One click to copy the address. The address is also a real mailto: link, so this
 * degrades to something useful without JavaScript and for anyone who would rather
 * open their mail client.
 *
 * The button reports what happened. A copy control that silently does nothing is
 * the same failure as a contact form that silently does not send.
 */
export function CopyEmail({ email }: { email: string }) {
  const [state, setState] = useState<'idle' | 'copied' | 'failed'>('idle');

  async function copy() {
    try {
      await navigator.clipboard.writeText(email);
      setState('copied');
    } catch {
      setState('failed');
    }
    window.setTimeout(() => setState('idle'), 2400);
  }

  return (
    <span className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
      <a href={`mailto:${email}`}>{email}</a>
      <button
        type="button"
        onClick={copy}
        className="border-rule-strong text-2xs text-ink cursor-pointer border bg-transparent px-2 py-0.5"
      >
        Copy
      </button>
      {/* Announced to screen readers as well as shown. */}
      <span role="status" aria-live="polite" className="text-2xs text-ink-muted">
        {state === 'copied' && 'Copied to clipboard'}
        {state === 'failed' && 'Could not copy — select the address instead'}
      </span>
    </span>
  );
}

/**
 * A validation message for a single form field.
 *
 * Deliberately does NOT use `--warn`. That token is reserved for limitations of
 * the system and stale-data notices; a mistyped email address is neither. Reaching
 * for it here would quietly widen the reservation until it meant "anything
 * attention-worthy", which is how a reserved token stops being one.
 *
 * The error is carried by text, a hairline, and `aria-invalid` on the input rather
 * than by colour — which is what WCAG 1.4.1 asks for anyway.
 */
export function FieldError({ id, children }: { id: string; children: string }) {
  return (
    <p id={id} className="border-rule-strong text-2xs mt-1.5 border-l-2 pl-2">
      {children}
    </p>
  );
}

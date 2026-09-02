/**
 * Navigation routes.
 *
 * Only routes that exist are listed. `/code` and `/writing` are planned (see the
 * brief) but are not linked until they ship — a nav item that 404s costs more than
 * a missing nav item.
 */
export const ROUTES = [
  { href: '/projects', label: 'Work' },
  { href: '/about', label: 'About' },
  { href: '/resume', label: 'Résumé' },
] as const;

/**
 * Navigation routes.
 *
 * Only routes that exist are listed — a nav item that 404s costs more than a
 * missing one.
 */
export const ROUTES = [
  { href: '/projects', label: 'Work' },
  { href: '/code', label: 'Foundations' },
  { href: '/about', label: 'About' },
  { href: '/resume', label: 'Résumé' },
  { href: '/contact', label: 'Contact' },
] as const;

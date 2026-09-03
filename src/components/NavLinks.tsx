'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ROUTES } from '@/lib/routes';

/**
 * Main navigation. Client-side only so the active route can be marked.
 *
 * `aria-current="page"` is what carries the state; the accent colour follows it in
 * CSS rather than being applied separately, so the visual and the announced state
 * cannot disagree.
 */
export function NavLinks() {
  const pathname = usePathname();

  return (
    <ul className="flex list-none flex-wrap items-baseline gap-x-5 gap-y-1 p-0 text-xs">
      {ROUTES.map((route) => {
        const active = pathname === route.href || pathname.startsWith(`${route.href}/`);
        return (
          <li key={route.href}>
            <Link
              href={route.href}
              className="nav-link"
              aria-current={active ? 'page' : undefined}
            >
              {route.label}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

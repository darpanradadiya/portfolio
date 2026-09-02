import Link from 'next/link';
import { ROUTES } from '@/lib/routes';
import { profile } from '@/content/profile';

/**
 * Deliberately not sticky, and with no backdrop filter. Sticky costs roughly a
 * tenth of a 320px viewport and adds a compositing layer; the footer repeats every
 * route, and case studies carry their own back and prev/next links.
 */
export function SiteHeader() {
  return (
    <header className="border-rule border-b">
      <div className="page flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2 py-4">
        <Link href="/" className="text-base font-medium no-underline">
          {profile.name}
        </Link>
        <nav aria-label="Main">
          <ul className="flex list-none flex-wrap items-baseline gap-x-5 gap-y-1 p-0 text-xs">
            {ROUTES.map((route) => (
              <li key={route.href}>
                <Link href={route.href}>{route.label}</Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  );
}

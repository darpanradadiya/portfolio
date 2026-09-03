import Link from 'next/link';
import { NavLinks } from '@/components/NavLinks';
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
        <Link href="/" className="nav-link text-base font-medium">
          {profile.name}
        </Link>
        <nav aria-label="Main">
          <NavLinks />
        </nav>
      </div>
    </header>
  );
}

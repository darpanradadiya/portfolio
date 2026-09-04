import Link from 'next/link';
import { ROUTES } from '@/lib/routes';
import { profile } from '@/content/profile';

/**
 * A saturated surface, not a hairline and a gap.
 *
 * This is the one place on the page where a large block of real colour costs
 * nothing: nothing below it competes for attention, and it ends the page
 * deliberately instead of letting it trail off into margin. Its colours are
 * scoped in globals.css under .site-footer, including the link colour, because
 * the page's accent does not clear AA against teal this dark.
 *
 * No top hairline and no top margin. The colour is the edge, and the breathing
 * room above the text is the footer's own padding rather than a strip of page
 * ground: an external margin left a band of ground between the last section and
 * the colour, which read as a gap someone forgot to close rather than as an
 * ending.
 */
export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="page flex flex-col gap-6 pt-20 pb-12 md:flex-row md:justify-between md:pt-24">
        <div className="footer-muted text-2xs">
          <p>
            {profile.name}, {profile.location}
          </p>
          <p className="mt-1">
            Built with Next.js and deployed on Vercel. Source on{' '}
            <a href={profile.links.github.url}>GitHub</a>.
          </p>
        </div>
        <nav aria-label="Footer">
          <ul className="flex list-none flex-wrap gap-x-5 gap-y-1 p-0 text-xs">
            {ROUTES.map((route) => (
              <li key={route.href}>
                <Link href={route.href} className="nav-link">
                  {route.label}
                </Link>
              </li>
            ))}
            {profile.links.linkedin.url !== null && (
              <li>
                <a href={profile.links.linkedin.url}>LinkedIn</a>
              </li>
            )}
            <li>
              <a href={profile.links.github.url}>GitHub</a>
            </li>
          </ul>
        </nav>
      </div>
    </footer>
  );
}

import Link from 'next/link';
import { ROUTES } from '@/lib/routes';
import { profile } from '@/content/profile';

export function SiteFooter() {
  return (
    <footer className="mt-20 border-t border-rule md:mt-28">
      <div className="page flex flex-col gap-6 py-10 md:flex-row md:justify-between">
        <div className="text-2xs text-ink-muted">
          <p>
            {profile.name} — {profile.location}
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
                <Link href={route.href}>{route.label}</Link>
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

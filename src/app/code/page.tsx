import type { Metadata } from 'next';
import { Section } from '@/components/Section';
import { profile } from '@/content/profile';
import { absoluteUrl } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Foundations',
  description:
    'Data structures and algorithms, and where the code lives. Profiles are linked rather than summarised; the case studies are where the engineering is.',
  alternates: { canonical: absoluteUrl('/code') },
};

/*
 * Every figure that was on this page is gone: the problem counts, both difficulty
 * bars, the coding score, the institute rank, the public-repository count and the
 * top-languages list. A problem count measures how much practice, not which
 * problems and not what was built with them, and a platform ranking is a fact
 * about a leaderboard.
 *
 * What is left is the links, which is also the honest amount. The profiles stay
 * reachable and all three handles stay in the JSON-LD sameAs; nothing is
 * summarised on the way past.
 *
 * GeeksforGeeks is absent from the list rather than listed without a link: its
 * URL slug is not known, and this site does not render a link that 404s.
 */
const LINKED_PROFILES = ['leetcode', 'github'] as const;

export default function CodePage() {
  const linked = LINKED_PROFILES.map((key) => profile.links[key]).filter(
    (link) => link.url !== null,
  );

  return (
    <Section marker="Foundations">
      <h1 className="text-3xl">Foundations</h1>
      <p className="measure mt-4 text-lg">
        Data structures and algorithms are the part of this work that does not show up in
        a case study. The profiles are linked rather than summarised.
      </p>

      {linked.length > 0 && (
        <ul className="mt-8 flex list-none flex-col gap-2 p-0">
          {linked.map((link) => (
            <li key={link.label}>
              <a href={link.url ?? undefined}>{link.label}</a>
            </li>
          ))}
        </ul>
      )}
    </Section>
  );
}

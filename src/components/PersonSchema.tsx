import { profile, sameAsUrls } from '@/content/profile';
import { SITE_URL } from '@/lib/site';

/**
 * JSON-LD `Person`, emitted once per page from the root layout.
 *
 * `sameAs` is how AI search engines and knowledge panels verify that a person and
 * their profiles are the same entity. Profiles whose URL is not yet known are
 * omitted rather than guessed — see the TODOs in profile.ts.
 */
export function PersonSchema() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: profile.name,
    url: SITE_URL,
    email: `mailto:${profile.contact.email}`,
    jobTitle: profile.role,
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Boston',
      addressRegion: 'MA',
      addressCountry: 'US',
    },
    alumniOf: profile.education.map((entry) => ({
      '@type': 'EducationalOrganization',
      name: entry.institution,
    })),
    knowsAbout: profile.skills.map((group) => group.category),
    sameAs: sameAsUrls(),
  };

  return (
    <script
      type="application/ld+json"
      // Serialised from typed data above, so there is no user input to escape.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

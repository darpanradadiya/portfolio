import Link from 'next/link';
import type { Metadata } from 'next';
import { ProofStrip } from '@/components/ProofStrip';
import { WorkRow } from '@/components/WorkRow';
import { Section } from '@/components/Section';
import { MetaList } from '@/components/MetaList';
import { CopyEmail } from '@/components/CopyEmail';
import { ContactForm } from '@/components/ContactForm';
import { Limitation } from '@/components/Limitation';
import { currentEducation, profile } from '@/content/profile';
import { getFeaturedProjects } from '@/lib/projects';
import { absoluteUrl } from '@/lib/site';

export const metadata: Metadata = {
  title: `${profile.name} — data and analytics engineer in Boston`,
  description:
    'Data and analytics engineer with applied ML depth. Ships tested systems: a 270-module ML pipeline behind 185 pytest functions. Graduating December 2026.',
  alternates: { canonical: absoluteUrl('/') },
};

export default function Home() {
  const featured = getFeaturedProjects();
  const education = currentEducation();

  return (
    <div className="flex flex-col gap-14 md:gap-20">
      {/* Hero. First paint is content: no preloader, no entrance animation. */}
      <Section marker="Now">
        <h1 className="text-3xl">{profile.name}</h1>
        <p className="mt-3 text-lg">{profile.role}</p>

        {profile.intro !== null && <p className="measure mt-4">{profile.intro}</p>}

        <MetaList
          className="text-ink-muted mt-5 text-xs"
          items={[
            profile.location,
            `${education.credentialShort}, ${education.institution}`,
            profile.availability,
          ]}
        />

        <ul className="mt-6 flex list-none flex-wrap gap-x-6 gap-y-2 p-0">
          <li>
            <a href={profile.links.github.url}>GitHub</a>
          </li>
          {profile.links.linkedin.url !== null && (
            <li>
              <a href={profile.links.linkedin.url}>LinkedIn</a>
            </li>
          )}
          <li>
            <a href="/Darpan_Radadiya_Resume.pdf">Résumé (PDF)</a>
          </li>
        </ul>

        {profile.headline === null && (
          <Limitation className="measure mt-6">
            The introduction here is still being written in Darpan&rsquo;s own words
            rather than filled with placeholder copy.
          </Limitation>
        )}
      </Section>

      {/* Proof strip — the one place this page raises its voice. */}
      <Section marker="Measured">
        <h2 className="sr-only">Selected figures</h2>
        <ProofStrip />
      </Section>

      <Section marker="Work" divided>
        <h2 className="text-xl">Selected work</h2>
        <div className="mt-8 flex flex-col gap-8">
          {featured.map((project, index) => (
            <WorkRow key={project.slug} project={project} showDivider={index > 0} />
          ))}
        </div>
        <p className="mt-8 text-xs">
          <Link href="/projects">All six projects</Link>
        </p>
      </Section>

      <Section marker="Method" divided>
        <h2 className="text-xl">How I work</h2>
        {profile.howIWork.length > 0 ? (
          <div className="measure mt-6 flex flex-col gap-4">
            {profile.howIWork.map((paragraph) => (
              <p key={paragraph.slice(0, 32)}>{paragraph}</p>
            ))}
          </div>
        ) : (
          <Limitation className="measure mt-6">
            Three or four paragraphs on testing, data quality, and tradeoffs belong here.
            They are deliberately empty rather than generated — this is the section a
            hiring engineer reads most closely, and it has to be Darpan&rsquo;s own
            account of how he works.
          </Limitation>
        )}
      </Section>

      <Section marker="Contact" divided>
        <h2 className="text-xl">Get in touch</h2>
        <p className="text-ink-muted mt-3 text-xs">
          Open to analytics engineering, data engineering, and applied ML roles from
          December 2026.
        </p>
        <div className="mt-5 text-base">
          <CopyEmail email={profile.contact.email} />
        </div>
        <div className="mt-8">
          <ContactForm email={profile.contact.email} />
        </div>
      </Section>
    </div>
  );
}

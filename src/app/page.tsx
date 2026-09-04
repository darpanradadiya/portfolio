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
  title: `${profile.name}, data and analytics engineer in Boston`,
  description:
    'Data and analytics engineer with applied ML depth. Ships tested systems: a 273-module ML pipeline behind 185 pytest functions. Graduating December 2026.',
  alternates: { canonical: absoluteUrl('/') },
};

export default function Home() {
  const featured = getFeaturedProjects();
  const education = currentEducation();

  return (
    <div>
      {/*
        Hero. First paint is content: no preloader, no entrance animation.
        No rail marker: the other markers name a section ("Work", "Method",
        "Contact") and this one has an h1 immediately beside it, so a label here
        would be decoration rather than navigation.
      */}
      <Section wash>
        <h1 className="text-3xl">{profile.name}</h1>

        {/*
          No category label above the headline. "Data / analytics engineer with
          applied ML depth" blunted the line it sat on top of; the meta row below
          carries the role, and profile.role still feeds the JSON-LD jobTitle.
        */}
        {profile.headline !== null && (
          <p className="measure mt-5 text-2xl">{profile.headline}</p>
        )}

        {profile.intro !== null && <p className="measure mt-5">{profile.intro}</p>}

        <MetaList
          className="text-ink-muted mt-6 text-xs"
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
      </Section>

      {/*
        Proof strip — the one place this page raises its voice, and the one block
        that breaks out of the 66ch measure to do it.
      */}
      <section aria-labelledby="figures" className="border-rule-strong border-y">
        <h2 id="figures" className="sr-only">
          Selected figures
        </h2>
        <ProofStrip />
      </section>

      <Section marker="Work" band="cool" reveal>
        <h2 className="text-xl">Selected work</h2>
        <div className="mt-8 flex flex-col gap-8">
          {featured.map((project) => (
            <WorkRow key={project.slug} project={project} />
          ))}
        </div>
        <p className="mt-8 text-xs">
          <Link href="/projects">All six projects</Link>
        </p>
      </Section>

      <Section marker="Method" band="warm" reveal>
        <h2 className="text-xl">How I work</h2>
        {profile.howIWork.length > 0 ? (
          <div className="mt-8 flex flex-col gap-8">
            {profile.howIWork.map((principle) => (
              <div key={principle.heading}>
                <h3 className="text-lg">{principle.heading}</h3>
                <p className="measure mt-3">{principle.body}</p>
              </div>
            ))}
          </div>
        ) : (
          <Limitation className="measure mt-6">
            Three or four paragraphs on testing, data quality, and tradeoffs belong here.
          </Limitation>
        )}
      </Section>

      <Section marker="Contact" band="cool" reveal>
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

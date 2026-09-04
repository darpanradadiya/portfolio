import Link from 'next/link';
import type { Metadata } from 'next';
import { ProofStrip } from '@/components/ProofStrip';
import { WorkRow } from '@/components/WorkRow';
import { Section } from '@/components/Section';
import { MetaList } from '@/components/MetaList';
import { CopyEmail } from '@/components/CopyEmail';
import { currentEducation, profile } from '@/content/profile';
import { getAllProjects } from '@/lib/projects';
import { absoluteUrl } from '@/lib/site';

export const metadata: Metadata = {
  title: `${profile.name}, data and analytics engineer in Boston`,
  // Opens on the line the hero opens on. The previous description led with a
  // tagline ("Data and analytics engineer with applied ML depth") that was cut
  // from the page, so a search result promised a sentence the visitor never saw.
  description:
    "Most ML pipelines break quietly. I build the ones that don't. Darpan Radadiya, data and analytics engineer, Boston. MPS Analytics, Northeastern, December 2026.",
  alternates: { canonical: absoluteUrl('/') },
};

export default function Home() {
  const projects = getAllProjects();
  const featured = projects.filter((project) => project.featured);
  const education = currentEducation();

  // Derived, never written down. "All six projects" outlived the sixth project
  // and shipped as a false claim on the busiest page on the site; a literal
  // here is a fact that decays the moment the content directory changes.
  const allProjectsLabel = `All ${projects.length} ${
    projects.length === 1 ? 'project' : 'projects'
  }`;

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
        {projects.length > featured.length && (
          <p className="mt-8 text-xs">
            <Link href="/projects">{allProjectsLabel}</Link>
          </p>
        )}
      </Section>

      {/*
        Four claims, and the argument for each one is a click away on /about.
        The paragraphs used to run in full here, which put 45 words x 4 between
        a visitor and the rest of the page for a section they had not yet chosen
        to read. A heading is enough to decide with.

        No empty state. Four headings with nothing behind them is not a section
        worth rendering, and a note explaining that the copy is unwritten is the
        site describing its own build status to a reader.
      */}
      {profile.howIWork.length > 0 && (
        <Section marker="Method" band="warm" reveal>
          <h2 className="text-xl">How I work</h2>
          <ul className="mt-6 flex list-none flex-col gap-3 p-0">
            {profile.howIWork.map((principle) => (
              <li key={principle.id}>
                <Link href={`/about#${principle.id}`} className="text-lg">
                  {principle.heading}
                </Link>
              </li>
            ))}
          </ul>
        </Section>
      )}

      {/*
        The address, not the form. A four-field form is ~500px of the home page
        spent on a visitor who has already decided; the address serves the one who
        has, and /contact serves the one who would rather write in the browser.
      */}
      <Section marker="Contact" band="cool" reveal>
        <h2 className="text-xl">Get in touch</h2>
        <p className="text-ink-muted mt-3 text-xs">{profile.openTo}</p>
        <div className="mt-5 text-base">
          <CopyEmail email={profile.contact.email} />
        </div>
        <p className="mt-5 text-xs">
          <Link href="/contact">Send a message instead</Link>
        </p>
      </Section>
    </div>
  );
}

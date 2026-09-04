import type { Metadata } from 'next';
import { Section } from '@/components/Section';
import { MetaList } from '@/components/MetaList';
import { StackList } from '@/components/StackList';
import { profile } from '@/content/profile';
import { absoluteUrl } from '@/lib/site';

export const metadata: Metadata = {
  title: 'About',
  description:
    'Darpan Radadiya is a data and analytics engineer in Boston, graduating from Northeastern in December 2026 with an MPS in Analytics and a 3.96 GPA.',
  alternates: { canonical: absoluteUrl('/about') },
};

export default function AboutPage() {
  return (
    <div className="flex flex-col gap-14 md:gap-20">
      <Section marker="About">
        <h1 className="text-3xl">About</h1>
        {/*
          No empty state. "It is deliberately empty rather than written for him"
          was the site describing its own build status to a reader, which is the
          one thing it is not for. The heading alone is the honest rendering.
        */}
        {profile.about.length > 0 && (
          <div className="measure mt-6 flex flex-col gap-4">
            {profile.about.map((paragraph) => (
              <p key={paragraph.slice(0, 32)}>{paragraph}</p>
            ))}
          </div>
        )}
      </Section>

      {/*
        The four principles in full. The home page lists the headings and links
        each one to the id below, so these anchors are addresses other pages
        depend on. The ids are written down in profile.ts rather than slugified
        from the headings, so editing a heading cannot move its anchor.

        scroll-mt clears the sticky header: without it the browser puts the
        heading under the header and the visitor lands on the paragraph with no
        idea which claim it belongs to.
      */}
      {profile.howIWork.length > 0 && (
        <Section marker="Method" divided>
          <h2 className="text-xl">How I work</h2>
          <div className="mt-6 flex flex-col gap-8">
            {profile.howIWork.map((principle) => (
              <div key={principle.id}>
                <h3 id={principle.id} className="scroll-mt-24 text-lg">
                  {principle.heading}
                </h3>
                <p className="measure mt-3">{principle.body}</p>
              </div>
            ))}
          </div>
        </Section>
      )}

      <Section marker="Education" divided>
        <h2 className="text-xl">Education</h2>
        <ol className="mt-6 flex list-none flex-col gap-6 p-0">
          {profile.education.map((entry) => (
            <li key={entry.institution}>
              <h3 className="text-base">{entry.credential}</h3>
              <p className="text-ink-muted mt-1 text-xs">
                {entry.institution}, {entry.location}
              </p>
              <MetaList
                className="text-ink-muted mt-1 text-xs"
                items={[entry.completion, entry.result]}
              />
            </li>
          ))}
        </ol>
      </Section>

      <Section marker="Experience" divided>
        <h2 className="text-xl">Experience</h2>
        <ol className="mt-6 flex list-none flex-col gap-10 p-0">
          {profile.experience.map((entry) => (
            <li key={`${entry.organisation}-${entry.start}`}>
              <h3 className="text-base">
                {entry.role}, {entry.organisation}
              </h3>
              <MetaList
                className="text-ink-muted mt-1 text-xs"
                items={[`${entry.start} – ${entry.end}`, entry.location]}
              />
              <ul className="measure mt-4 flex list-disc flex-col gap-2 pl-5">
                {entry.highlights.map((highlight) => (
                  <li key={highlight.slice(0, 32)}>{highlight}</li>
                ))}
              </ul>
            </li>
          ))}
        </ol>
      </Section>

      <Section marker="Skills" divided>
        <h2 className="text-xl">Skills</h2>
        {/*
          Grouped text, not a logo wall and not proficiency bars. A bar claiming
          "Python 90%" is unfalsifiable; the case studies are the evidence.
        */}
        <dl className="mt-6 flex flex-col gap-6">
          {profile.skills.map((group) => (
            <div key={group.category}>
              <dt className="text-base">{group.category}</dt>
              <dd className="mt-2">
                <StackList className="text-ink-muted text-xs" items={group.items} />
              </dd>
            </div>
          ))}
        </dl>
      </Section>
    </div>
  );
}

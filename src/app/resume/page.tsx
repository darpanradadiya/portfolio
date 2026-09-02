import type { Metadata } from 'next';
import { Section } from '@/components/Section';
import { MetaList } from '@/components/MetaList';
import { StackList } from '@/components/StackList';
import { CopyEmail } from '@/components/CopyEmail';
import { profile } from '@/content/profile';
import { absoluteUrl } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Résumé',
  description:
    'Résumé of Darpan Radadiya: data and analytics engineer, MPS Analytics at Northeastern, December 2026. AWS ETL pipelines and tested ML systems.',
  alternates: { canonical: absoluteUrl('/resume') },
};

export default function ResumePage() {
  return (
    <div className="flex flex-col gap-14 md:gap-20">
      <Section marker="Résumé">
        <div className="flex flex-wrap items-baseline justify-between gap-4">
          <h1 className="text-3xl">Résumé</h1>
          <p className="text-xs">
            <a href="/Darpan_Radadiya_Resume.pdf" download>
              Download PDF
            </a>
          </p>
        </div>

        <MetaList
          className="text-ink-muted mt-5 text-xs"
          items={[profile.location, profile.availability]}
        />

        <div className="mt-4 text-xs">
          <CopyEmail email={profile.contact.email} />
        </div>
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

      <Section marker="Skills" divided>
        <h2 className="text-xl">Skills</h2>
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

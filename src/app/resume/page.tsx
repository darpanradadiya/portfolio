import type { Metadata } from 'next';
import { Section } from '@/components/Section';
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

        <ul className="text-ink-muted mt-5 flex list-none flex-wrap p-0 text-xs">
          <li className="pr-3">{profile.location}</li>
          <li className="border-rule border-l pl-3">{profile.availability}</li>
        </ul>

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
              <ul className="text-ink-muted mt-1 flex list-none flex-wrap p-0 text-xs">
                <li className="pr-3">
                  {entry.start} – {entry.end}
                </li>
                <li className="border-rule border-l pl-3">{entry.location}</li>
              </ul>
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
              <ul className="text-ink-muted mt-1 flex list-none flex-wrap p-0 text-xs">
                <li className="pr-3">{entry.completion}</li>
                <li className="border-rule border-l pl-3">{entry.result}</li>
              </ul>
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
                <ul className="text-ink-muted flex list-none flex-wrap p-0 text-xs">
                  {group.items.map((item, index) => (
                    <li
                      key={item}
                      className={index === 0 ? 'pr-2.5' : 'border-rule border-l px-2.5'}
                    >
                      {item}
                    </li>
                  ))}
                </ul>
              </dd>
            </div>
          ))}
        </dl>
      </Section>
    </div>
  );
}

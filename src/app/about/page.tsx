import type { Metadata } from 'next';
import { Section } from '@/components/Section';
import { Limitation } from '@/components/Limitation';
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
        {profile.about.length > 0 ? (
          <div className="measure mt-6 flex flex-col gap-4">
            {profile.about.map((paragraph) => (
              <p key={paragraph.slice(0, 32)}>{paragraph}</p>
            ))}
          </div>
        ) : (
          <Limitation className="measure mt-6">
            A first-person account belongs here — how Darpan got from an ICT degree to
            building tested ML pipelines, and what he is looking for next. It is
            deliberately empty rather than written for him.
          </Limitation>
        )}
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

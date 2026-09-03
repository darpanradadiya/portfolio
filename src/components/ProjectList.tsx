'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Measured } from '@/components/Measured';
import { StackList } from '@/components/StackList';
import type { ProjectCard } from '@/lib/projects';

type ProjectListProps = {
  /**
   * Deliberately not the full Project. A Project carries its MDX `body`, and this is
   * a client component, so passing one would serialise every case study into the RSC
   * payload of a page that only renders summaries — shipping the prose, and any
   * unfinished note in it, to every visitor.
   */
  projects: readonly ProjectCard[];
  domains: readonly string[];
};

/**
 * The filter is progressive: every project is rendered on the server, and the
 * filter narrows what is already there. Without JavaScript the full list still
 * shows, which is the behaviour that matters — the list is the content, the filter
 * is a convenience.
 */
export function ProjectList({ projects, domains }: ProjectListProps) {
  const [active, setActive] = useState<string | null>(null);
  const shown =
    active === null
      ? projects
      : projects.filter((project) =>
          (project.domains as readonly string[]).includes(active),
        );

  return (
    <div>
      <fieldset className="border-0 p-0">
        <legend className="text-2xs text-ink-muted">Filter by domain</legend>
        <ul className="mt-2 flex list-none flex-wrap gap-2 p-0">
          {[null, ...domains].map((domain) => {
            const isActive = domain === active;
            return (
              <li key={domain ?? 'all'}>
                <button
                  type="button"
                  aria-pressed={isActive}
                  onClick={() => setActive(domain)}
                  className={[
                    'text-2xs cursor-pointer border px-2.5 py-1',
                    isActive
                      ? 'border-ink bg-ink text-paper'
                      : 'border-rule-strong text-ink bg-transparent',
                  ].join(' ')}
                >
                  {domain ?? 'All'}
                </button>
              </li>
            );
          })}
        </ul>
      </fieldset>

      <ol className="mt-10 flex list-none flex-col gap-8 p-0">
        {shown.map((project, index) => (
          <li
            key={project.slug}
            className={index > 0 ? 'border-rule-strong border-t pt-8' : ''}
          >
            <h2 className="text-xl">
              <Link href={`/projects/${project.slug}`}>{project.heading}</Link>
            </h2>
            {project.summary !== null && (
              <p className="measure mt-2">{project.summary}</p>
            )}
            <StackList className="text-2xs text-ink-muted mt-3" items={project.stack} />
            {project.metrics.length > 0 && (
              <ul className="text-2xs text-ink-muted mt-3 flex list-none flex-wrap gap-x-5 p-0">
                {project.metrics.map((metric) => (
                  <li key={metric.label}>
                    <Measured className="text-ink">{metric.value}</Measured>{' '}
                    {metric.label}
                  </li>
                ))}
              </ul>
            )}
          </li>
        ))}
      </ol>

      <p aria-live="polite" className="text-2xs text-ink-muted mt-8">
        Showing {shown.length} of {projects.length}
      </p>
    </div>
  );
}

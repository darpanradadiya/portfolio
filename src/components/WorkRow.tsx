import Image from 'next/image';
import Link from 'next/link';
import { Measured } from '@/components/Measured';
import { Limitation } from '@/components/Limitation';
import { StackList } from '@/components/StackList';
import { displayTitle, type Project } from '@/lib/projects';

/**
 * A featured project. Full width, so the title can be a sentence about an outcome
 * rather than the few words a narrow card would force.
 *
 * The surface is tinted with a hairline and lifts 2px on hover, with the border
 * moving to the accent. Still no box-shadow anywhere in the system: the lift is a
 * transform and a border-colour change, both inside a reduced-motion guard.
 */
export function WorkRow({ project }: { project: Project }) {
  const heading = displayTitle(project);

  return (
    <article className="card rounded-image p-5 md:p-6">
      <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
        <div className="min-w-0 flex-1">
          <h3 className="text-xl md:text-2xl">
            <Link href={`/projects/${project.slug}`}>{heading}</Link>
          </h3>

          {project.summary === null ? (
            <p className="text-ink-muted mt-3 text-xs">
              Case study in progress. The problem statement is being written.
            </p>
          ) : (
            <p className="mt-3 text-lg">{project.summary}</p>
          )}

          {project.metrics.length > 0 && (
            <ul className="mt-4 flex list-none flex-wrap gap-x-6 gap-y-2 p-0">
              {project.metrics.map((metric) => (
                <li key={metric.label} className="text-2xs text-ink-muted">
                  <Measured className="text-ink text-base">{metric.value}</Measured>{' '}
                  {metric.label}
                </li>
              ))}
            </ul>
          )}

          <StackList className="text-2xs text-ink-muted mt-4" items={project.stack} />

          {project.dataNote !== null && (
            <Limitation className="mt-4 max-w-prose">{project.dataNote}</Limitation>
          )}
        </div>

        {/*
          No screenshot, no element. A row without an image reads as a layout
          choice; a row explaining the missing image reads as unfinished, and
          commentary about the site's own construction is not for the reader.
        */}
        {project.screenshot !== null && (
          <Image
            src={project.screenshot.src}
            alt={project.screenshot.alt}
            width={project.screenshot.width}
            height={project.screenshot.height}
            className="rounded-image border-rule w-full border md:w-56 md:shrink-0"
            sizes="(min-width: 768px) 14rem, 100vw"
          />
        )}
      </div>
    </article>
  );
}

import Image from 'next/image';
import Link from 'next/link';
import { Measured } from '@/components/Measured';
import { Limitation } from '@/components/Limitation';
import { StackList } from '@/components/StackList';
import { displayTitle, type Project } from '@/lib/projects';

/**
 * A featured project, rendered as a full-width row rather than a card.
 *
 * A card constrains a title to a few words, which forces tool-shaped names; a row
 * lets the title be a sentence about an outcome. Rows also stack at 320px with no
 * reflow. There is no hover lift and no shadow — the hairline above the row is the
 * only boundary, which is why it uses --rule-strong rather than --rule.
 */
export function WorkRow({
  project,
  showDivider,
}: {
  project: Project;
  showDivider: boolean;
}) {
  const heading = displayTitle(project);

  return (
    <article className={showDivider ? 'border-rule-strong border-t pt-8' : ''}>
      <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
        <div className="min-w-0 flex-1">
          <h3 className="text-xl md:text-2xl">
            <Link href={`/projects/${project.slug}`}>{heading}</Link>
          </h3>

          {project.summary === null ? (
            <p className="text-ink-muted mt-3 text-xs">
              Case study in progress — the problem statement is being written.
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

import Image from 'next/image';
import Link from 'next/link';
import { StackList } from '@/components/StackList';
import { displayTitle, type Project } from '@/lib/projects';

/**
 * A featured project. Full width, so the title can be a sentence about an outcome
 * rather than the few words a narrow card would force.
 *
 * Title, one line, stack. Nothing else. The metrics and the data disclosure used
 * to render here too, which made every row fourteen lines deep and put three of
 * them between the visitor and the rest of the page. Both still render on the case
 * study, at the top of the page they belong to, where the numbers sit next to the
 * evidence for them instead of standing alone.
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

          {/*
            No summary, no paragraph. Same reasoning as the missing screenshot
            below: a row without one reads as a title and a stack, and a row
            saying the summary is unwritten reads as unfinished. The site does
            not tell a reader about its own build status.
          */}
          {project.summary !== null && <p className="mt-3 text-lg">{project.summary}</p>}

          <StackList className="text-2xs text-ink-muted mt-4" items={project.stack} />
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

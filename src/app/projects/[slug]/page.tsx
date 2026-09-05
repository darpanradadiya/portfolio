import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { compileMDX } from 'next-mdx-remote/rsc';
import { BackLink } from '@/components/BackLink';
import { Measured } from '@/components/Measured';
import { Limitation } from '@/components/Limitation';
import { StackList } from '@/components/StackList';
import { mdxComponents } from '@/components/mdx';
import {
  displayTitle,
  documentTitle,
  getAllProjects,
  getProject,
  getProjectNeighbours,
} from '@/lib/projects';
import { absoluteUrl } from '@/lib/site';

export function generateStaticParams() {
  return getAllProjects().map((project) => ({ slug: project.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const project = getProject(slug);
  if (project === undefined) return {};

  return {
    // <h1> may be a full sentence; <title> is budgeted, so it uses the short form.
    title: documentTitle(project),
    description:
      project.summary ??
      `${project.title}. Built with ${project.stack.slice(0, 4).join(', ')}. Case study by Darpan Radadiya.`,
    alternates: { canonical: absoluteUrl(`/projects/${slug}`) },
  };
}

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = getProject(slug);
  if (project === undefined) notFound();

  const { previous, next } = getProjectNeighbours(slug);
  const { content } = await compileMDX({
    source: project.body,
    components: mdxComponents,
  });

  return (
    <article className="page">
      <BackLink href="/projects">Work</BackLink>

      <header className="mt-6">
        <h1 className="text-3xl">{displayTitle(project)}</h1>
        {project.outcomeTitle !== null && (
          <p className="text-ink-muted mt-2 text-xs">{project.title}</p>
        )}
        {project.summary !== null && (
          <p className="measure mt-4 text-lg">{project.summary}</p>
        )}

        <dl className="mt-6 flex flex-col gap-2 text-xs">
          {project.role !== null && (
            <div className="flex gap-3">
              <dt className="text-ink-muted w-20 shrink-0">Role</dt>
              <dd>{project.role}</dd>
            </div>
          )}
          {project.timeframe !== null && (
            <div className="flex gap-3">
              <dt className="text-ink-muted w-20 shrink-0">When</dt>
              <dd>{project.timeframe}</dd>
            </div>
          )}
          <div className="flex gap-3">
            <dt className="text-ink-muted w-20 shrink-0">Stack</dt>
            <dd>
              <StackList items={project.stack} />
            </dd>
          </div>
        </dl>

        {project.metrics.length > 0 && (
          <ul className="border-rule mt-6 flex list-none flex-wrap gap-x-8 gap-y-3 border-t p-0 pt-5">
            {project.metrics.map((metric) => (
              <li key={metric.label}>
                <Measured className="block text-xl">{metric.value}</Measured>
                <span className="text-2xs text-ink-muted mt-1 block">{metric.label}</span>
              </li>
            ))}
          </ul>
        )}

        {project.dataNote !== null && (
          <Limitation className="measure border-rule mt-6 border-t pt-5">
            {project.dataNote}
          </Limitation>
        )}

        {project.screenshot !== null && (
          <Image
            src={project.screenshot.src}
            alt={project.screenshot.alt}
            width={project.screenshot.width}
            height={project.screenshot.height}
            className="rounded-image border-rule mt-8 w-full border"
            sizes="(min-width: 768px) 42rem, 100vw"
            priority
          />
        )}

        {/*
          The demo is a button and the repository is a link, because they are not
          the same offer. Reading code is work a reader chooses; a running system
          they can query is the one thing on this site that answers back, and it
          was previously a text link the same size as everything around it.

          The wait is disclosed rather than discovered. The host sleeps when idle,
          so a first request can take most of a minute while later ones answer in
          about a fifth of a second. A visitor who is told that waits; a visitor
          who is not assumes the link is broken.
        */}
        {(project.repo !== null || project.demo !== null) && (
          <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3">
            {project.demo !== null && (
              <a href={project.demo} className="cta text-xs">
                Open the live demo
              </a>
            )}
            {project.repo !== null && (
              <a href={project.repo} className="text-xs">
                Repository
              </a>
            )}
          </div>
        )}
        {project.demo !== null && (
          <p className="text-ink-muted text-2xs mt-3">
            Hosted on a free tier that sleeps when idle, so the first request can take up
            to a minute. After that it answers in about a fifth of a second.
          </p>
        )}

        {/*
          No repository to link. Say so rather than leaving a gap where a link
          would be — but never render a link that 404s.
        */}
        {project.repo === null && project.repoNote !== null && (
          <p className="text-ink-muted mt-6 text-xs">{project.repoNote}</p>
        )}
      </header>

      <div className="measure mt-12">{content}</div>

      <nav
        aria-label="Other projects"
        className="border-rule-strong mt-16 flex flex-col gap-4 border-t pt-6 text-xs sm:flex-row sm:justify-between"
      >
        <div>
          {previous !== undefined && (
            <>
              <span className="text-2xs text-ink-muted block">Previous</span>
              <Link href={`/projects/${previous.slug}`}>{displayTitle(previous)}</Link>
            </>
          )}
        </div>
        <div className="sm:text-right">
          {next !== undefined && (
            <>
              <span className="text-2xs text-ink-muted block">Next</span>
              <Link href={`/projects/${next.slug}`}>{displayTitle(next)}</Link>
            </>
          )}
        </div>
      </nav>
    </article>
  );
}

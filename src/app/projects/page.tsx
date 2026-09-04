import type { Metadata } from 'next';
import { Section } from '@/components/Section';
import { ProjectList } from '@/components/ProjectList';
import { RepositoryList } from '@/components/RepositoryList';
import { getAllDomains, getAllProjects, toProjectCard } from '@/lib/projects';
import { absoluteUrl } from '@/lib/site';

// Counted at build time rather than typed out, for the same reason the home
// page derives its link label: a number in prose goes stale silently.
const projectCount = getAllProjects().length;

export const metadata: Metadata = {
  title: 'Work',
  description:
    `${projectCount} data and ML projects, from a 273-module video pipeline with a 185-function ` +
    'test suite to a 10-table clinical schema in third normal form.',
  alternates: { canonical: absoluteUrl('/projects') },
};

export default function ProjectsPage() {
  const projects = getAllProjects().map(toProjectCard);

  return (
    <Section marker="Work">
      <h1 className="text-3xl">Work</h1>
      <p className="measure mt-3 text-lg">
        Each one opens with the problem it solves rather than the stack it uses.
      </p>
      <div className="mt-10">
        <ProjectList projects={projects} domains={getAllDomains()} />
      </div>

      {/*
        The rest of the account. Five projects have case studies; these are the
        other public repositories that show work, one line each, so the list is
        scannable rather than readable. What is left out and why is documented in
        src/content/repositories.ts, because the omissions are the harder half of
        the decision.
      */}
      <div className="border-rule mt-16 border-t pt-10">
        <h2 className="text-xl">Other repositories</h2>
        <p className="measure text-ink-muted mt-3 text-xs">
          Smaller work, written up in a line each. Coursework and personal projects,
          linked rather than summarised.
        </p>
        <RepositoryList />
      </div>
    </Section>
  );
}

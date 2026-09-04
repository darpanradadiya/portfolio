import type { Metadata } from 'next';
import { Section } from '@/components/Section';
import { ProjectList } from '@/components/ProjectList';
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
    </Section>
  );
}

import type { Metadata } from 'next';
import { Section } from '@/components/Section';
import { ProjectList } from '@/components/ProjectList';
import { getAllDomains, getAllProjects, toProjectCard } from '@/lib/projects';
import { absoluteUrl } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Work',
  description:
    'Six data and ML projects, from a 270-module video pipeline with a 185-function test suite to a 10-table clinical schema in third normal form.',
  alternates: { canonical: absoluteUrl('/projects') },
};

export default function ProjectsPage() {
  const projects = getAllProjects().map(toProjectCard);

  return (
    <Section marker="Work">
      <h1 className="text-3xl">Work</h1>
      <p className="measure mt-3 text-lg">
        Three case studies carry the weight; the rest are listed. Each one opens with the
        problem it solves rather than the stack it uses.
      </p>
      <div className="mt-10">
        <ProjectList projects={projects} domains={getAllDomains()} />
      </div>
    </Section>
  );
}
